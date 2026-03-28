package com.example.DA_WebTuyenDungViecLam.entity.ids;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CandidateSkillId implements Serializable {

    private Long candidateId;
    private Integer skillId;

    public CandidateSkillId() {}

    public CandidateSkillId(Long candidateId, Integer skillId) {
        this.candidateId = candidateId;
        this.skillId = skillId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CandidateSkillId)) return false;
        CandidateSkillId that = (CandidateSkillId) o;
        return Objects.equals(candidateId, that.candidateId)
                && Objects.equals(skillId, that.skillId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidateId, skillId);
    }
}
