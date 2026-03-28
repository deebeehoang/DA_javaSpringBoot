package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Candidate;
import com.example.DA_WebTuyenDungViecLam.entity.Employer;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.CandidateRepository;
import com.example.DA_WebTuyenDungViecLam.repository.EmployerRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final EmployerRepository employerRepository;

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        User user = getUser(authentication);

        // Delete old avatar if exists
        fileStorageService.deleteFile(user.getAvatarUrl());

        String url = fileStorageService.uploadAvatar(file);
        user.setAvatarUrl(url);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("url", url), "Upload avatar thành công"));
    }

    @PostMapping(value = "/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCV(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        User user = getUser(authentication);
        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile không tồn tại"));

        // Delete old CV if exists
        fileStorageService.deleteFile(candidate.getCvUrl());

        String url = fileStorageService.uploadCV(file);
        candidate.setCvUrl(url);
        candidateRepository.save(candidate);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("url", url), "Upload CV thành công"));
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadLogo(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        User user = getUser(authentication);
        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile không tồn tại"));

        // Delete old logo if exists
        fileStorageService.deleteFile(employer.getLogoUrl());

        String url = fileStorageService.uploadAvatar(file); // same image validation as avatar
        employer.setLogoUrl(url);
        employerRepository.save(employer);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("url", url), "Upload logo thành công"));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
    }
}
