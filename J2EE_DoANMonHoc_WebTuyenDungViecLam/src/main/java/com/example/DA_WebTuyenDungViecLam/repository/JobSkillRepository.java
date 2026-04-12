package com.example.DA_WebTuyenDungViecLam.repository;

import com.example.DA_WebTuyenDungViecLam.entity.JobSkill;
import com.example.DA_WebTuyenDungViecLam.entity.ids.JobSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface JobSkillRepository extends JpaRepository<JobSkill, JobSkillId> {

    List<JobSkill> findByJobId(Long jobId);

    @Query("SELECT js FROM JobSkill js JOIN FETCH js.skill WHERE js.job.id IN :jobIds")
    List<JobSkill> findWithSkillsByJobIdIn(@Param("jobIds") Collection<Long> jobIds);
}
