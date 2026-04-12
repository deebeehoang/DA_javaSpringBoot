package com.example.DA_WebTuyenDungViecLam.repository;

import com.example.DA_WebTuyenDungViecLam.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByCandidateIdAndJobId(Long candidateId, Long jobId);

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    List<Application> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    List<Application> findByJobEmployerIdOrderByAppliedAtDesc(Long employerId);

    long countByJobId(Long jobId);

    @Query(value = "SELECT DATE_FORMAT(applied_at, '%Y-%m') as month, COUNT(*) as cnt " +
           "FROM applications WHERE applied_at >= :since GROUP BY DATE_FORMAT(applied_at, '%Y-%m') ORDER BY month",
           nativeQuery = true)
    List<Object[]> countByMonth(@Param("since") LocalDateTime since);

    @Query(value = "SELECT DATE_FORMAT(a.applied_at, '%Y-%m') as month, COUNT(*) as cnt " +
           "FROM applications a JOIN jobs j ON a.job_id = j.id " +
           "WHERE j.employer_id = :employerId AND a.applied_at >= :since " +
           "GROUP BY DATE_FORMAT(a.applied_at, '%Y-%m') ORDER BY month",
           nativeQuery = true)
    List<Object[]> countByEmployerAndMonth(@Param("employerId") Long employerId, @Param("since") LocalDateTime since);

    long countByJobEmployerId(Long employerId);
}
