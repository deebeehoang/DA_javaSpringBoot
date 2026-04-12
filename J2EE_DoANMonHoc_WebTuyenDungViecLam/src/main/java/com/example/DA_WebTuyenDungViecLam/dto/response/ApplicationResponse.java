package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {

    private Long id;
    private CandidateInfo candidate;
    private JobInfo job;
    private String status;
    private String coverLetter;
    private String cvUrl;
    private Boolean cvViewed;
    private String cvViewedAt;
    private String appliedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateInfo {
        private Long id;
        private UserInfo user;
        private String cvUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String avatarUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobInfo {
        private Long id;
        private String title;
        private Long salaryMin;
        private Long salaryMax;
        private String city;
        private String location;
        private EmployerInfo employer;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmployerInfo {
        private Long id;
        private String companyName;
        private String logoUrl;
    }
}
