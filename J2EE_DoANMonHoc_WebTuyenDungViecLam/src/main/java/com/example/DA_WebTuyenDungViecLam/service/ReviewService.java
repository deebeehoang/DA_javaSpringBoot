package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.dto.request.ReviewRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerRatingResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponse create(ReviewRequest request, Long candidateId);

    Page<ReviewResponse> getByEmployer(Long employerId, Pageable pageable);

    EmployerRatingResponse getEmployerRating(Long employerId);

    boolean hasReviewed(Long candidateId, Long jobId);
}
