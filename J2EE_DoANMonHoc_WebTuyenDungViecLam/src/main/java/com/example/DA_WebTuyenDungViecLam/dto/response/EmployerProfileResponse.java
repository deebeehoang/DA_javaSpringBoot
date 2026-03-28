package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerProfileResponse {
    private Long id;
    private UserResponse user;
    private String companyName;
    private String companyType;
    private String companySize;
    private String description;
    private String website;
    private String address;
    private String city;
    private String logoUrl;
    private String industry;
    private Boolean isVerified;
    private String createdAt;
    private String updatedAt;
}
