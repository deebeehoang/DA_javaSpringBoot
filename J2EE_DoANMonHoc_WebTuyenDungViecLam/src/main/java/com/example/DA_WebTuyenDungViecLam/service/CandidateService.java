package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.dto.request.CandidateProfileRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.CandidateProfileResponse;

public interface CandidateService {
    CandidateProfileResponse getProfile(String email);
    CandidateProfileResponse updateProfile(String email, CandidateProfileRequest request);
}
