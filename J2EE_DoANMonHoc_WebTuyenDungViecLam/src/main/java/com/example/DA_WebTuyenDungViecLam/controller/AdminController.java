package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.CategoryRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.StatusUpdateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.CategoryResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.DashboardStatsResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.JobResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.UserResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Category;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import com.example.DA_WebTuyenDungViecLam.enums.UserRole;
import com.example.DA_WebTuyenDungViecLam.enums.UserStatus;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.ApplicationRepository;
import com.example.DA_WebTuyenDungViecLam.repository.CategoryRepository;
import com.example.DA_WebTuyenDungViecLam.repository.JobRepository;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CategoryRepository categoryRepository;
    private final JobService jobService;

    // ==================== DASHBOARD STATS ====================

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalEmployers(userRepository.countByRole(UserRole.EMPLOYER))
                .totalCandidates(userRepository.countByRole(UserRole.CANDIDATE))
                .totalJobs(jobRepository.count())
                .openJobs(jobRepository.countByStatus(JobStatus.OPEN))
                .totalApplications(applicationRepository.count())
                .totalCategories(categoryRepository.count())
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserResponse> data;

        if (role != null && !role.isBlank()) {
            List<UserRole> roles = List.of(UserRole.valueOf(role.toUpperCase()));
            data = userRepository.findByRoleIn(roles, pageable).map(this::toUserResponse);
        } else {
            data = userRepository.findAll(pageable).map(this::toUserResponse);
        }

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        user.setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(user)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa user thành công"));
    }

    // ==================== JOB MANAGEMENT ====================

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<JobResponse> data;

        if (status != null && !status.isBlank()) {
            data = jobRepository.findByStatus(JobStatus.valueOf(status.toUpperCase()), pageable)
                    .map(job -> jobService.getById(job.getId()));
        } else {
            data = jobRepository.findAll(pageable)
                    .map(job -> jobService.getById(job.getId()));
        }

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PatchMapping("/jobs/{id}/status")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.updateStatus(id, request.getStatus())));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        var job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job không tồn tại"));
        jobRepository.delete(job);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa job thành công"));
    }

    // ==================== CATEGORY MANAGEMENT ====================

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> list = categoryRepository.findAll(Sort.by("id")).stream()
                .map(this::toCategoryResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .icon(request.getIcon())
                .description(request.getDescription())
                .active(true)
                .build();
        category = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(toCategoryResponse(category), "Tạo danh mục thành công"));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody CategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        category = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(toCategoryResponse(category)));
    }

    @PatchMapping("/categories/{id}/toggle")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleCategory(@PathVariable Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));

        category.setActive(!category.getActive());
        category = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(toCategoryResponse(category)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        categoryRepository.delete(category);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa danh mục thành công"));
    }

    // ==================== MAPPERS ====================

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }

    private CategoryResponse toCategoryResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .icon(c.getIcon())
                .description(c.getDescription())
                .active(c.getActive())
                .build();
    }
}
