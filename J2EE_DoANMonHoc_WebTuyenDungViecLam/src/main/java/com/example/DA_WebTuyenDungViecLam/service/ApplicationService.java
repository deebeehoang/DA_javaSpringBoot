package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.dto.request.ApplicationRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApplicationResponse;

import java.util.List;

public interface ApplicationService {

    ApplicationResponse apply(ApplicationRequest request, Long candidateId);

    List<ApplicationResponse> getByCandidate(Long candidateId);

    List<ApplicationResponse> getByJob(Long jobId);

    List<ApplicationResponse> getByEmployer(Long employerId);

    ApplicationResponse updateStatus(Long applicationId, String status, Long employerId);

    void withdraw(Long applicationId, Long candidateId);
}
