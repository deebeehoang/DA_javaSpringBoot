package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String comment;
    private String createdAt;

    private CandidateInfo candidate;
    private JobInfo job;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateInfo {
        private Long id;
        private String fullName;
        private String avatarUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobInfo {
        private Long id;
        private String title;
    }
}
