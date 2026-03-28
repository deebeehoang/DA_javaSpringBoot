package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.request.JobCreateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.JobUpdateRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.CategoryResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.EmployerResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.JobResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Category;
import com.example.DA_WebTuyenDungViecLam.entity.Employer;
import com.example.DA_WebTuyenDungViecLam.entity.Job;
import com.example.DA_WebTuyenDungViecLam.enums.JobLevel;
import com.example.DA_WebTuyenDungViecLam.enums.JobStatus;
import com.example.DA_WebTuyenDungViecLam.enums.JobType;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.exception.UnauthorizedException;
import com.example.DA_WebTuyenDungViecLam.repository.ApplicationRepository;
import com.example.DA_WebTuyenDungViecLam.repository.CategoryRepository;
import com.example.DA_WebTuyenDungViecLam.repository.EmployerRepository;
import com.example.DA_WebTuyenDungViecLam.repository.JobRepository;
import com.example.DA_WebTuyenDungViecLam.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;
    private final CategoryRepository categoryRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public Page<JobResponse> getPublishedJobs(Pageable pageable, String keyword, Integer categoryId,
                                               String city, String jobType, String jobLevel,
                                               Long salaryMin, Long salaryMax) {
        JobType type = (jobType != null && !jobType.isBlank()) ? JobType.valueOf(jobType.toUpperCase()) : null;
        JobLevel level = (jobLevel != null && !jobLevel.isBlank()) ? JobLevel.valueOf(jobLevel.toUpperCase()) : null;

        Page<Job> jobs = jobRepository.searchJobs(
                JobStatus.OPEN, keyword, categoryId, city, type, level, salaryMin, salaryMax, pageable);

        return jobs.map(this::toJobResponse);
    }

    @Override
    @Transactional
    public JobResponse getById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy job #" + id));
        job.setViews(job.getViews() + 1);
        jobRepository.save(job);
        return toJobResponse(job);
    }

    @Override
    @Transactional
    public JobResponse create(JobCreateRequest req, Long employerId) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer không tồn tại"));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));

        Job job = Job.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .requirements(req.getRequirements())
                .benefits(req.getBenefits())
                .jobType(JobType.valueOf(req.getJobType().toUpperCase()))
                .jobLevel(req.getJobLevel() != null ? JobLevel.valueOf(req.getJobLevel().toUpperCase()) : JobLevel.ANY)
                .status(JobStatus.DRAFT)
                .salaryMin(req.getSalaryMin())
                .salaryMax(req.getSalaryMax())
                .negotiable(req.getNegotiable() != null ? req.getNegotiable() : false)
                .location(req.getLocation())
                .city(req.getCity())
                .positions(req.getPositions() != null ? req.getPositions() : 1)
                .deadline(req.getDeadline())
                .employer(employer)
                .category(category)
                .views(0)
                .build();

        job = jobRepository.save(job);
        return toJobResponse(job);
    }

    @Override
    @Transactional
    public JobResponse update(Long id, JobUpdateRequest req, Long employerId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy job #" + id));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new UnauthorizedException("Bạn không có quyền chỉnh sửa job này");
        }

        if (req.getTitle() != null) job.setTitle(req.getTitle());
        if (req.getDescription() != null) job.setDescription(req.getDescription());
        if (req.getRequirements() != null) job.setRequirements(req.getRequirements());
        if (req.getBenefits() != null) job.setBenefits(req.getBenefits());
        if (req.getJobType() != null) job.setJobType(JobType.valueOf(req.getJobType().toUpperCase()));
        if (req.getJobLevel() != null) job.setJobLevel(JobLevel.valueOf(req.getJobLevel().toUpperCase()));
        if (req.getSalaryMin() != null) job.setSalaryMin(req.getSalaryMin());
        if (req.getSalaryMax() != null) job.setSalaryMax(req.getSalaryMax());
        if (req.getNegotiable() != null) job.setNegotiable(req.getNegotiable());
        if (req.getLocation() != null) job.setLocation(req.getLocation());
        if (req.getCity() != null) job.setCity(req.getCity());
        if (req.getPositions() != null) job.setPositions(req.getPositions());
        if (req.getDeadline() != null) job.setDeadline(req.getDeadline());
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
            job.setCategory(category);
        }

        job = jobRepository.save(job);
        return toJobResponse(job);
    }

    @Override
    @Transactional
    public void delete(Long id, Long employerId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy job #" + id));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new UnauthorizedException("Bạn không có quyền xóa job này");
        }

        jobRepository.delete(job);
    }

    @Override
    public Page<JobResponse> getByEmployer(Long employerId, Pageable pageable) {
        return jobRepository.findByEmployerId(employerId, pageable).map(this::toJobResponse);
    }

    @Override
    @Transactional
    public JobResponse updateStatus(Long id, String status) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy job #" + id));

        job.setStatus(JobStatus.valueOf(status.toUpperCase()));
        job = jobRepository.save(job);
        return toJobResponse(job);
    }

    @Override
    @Transactional
    public JobResponse updateStatusByEmployer(Long id, String status, Long employerId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy job #" + id));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new UnauthorizedException("Bạn không có quyền cập nhật trạng thái job này");
        }

        job.setStatus(JobStatus.valueOf(status.toUpperCase()));
        job = jobRepository.save(job);
        return toJobResponse(job);
    }

    // ===== Mapper =====

    private JobResponse toJobResponse(Job job) {
        JobResponse.JobResponseBuilder builder = JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .jobType(job.getJobType().name())
                .jobLevel(job.getJobLevel() != null ? job.getJobLevel().name() : null)
                .status(job.getStatus().name())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .negotiable(job.getNegotiable())
                .location(job.getLocation())
                .city(job.getCity())
                .positions(job.getPositions())
                .deadline(job.getDeadline() != null ? job.getDeadline().toString() : null)
                .views(job.getViews())
                .applicationCount(applicationRepository.countByJobId(job.getId()))
                .createdAt(job.getCreatedAt() != null ? job.getCreatedAt().toString() : null)
                .updatedAt(job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : null);

        if (job.getCategory() != null) {
            builder.category(CategoryResponse.builder()
                    .id(job.getCategory().getId())
                    .name(job.getCategory().getName())
                    .slug(job.getCategory().getSlug())
                    .icon(job.getCategory().getIcon())
                    .description(job.getCategory().getDescription())
                    .build());
        }

        if (job.getEmployer() != null) {
            Employer emp = job.getEmployer();
            builder.employer(EmployerResponse.builder()
                    .id(emp.getId())
                    .companyName(emp.getCompanyName())
                    .companyType(emp.getCompanyType() != null ? emp.getCompanyType().name() : null)
                    .companySize(emp.getCompanySize() != null ? emp.getCompanySize().name() : null)
                    .logoUrl(emp.getLogoUrl())
                    .city(emp.getCity())
                    .industry(emp.getIndustry())
                    .isVerified(emp.getIsVerified())
                    .build());
        }

        return builder.build();
    }
}
