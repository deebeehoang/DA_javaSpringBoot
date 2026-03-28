package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.request.CandidateProfileRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.CandidateProfileResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.JobResponse;
import com.example.DA_WebTuyenDungViecLam.entity.*;
import com.example.DA_WebTuyenDungViecLam.entity.ids.CandidateSkillId;
import com.example.DA_WebTuyenDungViecLam.enums.SkillLevel;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.*;
import com.example.DA_WebTuyenDungViecLam.service.CandidateService;
import com.example.DA_WebTuyenDungViecLam.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
@PreAuthorize("hasRole('CANDIDATE')")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;

    // ===== Profile =====

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(candidateService.getProfile(auth.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfile(
            Authentication auth,
            @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(candidateService.updateProfile(auth.getName(), request)));
    }

    // ===== Skills =====

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMySkills(Authentication auth) {
        Long candidateId = getCandidateId(auth);
        List<Map<String, Object>> skills = candidateSkillRepository.findByCandidateId(candidateId)
                .stream().map(cs -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("skillId", cs.getSkill().getId());
                    m.put("skillName", cs.getSkill().getName());
                    m.put("category", cs.getSkill().getCategory().name());
                    m.put("level", cs.getLevel().name());
                    return m;
                }).toList();
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<String>> addSkill(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        Long candidateId = getCandidateId(auth);
        Integer skillId = (Integer) body.get("skillId");
        String level = (String) body.getOrDefault("level", "INTERMEDIATE");

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate không tồn tại"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill không tồn tại"));

        CandidateSkillId csId = new CandidateSkillId(candidateId, skillId);
        if (candidateSkillRepository.existsById(csId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Kỹ năng này đã được thêm"));
        }

        CandidateSkill cs = CandidateSkill.builder()
                .id(csId)
                .candidate(candidate)
                .skill(skill)
                .level(SkillLevel.valueOf(level.toUpperCase()))
                .build();
        candidateSkillRepository.save(cs);
        return ResponseEntity.ok(ApiResponse.success("Thêm kỹ năng thành công"));
    }

    @PutMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse<String>> updateSkillLevel(
            Authentication auth,
            @PathVariable Integer skillId,
            @RequestBody Map<String, String> body) {
        Long candidateId = getCandidateId(auth);
        CandidateSkillId csId = new CandidateSkillId(candidateId, skillId);
        CandidateSkill cs = candidateSkillRepository.findById(csId)
                .orElseThrow(() -> new ResourceNotFoundException("Kỹ năng không tồn tại trong hồ sơ"));
        cs.setLevel(SkillLevel.valueOf(body.get("level").toUpperCase()));
        candidateSkillRepository.save(cs);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật kỹ năng thành công"));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse<String>> removeSkill(
            Authentication auth,
            @PathVariable Integer skillId) {
        Long candidateId = getCandidateId(auth);
        CandidateSkillId csId = new CandidateSkillId(candidateId, skillId);
        if (!candidateSkillRepository.existsById(csId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Kỹ năng không có trong hồ sơ"));
        }
        candidateSkillRepository.deleteById(csId);
        return ResponseEntity.ok(ApiResponse.success("Xóa kỹ năng thành công"));
    }

    // ===== All Skills (for dropdown) =====

    @GetMapping("/skills/all")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllSkills() {
        List<Map<String, Object>> skills = skillRepository.findAll().stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getName());
            m.put("category", s.getCategory().name());
            return m;
        }).toList();
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    // ===== Saved Jobs =====

    @GetMapping("/saved-jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getSavedJobs(Authentication auth) {
        Long candidateId = getCandidateId(auth);
        List<JobResponse> jobs = savedJobRepository.findByCandidateIdOrderBySavedAtDesc(candidateId)
                .stream().map(sj -> jobService.getById(sj.getJob().getId())).toList();
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @PostMapping("/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<String>> saveJob(Authentication auth, @PathVariable Long jobId) {
        Long candidateId = getCandidateId(auth);
        if (savedJobRepository.existsByCandidateIdAndJobId(candidateId, jobId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Đã lưu tin này rồi"));
        }
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate không tồn tại"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job không tồn tại"));

        savedJobRepository.save(SavedJob.builder().candidate(candidate).job(job).build());
        return ResponseEntity.ok(ApiResponse.success("Lưu tin thành công"));
    }

    @DeleteMapping("/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<String>> unsaveJob(Authentication auth, @PathVariable Long jobId) {
        Long candidateId = getCandidateId(auth);
        SavedJob sj = savedJobRepository.findByCandidateIdAndJobId(candidateId, jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa lưu tin này"));
        savedJobRepository.delete(sj);
        return ResponseEntity.ok(ApiResponse.success("Bỏ lưu tin thành công"));
    }

    @GetMapping("/saved-jobs/{jobId}/check")
    public ResponseEntity<ApiResponse<Boolean>> checkSaved(Authentication auth, @PathVariable Long jobId) {
        Long candidateId = getCandidateId(auth);
        return ResponseEntity.ok(ApiResponse.success(savedJobRepository.existsByCandidateIdAndJobId(candidateId, jobId)));
    }

    // ===== Dashboard Stats =====

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(Authentication auth) {
        Long candidateId = getCandidateId(auth);
        var apps = candidateSkillRepository.findByCandidateId(candidateId);
        var myApps = applicationRepository().findByCandidateIdOrderByAppliedAtDesc(candidateId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", myApps.size());
        stats.put("pending", myApps.stream().filter(a -> a.getStatus().name().equals("PENDING")).count());
        stats.put("approved", myApps.stream().filter(a -> a.getStatus().name().equals("APPROVED")).count());
        stats.put("rejected", myApps.stream().filter(a -> a.getStatus().name().equals("REJECTED")).count());
        stats.put("savedJobs", savedJobRepository.countByCandidateId(candidateId));
        stats.put("skills", apps.size());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ===== Helpers =====

    private Long getCandidateId(Authentication auth) {
        String email = auth.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        var candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile không tồn tại"));
        return candidate.getId();
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.DA_WebTuyenDungViecLam.repository.ApplicationRepository appRepo;

    private com.example.DA_WebTuyenDungViecLam.repository.ApplicationRepository applicationRepository() {
        return appRepo;
    }
}
