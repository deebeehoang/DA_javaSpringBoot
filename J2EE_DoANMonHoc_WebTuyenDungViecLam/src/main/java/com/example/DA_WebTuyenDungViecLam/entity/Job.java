package com.example.DA_WebTuyenDungViecLam.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.DA_WebTuyenDungViecLam.enums.JobLevel;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import com.example.DA_WebTuyenDungViecLam.enums.JobType;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ================== RELATION ================== */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    /* ================== BASIC INFO ================== */

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    /* ================== ENUM ================== */

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_level")
    @Builder.Default
    private JobLevel jobLevel = JobLevel.ANY;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobStatus status = JobStatus.DRAFT;

    /* ================== SALARY ================== */

    @Column(name = "salary_min")
    private Long salaryMin;

    @Column(name = "salary_max")
    private Long salaryMax;

    @Column(name = "is_negotiable")
    @Builder.Default
    private Boolean negotiable = false;

    /* ================== LOCATION ================== */

    @Column(nullable = false, length = 500)
    private String location;

    @Column(nullable = false, length = 100)
    private String city;

    private Double latitude;

    private Double longitude;

    /* ================== OTHER ================== */

    @Builder.Default
    private Integer positions = 1;

    private LocalDate deadline;

    @Builder.Default
    private Integer views = 0;

    /* ================== TIME ================== */

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
