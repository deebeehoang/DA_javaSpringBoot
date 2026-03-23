package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.request.ApplicationRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApplicationResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Application;
import com.example.DA_WebTuyenDungViecLam.entity.Candidate;
import com.example.DA_WebTuyenDungViecLam.entity.Job;
import com.example.DA_WebTuyenDungViecLam.enums.ApplicationStatus;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import com.example.DA_WebTuyenDungViecLam.enums.NotificationType;
import com.example.DA_WebTuyenDungViecLam.exception.DuplicateResourceException;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.exception.UnauthorizedException;
import com.example.DA_WebTuyenDungViecLam.repository.ApplicationRepository;
import com.example.DA_WebTuyenDungViecLam.repository.CandidateRepository;
import com.example.DA_WebTuyenDungViecLam.repository.JobRepository;
import com.example.DA_WebTuyenDungViecLam.service.ApplicationService;
import com.example.DA_WebTuyenDungViecLam.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ApplicationResponse apply(ApplicationRequest request, Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate không tồn tại"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job không tồn tại"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new UnauthorizedException("Job này hiện không nhận ứng tuyển");
        }

        if (applicationRepository.existsByCandidateIdAndJobId(candidateId, request.getJobId())) {
            throw new DuplicateResourceException("Bạn đã ứng tuyển job này rồi");
        }

        Application app = new Application();
        app.setCandidate(candidate);
        app.setJob(job);
        app.setStatus(ApplicationStatus.PENDING);
        app.setCoverLetter(request.getCoverLetter());

        app = applicationRepository.save(app);

        // Notify employer
        Long employerUserId = job.getEmployer().getUser().getId();
        String candidateName = candidate.getUser().getFullName();
        notificationService.create(
                employerUserId,
                NotificationType.APPLICATION,
                "Ứng tuyển mới",
                candidateName + " đã ứng tuyển vào vị trí \"" + job.getTitle() + "\"",
                "/employer/applications"
        );

        // Notify candidate (xác nhận đã ứng tuyển thành công)
        Long candidateUserId = candidate.getUser().getId();
        String companyName = job.getEmployer().getCompanyName();
        notificationService.create(
                candidateUserId,
                NotificationType.APPLICATION,
                "Ứng tuyển thành công",
                "Bạn đã ứng tuyển thành công vào vị trí \"" + job.getTitle() + "\" tại " + companyName,
                "/candidate/applications"
        );

        return toResponse(app);
    }

    @Override
    public List<ApplicationResponse> getByCandidate(Long candidateId) {
        return applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidateId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ApplicationResponse> getByJob(Long jobId) {
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ApplicationResponse> getByEmployer(Long employerId) {
        return applicationRepository.findByJobEmployerIdOrderByAppliedAtDesc(employerId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(Long applicationId, String status, Long employerId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application không tồn tại"));

        if (!app.getJob().getEmployer().getId().equals(employerId)) {
            throw new UnauthorizedException("Bạn không có quyền cập nhật application này");
        }

        ApplicationStatus newStatus = ApplicationStatus.valueOf(status.toUpperCase());
        app.setStatus(newStatus);
        app = applicationRepository.save(app);

        // Notify candidate về thay đổi trạng thái
        Long candidateUserId = app.getCandidate().getUser().getId();
        String jobTitle = app.getJob().getTitle();
        String companyName = app.getJob().getEmployer().getCompanyName();
        String statusText = switch (newStatus) {
            case APPROVED -> "được chấp nhận";
            case REJECTED -> "bị từ chối";
            case INTERVIEW -> "được mời phỏng vấn";
            default -> "được cập nhật";
        };
        notificationService.create(
                candidateUserId,
                NotificationType.JOB_UPDATE,
                "Cập nhật đơn ứng tuyển",
                "Đơn ứng tuyển vị trí \"" + jobTitle + "\" tại " + companyName + " đã " + statusText,
                "/candidate/applications"
        );

        return toResponse(app);
    }

    @Override
    @Transactional
    public void withdraw(Long applicationId, Long candidateId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy application #" + applicationId));

        if (!app.getCandidate().getId().equals(candidateId)) {
            throw new UnauthorizedException("Bạn không có quyền rút đơn này");
        }

        applicationRepository.delete(app);
    }

    private ApplicationResponse toResponse(Application app) {
        var user = app.getCandidate().getUser();
        return ApplicationResponse.builder()
                .id(app.getId())
                .candidate(ApplicationResponse.CandidateInfo.builder()
                        .id(app.getCandidate().getId())
                        .cvUrl(app.getCandidate().getCvUrl())
                        .user(ApplicationResponse.UserInfo.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .phone(user.getPhone())
                                .avatarUrl(user.getAvatarUrl())
                                .build())
                        .build())
                .job(ApplicationResponse.JobInfo.builder()
                        .id(app.getJob().getId())
                        .title(app.getJob().getTitle())
                        .employer(ApplicationResponse.EmployerInfo.builder()
                                .id(app.getJob().getEmployer().getId())
                                .companyName(app.getJob().getEmployer().getCompanyName())
                                .logoUrl(app.getJob().getEmployer().getLogoUrl())
                                .build())
                        .build())
                .status(app.getStatus().name())
                .coverLetter(app.getCoverLetter())
                .appliedAt(app.getAppliedAt() != null ? app.getAppliedAt().toString() : null)
                .build();
    }
}
