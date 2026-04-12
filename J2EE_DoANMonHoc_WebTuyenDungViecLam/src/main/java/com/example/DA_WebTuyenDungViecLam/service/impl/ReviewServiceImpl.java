package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.request.ReviewRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerRatingResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.ReviewResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Application;
import com.example.DA_WebTuyenDungViecLam.entity.Candidate;
import com.example.DA_WebTuyenDungViecLam.entity.Job;
import com.example.DA_WebTuyenDungViecLam.entity.Review;
import com.example.DA_WebTuyenDungViecLam.enums.ApplicationStatus;
import com.example.DA_WebTuyenDungViecLam.exception.DuplicateResourceException;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.exception.UnauthorizedException;
import com.example.DA_WebTuyenDungViecLam.repository.*;
import com.example.DA_WebTuyenDungViecLam.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final Set<ApplicationStatus> REVIEWABLE = Set.of(ApplicationStatus.APPROVED, ApplicationStatus.REJECTED);

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest request, Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ứng viên"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc #" + request.getJobId()));

        // Check applied
        Application application = applicationRepository.findByCandidateIdAndJobId(candidateId, request.getJobId())
                .orElseThrow(() -> new UnauthorizedException("Bạn chưa ứng tuyển công việc này"));

        // Check status
        if (!REVIEWABLE.contains(application.getStatus())) {
            throw new UnauthorizedException("Chỉ được đánh giá khi đơn đã được xử lý (Chấp nhận hoặc Từ chối)");
        }

        // Check duplicate
        if (reviewRepository.existsByCandidateIdAndJobId(candidateId, request.getJobId())) {
            throw new DuplicateResourceException("Bạn đã đánh giá công việc này rồi");
        }

        Review review = Review.builder()
                .candidate(candidate)
                .employer(job.getEmployer())
                .job(job)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);
        return toResponse(review);
    }

    @Override
    public Page<ReviewResponse> getByEmployer(Long employerId, Pageable pageable) {
        if (!employerRepository.existsById(employerId)) {
            throw new ResourceNotFoundException("Không tìm thấy nhà tuyển dụng #" + employerId);
        }
        return reviewRepository.findByEmployerIdOrderByCreatedAtDesc(employerId, pageable)
                .map(this::toResponse);
    }

    @Override
    public EmployerRatingResponse getEmployerRating(Long employerId) {
        var employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà tuyển dụng #" + employerId));

        Double avg = reviewRepository.averageRatingByEmployerId(employerId);
        long total = reviewRepository.countByEmployerId(employerId);

        return EmployerRatingResponse.builder()
                .employerId(employerId)
                .companyName(employer.getCompanyName())
                .averageRating(Math.round(avg * 10) / 10.0)
                .totalReviews(total)
                .build();
    }

    @Override
    public boolean hasReviewed(Long candidateId, Long jobId) {
        return reviewRepository.existsByCandidateIdAndJobId(candidateId, jobId);
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().format(FMT) : null)
                .candidate(ReviewResponse.CandidateInfo.builder()
                        .id(r.getCandidate().getId())
                        .fullName(r.getCandidate().getUser().getFullName())
                        .avatarUrl(r.getCandidate().getUser().getAvatarUrl())
                        .build())
                .job(ReviewResponse.JobInfo.builder()
                        .id(r.getJob().getId())
                        .title(r.getJob().getTitle())
                        .build())
                .build();
    }
}
