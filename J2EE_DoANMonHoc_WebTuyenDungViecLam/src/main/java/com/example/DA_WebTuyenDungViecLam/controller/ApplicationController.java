package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.ApplicationRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.StatusUpdateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApplicationResponse;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.CandidateRepository;
import com.example.DA_WebTuyenDungViecLam.repository.EmployerRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final EmployerRepository employerRepository;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @Valid @RequestBody ApplicationRequest request,
            Authentication authentication) {

        Long candidateId = getCandidateId(authentication);
        return ResponseEntity.ok(
                ApiResponse.success(applicationService.apply(request, candidateId), "Ứng tuyển thành công"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> myApplications(Authentication authentication) {
        Long candidateId = getCandidateId(authentication);
        return ResponseEntity.ok(ApiResponse.success(applicationService.getByCandidate(candidateId)));
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Boolean>> checkApplied(
            @PathVariable Long jobId,
            Authentication authentication) {
        Long candidateId = getCandidateId(authentication);
        return ResponseEntity.ok(ApiResponse.success(applicationService.hasApplied(candidateId, jobId)));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> byJob(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getByJob(jobId)));
    }

    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> byEmployer(Authentication authentication) {
        Long employerId = getEmployerId(authentication);
        return ResponseEntity.ok(ApiResponse.success(applicationService.getByEmployer(employerId)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        Long employerId = getEmployerId(authentication);
        return ResponseEntity.ok(
                ApiResponse.success(applicationService.updateStatus(id, request.getStatus(), employerId)));
    }

    @PatchMapping("/{id}/view")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> markCvViewed(
            @PathVariable Long id,
            Authentication authentication) {

        Long employerId = getEmployerId(authentication);
        return ResponseEntity.ok(
                ApiResponse.success(applicationService.markCvViewed(id, employerId), "Đã đánh dấu CV đã xem"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @PathVariable Long id,
            Authentication authentication) {
        Long candidateId = getCandidateId(authentication);
        applicationService.withdraw(id, candidateId);
        return ResponseEntity.ok(ApiResponse.success(null, "Rút đơn ứng tuyển thành công"));
    }

    private Long getCandidateId(Authentication authentication) {
        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        var candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile không tồn tại"));
        return candidate.getId();
    }

    private Long getEmployerId(Authentication authentication) {
        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        var employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile không tồn tại"));
        return employer.getId();
    }
}
