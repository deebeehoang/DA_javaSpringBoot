package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {

    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String benefits;
    private String jobType;
    private String jobLevel;
    private String status;
    private Long salaryMin;
    private Long salaryMax;
    private Boolean negotiable;
    private String location;
    private String city;
    private Integer positions;
    private String deadline;
    private Integer views;
    private Long applicationCount;
    private CategoryResponse category;
    private EmployerResponse employer;
    private String createdAt;
    private String updatedAt;
}
