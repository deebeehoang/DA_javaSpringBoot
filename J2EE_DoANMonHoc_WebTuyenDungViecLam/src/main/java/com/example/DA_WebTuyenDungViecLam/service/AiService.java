package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.entity.CandidateSkill;
import com.example.DA_WebTuyenDungViecLam.entity.Job;
import com.example.DA_WebTuyenDungViecLam.entity.JobSkill;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import com.example.DA_WebTuyenDungViecLam.repository.*;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AiService {

    @Value("${groq.api-key:}")
    private String groqApiKey;

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiService(UserRepository userRepository,
                     CandidateRepository candidateRepository,
                     CandidateSkillRepository candidateSkillRepository,
                     JobRepository jobRepository,
                     JobSkillRepository jobSkillRepository) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.jobRepository = jobRepository;
        this.jobSkillRepository = jobSkillRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /** Inner DTO returned from getAiRecommendations() */
    @Data
    public static class AiRecommendation {
        private Long jobId;
        private int matchScore;
        private List<String> matchedSkills;
        private String reason;
    }

    private record ScoredJob(Job job, int score, List<String> matchedSkills) {}
    private record GroqItem(Long id, String reason) {}

    /**
     * Get AI-powered job recommendations with match scores for a candidate.
     */
    public List<AiRecommendation> getAiRecommendations(String email) {
        var user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return List.of();

        var candidate = candidateRepository.findByUserId(user.getId()).orElse(null);
        if (candidate == null) return List.of();

        // 1. Get candidate skills
        List<CandidateSkill> candidateSkills = candidateSkillRepository.findByCandidateId(candidate.getId());
        Set<Integer> candidateSkillIds = candidateSkills.stream()
                .map(cs -> cs.getSkill().getId())
                .collect(Collectors.toSet());
        Map<Integer, String> skillIdToName = candidateSkills.stream()
                .collect(Collectors.toMap(
                        cs -> cs.getSkill().getId(),
                        cs -> cs.getSkill().getName(),
                        (a, b) -> a
                ));

        // 2. Get open jobs (limit 50)
        List<Job> openJobs = jobRepository.findByStatus(JobStatus.OPEN, PageRequest.of(0, 50)).getContent();
        if (openJobs.isEmpty()) return List.of();

        // 3. Batch-load all job skills with JOIN FETCH (avoids N+1)
        List<Long> jobIds = openJobs.stream().map(Job::getId).toList();
        List<JobSkill> allJobSkills = jobSkillRepository.findWithSkillsByJobIdIn(jobIds);
        Map<Long, List<JobSkill>> jobSkillMap = allJobSkills.stream()
                .collect(Collectors.groupingBy(js -> js.getId().getJobId()));

        // 4. Compute skill match score per job
        List<ScoredJob> scoredJobs = openJobs.stream().map(job -> {
            List<JobSkill> js = jobSkillMap.getOrDefault(job.getId(), List.of());
            Set<Integer> jobSkillIds = js.stream()
                    .map(s -> s.getId().getSkillId())
                    .collect(Collectors.toSet());
            Set<Integer> intersect = new HashSet<>(candidateSkillIds);
            intersect.retainAll(jobSkillIds);
            List<String> matched = intersect.stream()
                    .map(id -> skillIdToName.getOrDefault(id, ""))
                    .filter(n -> !n.isEmpty())
                    .toList();
            int score = jobSkillIds.isEmpty() ? 0
                    : (int) Math.round((double) intersect.size() / jobSkillIds.size() * 100);
            return new ScoredJob(job, score, matched);
        }).sorted(Comparator.comparingInt(ScoredJob::score).reversed())
          .limit(15)
          .toList();

        // 5. Build strings for Groq prompt
        String skillsText = candidateSkills.stream()
                .map(cs -> cs.getSkill().getName())
                .collect(Collectors.joining(", "));
        String candidateInfo = String.format(
                "Thành phố: %s | Kinh nghiệm: %d năm | Học vấn: %s | Kỹ năng: %s",
                candidate.getCity() != null ? candidate.getCity() : "không rõ",
                candidate.getYearsOfExperience() != null ? candidate.getYearsOfExperience() : 0,
                candidate.getEducationLevel() != null ? candidate.getEducationLevel().name() : "không rõ",
                skillsText.isEmpty() ? "chưa có" : skillsText
        );
        StringBuilder jobListStr = new StringBuilder();
        for (ScoredJob sj : scoredJobs) {
            Job job = sj.job();
            String req = job.getRequirements();
            if (req != null && req.length() > 120) req = req.substring(0, 120);
            jobListStr.append(String.format("ID:%d | %s | %s | %s | %s\n",
                    job.getId(), job.getTitle(), job.getCity(),
                    job.getJobType().name(), req != null ? req : ""));
        }

        // 6. Call Groq API
        List<GroqItem> aiItems = callGroqApi(candidateInfo, jobListStr.toString());

        Map<Long, ScoredJob> scoredMap = scoredJobs.stream()
                .collect(Collectors.toMap(sj -> sj.job().getId(), sj -> sj));

        // 7. Fallback: return top scored jobs if Groq fails
        if (aiItems.isEmpty()) {
            return scoredJobs.stream().limit(6).map(sj -> buildRec(
                    sj.job().getId(), sj.score(), sj.matchedSkills(), null)).toList();
        }

        // 8. Merge AI ranking with local scores
        return aiItems.stream().map(item -> {
            ScoredJob sj = scoredMap.get(item.id());
            int score = sj != null ? sj.score() : 0;
            List<String> matched = sj != null ? sj.matchedSkills() : List.of();
            return buildRec(item.id(), score, matched, item.reason());
        }).toList();
    }

    private AiRecommendation buildRec(Long jobId, int score, List<String> matched, String aiReason) {
        AiRecommendation rec = new AiRecommendation();
        rec.setJobId(jobId);
        rec.setMatchScore(score);
        rec.setMatchedSkills(matched);
        if (aiReason != null && !aiReason.isBlank()) {
            rec.setReason(aiReason);
        } else if (!matched.isEmpty()) {
            rec.setReason("Phù hợp vì bạn có kỹ năng: " + String.join(", ", matched));
        } else {
            rec.setReason("Phù hợp với hồ sơ của bạn");
        }
        return rec;
    }

    @SuppressWarnings("unchecked")
    private List<GroqItem> callGroqApi(String candidateInfo, String jobList) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("Groq API key not configured — using local skill-score fallback");
            return List.of();
        }
        String prompt = String.format(
                "Bạn là hệ thống gợi ý việc làm. Dựa trên hồ sơ ứng viên, hãy chọn tối đa 6 công việc phù hợp nhất.\n" +
                "Trả về JSON array, mỗi phần tử gồm 'id' (số nguyên) và 'reason' (lý do ngắn gọn tiếng Việt ≤80 ký tự).\n" +
                "Ví dụ: [{\"id\":1,\"reason\":\"Phù hợp vì có kỹ năng Java\"},{\"id\":2,\"reason\":\"Phù hợp với kinh nghiệm\"}]\n" +
                "CHỈ trả về JSON array, không thêm gì khác.\n\n" +
                "HỒ SƠ ỨNG VIÊN:\n%s\n\nDANH SÁCH CÔNG VIỆC:\n%s",
                candidateInfo, jobList);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", "llama3-70b-8192");
            body.put("messages", List.of(
                    Map.of("role", "system", "content", "Bạn là trợ lý gợi ý việc làm. Chỉ trả về JSON array."),
                    Map.of("role", "user", "content", prompt)
            ));
            body.put("temperature", 0.3);
            body.put("max_tokens", 500);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.groq.com/openai/v1/chat/completions",
                    HttpMethod.POST, request, Map.class);
            Map<String, Object> rb = response.getBody();
            if (rb == null) return List.of();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) rb.get("choices");
            if (choices == null || choices.isEmpty()) return List.of();
            String content = ((String) ((Map<String, Object>) choices.get(0).get("message")).get("content")).trim();
            log.info("Groq response: {}", content);
            int start = content.indexOf('[');
            int end = content.lastIndexOf(']') + 1;
            if (start < 0 || end <= start) return List.of();
            List<Map<String, Object>> parsed = objectMapper.readValue(
                    content.substring(start, end), new TypeReference<>() {});
            return parsed.stream().map(m -> {
                Object idObj = m.get("id");
                if (idObj == null) return null;
                Long id;
                if (idObj instanceof Number n) id = n.longValue();
                else try { id = Long.parseLong(idObj.toString()); } catch (NumberFormatException e) { return null; }
                String reason = m.containsKey("reason") ? String.valueOf(m.get("reason")) : null;
                return new GroqItem(id, reason);
            }).filter(Objects::nonNull).toList();
        } catch (Exception e) {
            log.error("Groq API error: {}", e.getMessage());
            return List.of();
        }
    }
}
