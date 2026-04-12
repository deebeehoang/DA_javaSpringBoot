package com.example.DA_WebTuyenDungViecLam.entity;

import com.example.DA_WebTuyenDungViecLam.enums.ApplicationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "applications",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"candidate_id", "job_id"})
    }
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "cv_url", length = 500)
    private String cvUrl;

    @Column(name = "cv_viewed")
    private Boolean cvViewed = false;

    @Column(name = "cv_viewed_at")
    private LocalDateTime cvViewedAt;

    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @PrePersist
    protected void onCreate() {
        this.appliedAt = LocalDateTime.now();
    }
}
