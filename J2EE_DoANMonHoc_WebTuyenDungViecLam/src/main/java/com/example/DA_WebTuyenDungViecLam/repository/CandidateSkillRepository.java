package com.example.DA_WebTuyenDungViecLam.repository;

import com.example.DA_WebTuyenDungViecLam.entity.CandidateSkill;
import com.example.DA_WebTuyenDungViecLam.entity.ids.CandidateSkillId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, CandidateSkillId> {

    List<CandidateSkill> findByCandidateId(Long candidateId);
}
