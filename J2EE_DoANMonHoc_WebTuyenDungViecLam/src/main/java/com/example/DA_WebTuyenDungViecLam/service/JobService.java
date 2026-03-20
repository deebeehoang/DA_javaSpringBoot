package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.dto.request.JobCreateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.JobUpdateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobService {

    Page<JobResponse> getPublishedJobs(Pageable pageable, String keyword, Integer categoryId, String city, String jobType);

    JobResponse getById(Long id);

    JobResponse create(JobCreateRequest request, Long employerId);

    JobResponse update(Long id, JobUpdateRequest request, Long employerId);

    void delete(Long id, Long employerId);

    Page<JobResponse> getByEmployer(Long employerId, Pageable pageable);

    JobResponse updateStatus(Long id, String status);

    JobResponse updateStatusByEmployer(Long id, String status, Long employerId);
}
