package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.request.CandidateProfileRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.CandidateProfileResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.UserResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Candidate;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.enums.EducationLevel;
import com.example.DA_WebTuyenDungViecLam.enums.Gender;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.CandidateRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;

    @Override
    public CandidateProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile ứng viên không tồn tại"));
        return toResponse(candidate);
    }

    @Override
    @Transactional
    public CandidateProfileResponse updateProfile(String email, CandidateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile ứng viên không tồn tại"));

        if (request.getDateOfBirth() != null) candidate.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        if (request.getGender() != null) candidate.setGender(Gender.valueOf(request.getGender()));
        if (request.getCity() != null) candidate.setCity(request.getCity());
        if (request.getEducationLevel() != null) candidate.setEducationLevel(EducationLevel.valueOf(request.getEducationLevel()));
        if (request.getYearsOfExperience() != null) candidate.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getExpectedSalaryMin() != null) candidate.setExpectedSalaryMin(request.getExpectedSalaryMin());
        if (request.getExpectedSalaryMax() != null) candidate.setExpectedSalaryMax(request.getExpectedSalaryMax());
        if (request.getBio() != null) candidate.setBio(request.getBio());
        if (request.getCvUrl() != null) candidate.setCvUrl(request.getCvUrl());

        candidate = candidateRepository.save(candidate);
        return toResponse(candidate);
    }

    private CandidateProfileResponse toResponse(Candidate c) {
        User u = c.getUser();
        return CandidateProfileResponse.builder()
                .id(c.getId())
                .user(UserResponse.builder()
                        .id(u.getId()).email(u.getEmail())
                        .fullName(u.getFullName()).phone(u.getPhone())
                        .avatarUrl(u.getAvatarUrl()).role(u.getRole().name())
                        .status(u.getStatus().name())
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .build())
                .dateOfBirth(c.getDateOfBirth() != null ? c.getDateOfBirth().toString() : null)
                .gender(c.getGender() != null ? c.getGender().name() : null)
                .city(c.getCity())
                .educationLevel(c.getEducationLevel() != null ? c.getEducationLevel().name() : null)
                .yearsOfExperience(c.getYearsOfExperience())
                .expectedSalaryMin(c.getExpectedSalaryMin())
                .expectedSalaryMax(c.getExpectedSalaryMax())
                .bio(c.getBio())
                .cvUrl(c.getCvUrl())
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .updatedAt(c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null)
                .build();
    }
}
