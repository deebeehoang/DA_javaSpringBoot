package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileResponse {
    private Long id;
    private UserResponse user;
    private String dateOfBirth;
    private String gender;
    private String city;
    private String educationLevel;
    private Integer yearsOfExperience;
    private Long expectedSalaryMin;
    private Long expectedSalaryMax;
    private String bio;
    private String cvUrl;
    private String createdAt;
    private String updatedAt;
}
