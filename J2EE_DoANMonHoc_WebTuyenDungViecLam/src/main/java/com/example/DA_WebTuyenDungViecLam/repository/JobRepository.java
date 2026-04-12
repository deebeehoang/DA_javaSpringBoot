package com.example.DA_WebTuyenDungViecLam.repository;

import com.example.DA_WebTuyenDungViecLam.entity.Job;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = :status " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR j.category.id = :categoryId) " +
           "AND (:city IS NULL OR LOWER(j.city) = LOWER(:city)) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType) " +
           "AND (:jobLevel IS NULL OR j.jobLevel = :jobLevel) " +
           "AND (:salaryMin IS NULL OR j.salaryMax >= :salaryMin OR j.negotiable = true) " +
           "AND (:salaryMax IS NULL OR j.salaryMin <= :salaryMax OR j.negotiable = true)")
    Page<Job> searchJobs(
            @Param("status") JobStatus status,
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("city") String city,
            @Param("jobType") com.example.DA_WebTuyenDungViecLam.enums.JobType jobType,
            @Param("jobLevel") com.example.DA_WebTuyenDungViecLam.enums.JobLevel jobLevel,
            @Param("salaryMin") Long salaryMin,
            @Param("salaryMax") Long salaryMax,
            Pageable pageable);

    @Query("SELECT DISTINCT j.title FROM Job j WHERE j.status = 'OPEN' " +
           "AND LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY j.title")
    List<String> suggestTitles(@Param("q") String q, Pageable pageable);

    Page<Job> findByEmployerId(Long employerId, Pageable pageable);

    long countByStatus(JobStatus status);

    long countByEmployerId(Long employerId);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as cnt " +
           "FROM jobs WHERE created_at >= :since GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month",
           nativeQuery = true)
    List<Object[]> countByMonth(@Param("since") LocalDateTime since);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as cnt " +
           "FROM jobs WHERE employer_id = :employerId AND created_at >= :since " +
           "GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month",
           nativeQuery = true)
    List<Object[]> countByEmployerIdAndMonth(@Param("employerId") Long employerId, @Param("since") LocalDateTime since);
}
