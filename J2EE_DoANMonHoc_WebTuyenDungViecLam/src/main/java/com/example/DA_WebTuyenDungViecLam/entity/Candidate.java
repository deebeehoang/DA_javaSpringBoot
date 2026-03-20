package com.example.DA_WebTuyenDungViecLam.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.example.DA_WebTuyenDungViecLam.enums.Gender;
import com.example.DA_WebTuyenDungViecLam.enums.EducationLevel;
@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1–1 với User
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "education_level")
    private EducationLevel educationLevel;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "expected_salary_min")
    private Long expectedSalaryMin;

    @Column(name = "expected_salary_max")
    private Long expectedSalaryMax;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "cv_url", length = 500)
    private String cvUrl;

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

