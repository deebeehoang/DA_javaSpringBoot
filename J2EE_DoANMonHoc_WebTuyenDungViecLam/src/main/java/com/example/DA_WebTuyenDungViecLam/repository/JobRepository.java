package com.example.DA_WebTuyenDungViecLam.repository;

import com.example.DA_WebTuyenDungViecLam.entity.Job;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = :status " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR j.category.id = :categoryId) " +
           "AND (:city IS NULL OR LOWER(j.city) = LOWER(:city)) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType)")
    Page<Job> searchJobs(
            @Param("status") JobStatus status,
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("city") String city,
            @Param("jobType") com.example.DA_WebTuyenDungViecLam.enums.JobType jobType,
            Pageable pageable);

    Page<Job> findByEmployerId(Long employerId, Pageable pageable);

    long countByStatus(JobStatus status);
}
