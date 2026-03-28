package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.dto.request.EmployerProfileRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerProfileResponse;

public interface EmployerService {
    EmployerProfileResponse getProfile(String email);
    EmployerProfileResponse updateProfile(String email, EmployerProfileRequest request);
}
