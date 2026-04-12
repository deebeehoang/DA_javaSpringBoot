package com.example.DA_WebTuyenDungViecLam.repository;

import com.example.DA_WebTuyenDungViecLam.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    Page<Review> findByEmployerIdOrderByCreatedAtDesc(Long employerId, Pageable pageable);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.employer.id = :employerId")
    Double averageRatingByEmployerId(@Param("employerId") Long employerId);

    long countByEmployerId(Long employerId);
}
