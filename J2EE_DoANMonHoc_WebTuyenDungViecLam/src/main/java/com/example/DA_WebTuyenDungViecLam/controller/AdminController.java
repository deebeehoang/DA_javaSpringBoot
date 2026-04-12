package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.CategoryRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.SkillRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.StatusUpdateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.CategoryResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.DashboardStatsResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.JobResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.UserResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Category;
import com.example.DA_WebTuyenDungViecLam.entity.Skill;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import com.example.DA_WebTuyenDungViecLam.enums.SkillCategory;
import com.example.DA_WebTuyenDungViecLam.enums.UserRole;
import com.example.DA_WebTuyenDungViecLam.enums.UserStatus;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.ApplicationRepository;
import com.example.DA_WebTuyenDungViecLam.repository.CategoryRepository;
import com.example.DA_WebTuyenDungViecLam.repository.JobRepository;
import com.example.DA_WebTuyenDungViecLam.repository.SkillRepository;
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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;
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

    // ==================== SKILL MANAGEMENT ====================

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllSkills(
            @RequestParam(required = false) String category) {
        List<Skill> skills;
        if (category != null && !category.isBlank()) {
            skills = skillRepository.findByCategory(SkillCategory.valueOf(category.toUpperCase()));
        } else {
            skills = skillRepository.findAll(Sort.by("id"));
        }
        List<Map<String, Object>> list = skills.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getName());
            m.put("category", s.getCategory().name());
            m.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : null);
            return m;
        }).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createSkill(
            @Valid @RequestBody SkillRequest request) {
        if (skillRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("K\u1ef9 n\u0103ng \u0111\u00e3 t\u1ed3n t\u1ea1i"));
        }
        Skill skill = Skill.builder()
                .name(request.getName())
                .category(request.getCategory() != null
                        ? SkillCategory.valueOf(request.getCategory().toUpperCase())
                        : SkillCategory.OTHER)
                .build();
        skill = skillRepository.save(skill);
        Map<String, Object> m = new HashMap<>();
        m.put("id", skill.getId());
        m.put("name", skill.getName());
        m.put("category", skill.getCategory().name());
        return ResponseEntity.ok(ApiResponse.success(m, "T\u1ea1o k\u1ef9 n\u0103ng th\u00e0nh c\u00f4ng"));
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSkill(
            @PathVariable Integer id,
            @Valid @RequestBody SkillRequest request) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("K\u1ef9 n\u0103ng kh\u00f4ng t\u1ed3n t\u1ea1i"));
        skill.setName(request.getName());
        if (request.getCategory() != null) {
            skill.setCategory(SkillCategory.valueOf(request.getCategory().toUpperCase()));
        }
        skill = skillRepository.save(skill);
        Map<String, Object> m = new HashMap<>();
        m.put("id", skill.getId());
        m.put("name", skill.getName());
        m.put("category", skill.getCategory().name());
        return ResponseEntity.ok(ApiResponse.success(m));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable Integer id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("K\u1ef9 n\u0103ng kh\u00f4ng t\u1ed3n t\u1ea1i"));
        skillRepository.delete(skill);
        return ResponseEntity.ok(ApiResponse.success(null, "X\u00f3a k\u1ef9 n\u0103ng th\u00e0nh c\u00f4ng"));
    }

    // ==================== CHART STATS ====================

    @GetMapping("/stats/chart")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChartStats() {
        LocalDateTime since = LocalDateTime.now().minusMonths(6);

        Map<String, Object> chart = new HashMap<>();
        chart.put("jobsByMonth", toMonthlyList(jobRepository.countByMonth(since)));
        chart.put("applicationsByMonth", toMonthlyList(applicationRepository.countByMonth(since)));
        chart.put("usersByMonth", toMonthlyList(userRepository.countByMonth(since)));
        return ResponseEntity.ok(ApiResponse.success(chart));
    }

    private List<Map<String, Object>> toMonthlyList(List<Object[]> rows) {
        return rows.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("month", r[0]);
            m.put("count", ((Number) r[1]).longValue());
            return m;
        }).toList();
    }
}
