package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.request.EmployerProfileRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerProfileResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.UserResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Employer;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.enums.CompanySize;
import com.example.DA_WebTuyenDungViecLam.enums.CompanyType;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.EmployerRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.EmployerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployerServiceImpl implements EmployerService {

    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;

    @Override
    public EmployerProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile nhà tuyển dụng không tồn tại"));
        return toResponse(employer);
    }

    @Override
    @Transactional
    public EmployerProfileResponse updateProfile(String email, EmployerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile nhà tuyển dụng không tồn tại"));

        if (request.getCompanyName() != null) employer.setCompanyName(request.getCompanyName());
        if (request.getCompanyType() != null) employer.setCompanyType(CompanyType.valueOf(request.getCompanyType()));
        if (request.getCompanySize() != null) employer.setCompanySize(CompanySize.valueOf(request.getCompanySize()));
        if (request.getDescription() != null) employer.setDescription(request.getDescription());
        if (request.getWebsite() != null) employer.setWebsite(request.getWebsite());
        if (request.getAddress() != null) employer.setAddress(request.getAddress());
        if (request.getCity() != null) employer.setCity(request.getCity());
        if (request.getLogoUrl() != null) employer.setLogoUrl(request.getLogoUrl());
        if (request.getIndustry() != null) employer.setIndustry(request.getIndustry());

        employer = employerRepository.save(employer);
        return toResponse(employer);
    }

    private EmployerProfileResponse toResponse(Employer e) {
        User u = e.getUser();
        return EmployerProfileResponse.builder()
                .id(e.getId())
                .user(UserResponse.builder()
                        .id(u.getId()).email(u.getEmail())
                        .fullName(u.getFullName()).phone(u.getPhone())
                        .avatarUrl(u.getAvatarUrl()).role(u.getRole().name())
                        .status(u.getStatus().name())
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .build())
                .companyName(e.getCompanyName())
                .companyType(e.getCompanyType() != null ? e.getCompanyType().name() : null)
                .companySize(e.getCompanySize() != null ? e.getCompanySize().name() : null)
                .description(e.getDescription())
                .website(e.getWebsite())
                .address(e.getAddress())
                .city(e.getCity())
                .logoUrl(e.getLogoUrl())
                .industry(e.getIndustry())
                .isVerified(e.getIsVerified())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}
