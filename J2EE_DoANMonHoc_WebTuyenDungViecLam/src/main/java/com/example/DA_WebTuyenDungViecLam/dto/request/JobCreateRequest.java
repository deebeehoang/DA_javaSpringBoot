package com.example.DA_WebTuyenDungViecLam.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCreateRequest {

    @NotBlank(message = "Tiêu đề không được trống")
    private String title;

    @NotBlank(message = "Mô tả không được trống")
    private String description;

    private String requirements;
    private String benefits;

    @NotBlank(message = "Loại công việc không được trống")
    private String jobType; // FULL_TIME, PART_TIME, FREELANCE, INTERNSHIP

    private String jobLevel; // INTERN, FRESHER, JUNIOR, SENIOR, MANAGER, ANY

    private Long salaryMin;
    private Long salaryMax;
    private Boolean negotiable;

    @NotBlank(message = "Địa chỉ không được trống")
    private String location;

    @NotBlank(message = "Thành phố không được trống")
    private String city;

    private Double latitude;
    private Double longitude;

    private Integer positions;
    private LocalDate deadline;

    @NotNull(message = "Danh mục không được trống")
    private Integer categoryId;
}
