package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerResponse {

    private Long id;
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
}
