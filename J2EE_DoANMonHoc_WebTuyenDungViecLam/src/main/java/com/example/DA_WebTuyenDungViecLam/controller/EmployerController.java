package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.EmployerProfileRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerProfileResponse;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.ApplicationRepository;
import com.example.DA_WebTuyenDungViecLam.repository.EmployerRepository;
import com.example.DA_WebTuyenDungViecLam.repository.JobRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.EmployerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employers")
@PreAuthorize("hasRole('EMPLOYER')")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerService employerService;
    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<EmployerProfileResponse>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(employerService.getProfile(auth.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<EmployerProfileResponse>> updateProfile(
            Authentication auth,
            @RequestBody EmployerProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(employerService.updateProfile(auth.getName(), request)));
    }

    @GetMapping("/stats/chart")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChartStats(Authentication auth) {
        Long employerId = getEmployerId(auth);
        LocalDateTime since = LocalDateTime.now().minusMonths(6);

        Map<String, Object> chart = new HashMap<>();
        chart.put("applicationsByMonth", toMonthlyList(applicationRepository.countByEmployerAndMonth(employerId, since)));
        chart.put("jobsByMonth", toMonthlyList(jobRepository.countByEmployerIdAndMonth(employerId, since)));
        chart.put("totalJobs", jobRepository.countByEmployerId(employerId));
        chart.put("totalApplications", applicationRepository.countByJobEmployerId(employerId));
        return ResponseEntity.ok(ApiResponse.success(chart));
    }

    private Long getEmployerId(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        var employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer không tồn tại"));
        return employer.getId();
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
