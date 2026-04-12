package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.ReviewRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerRatingResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.ReviewResponse;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.CandidateRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication
    ) {
        Long candidateId = getCandidateId(authentication);
        ReviewResponse review = reviewService.create(request, candidateId);
        return ResponseEntity.ok(ApiResponse.success(review, "Đánh giá thành công"));
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Boolean>> hasReviewed(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        Long candidateId = getCandidateId(authentication);
        return ResponseEntity.ok(ApiResponse.success(reviewService.hasReviewed(candidateId, jobId)));
    }

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getByEmployer(
            @PathVariable Long employerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReviewResponse> reviews = reviewService.getByEmployer(employerId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/employer/{employerId}/rating")
    public ResponseEntity<ApiResponse<EmployerRatingResponse>> getEmployerRating(
            @PathVariable Long employerId
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getEmployerRating(employerId)));
    }

    private Long getCandidateId(Authentication authentication) {
        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        var candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile không tồn tại"));
        return candidate.getId();
    }
}
