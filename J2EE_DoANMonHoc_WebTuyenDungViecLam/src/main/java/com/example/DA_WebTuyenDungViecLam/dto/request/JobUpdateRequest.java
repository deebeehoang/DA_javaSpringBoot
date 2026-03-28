package com.example.DA_WebTuyenDungViecLam.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobUpdateRequest {

    private String title;
    private String description;
    private String requirements;
    private String benefits;
    private String jobType;
    private String jobLevel;
    private Long salaryMin;
    private Long salaryMax;
    private Boolean negotiable;
    private String location;
    private String city;
    private Integer positions;
    private LocalDate deadline;
    private Integer categoryId;
}
