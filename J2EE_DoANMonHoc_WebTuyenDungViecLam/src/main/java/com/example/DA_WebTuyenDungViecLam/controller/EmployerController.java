package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.EmployerProfileRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerProfileResponse;
import com.example.DA_WebTuyenDungViecLam.service.EmployerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employers")
@PreAuthorize("hasRole('EMPLOYER')")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerService employerService;

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
}
