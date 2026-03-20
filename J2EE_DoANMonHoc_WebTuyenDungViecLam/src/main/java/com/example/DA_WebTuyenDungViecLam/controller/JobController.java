package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.JobCreateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.JobUpdateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.StatusUpdateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.JobResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Employer;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.EmployerRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String jobType) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<JobResponse> data = jobService.getPublishedJobs(pageable, keyword, categoryId, city, jobType);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobResponse>> create(
            @Valid @RequestBody JobCreateRequest request,
            Authentication authentication) {

        Long employerId = getEmployerId(authentication);
        return ResponseEntity.ok(ApiResponse.success(jobService.create(request, employerId), "Tạo job thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody JobUpdateRequest request,
            Authentication authentication) {

        Long employerId = getEmployerId(authentication);
        return ResponseEntity.ok(ApiResponse.success(jobService.update(id, request, employerId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication authentication) {
        Long employerId = getEmployerId(authentication);
        jobService.delete(id, employerId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa job thành công"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {

        return ResponseEntity.ok(ApiResponse.success(jobService.updateStatus(id, request.getStatus())));
    }

    @PatchMapping("/my/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobResponse>> updateMyJobStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        Long employerId = getEmployerId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
                jobService.updateStatusByEmployer(id, request.getStatus(), employerId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> myJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Long employerId = getEmployerId(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(jobService.getByEmployer(employerId, pageable)));
    }

    private Long getEmployerId(Authentication authentication) {
        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile không tồn tại"));
        return employer.getId();
    }
}
