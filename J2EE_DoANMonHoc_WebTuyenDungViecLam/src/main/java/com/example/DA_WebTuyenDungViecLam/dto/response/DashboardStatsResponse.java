package com.example.DA_WebTuyenDungViecLam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalEmployers;
    private long totalCandidates;
    private long totalJobs;
    private long openJobs;
    private long totalApplications;
    private long totalCategories;
}
