package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.ChangePasswordRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.LoginRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.RegisterRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.AuthResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.UserResponse;
import com.example.DA_WebTuyenDungViecLam.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(data, "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(data, "Đăng nhập thành công"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        UserResponse data = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công"));
    }
}
