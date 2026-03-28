package com.example.DA_WebTuyenDungViecLam.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerProfileRequest {
    private String companyName;
    private String companyType;
    private String companySize;
    private String description;
    private String website;
    private String address;
    private String city;
    private String logoUrl;
    private String industry;
}
