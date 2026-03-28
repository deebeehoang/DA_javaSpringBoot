package com.example.DA_WebTuyenDungViecLam.entity.ids;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class JobSkillId implements Serializable {

    private Long jobId;
    private Integer skillId;

    public JobSkillId() {}

    public JobSkillId(Long jobId, Integer skillId) {
        this.jobId = jobId;
        this.skillId = skillId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof JobSkillId)) return false;
        JobSkillId that = (JobSkillId) o;
        return Objects.equals(jobId, that.jobId)
                && Objects.equals(skillId, that.skillId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobId, skillId);
    }
}
