package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.dto.request.LoginRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.RegisterRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.AuthResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String email);
}
