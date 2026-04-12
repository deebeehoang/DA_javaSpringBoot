package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerRatingResponse {
    private Long employerId;
    private String companyName;
    private Double averageRating;
    private Long totalReviews;
}
