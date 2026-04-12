package com.example.DA_WebTuyenDungViecLam.Config;

import com.example.DA_WebTuyenDungViecLam.entity.*;
import com.example.DA_WebTuyenDungViecLam.enums.*;
import com.example.DA_WebTuyenDungViecLam.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Configuration
public class TestDataRunner {

    @Bean
    @Transactional
    @ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
    CommandLineRunner seedData(
            UserRepository userRepo,
            CandidateRepository candidateRepo,
            EmployerRepository employerRepo,
            CategoryRepository categoryRepo,
            JobRepository jobRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepo.count() > 0) {
                System.out.println("⚠️ Database đã có dữ liệu — bỏ qua seed.");
                return;
            }

            System.out.println("🌱 Seeding dữ liệu mẫu...");

            // ─── 1. Admin ───
            User admin = userRepo.save(User.builder()
                    .email("admin@parttimehub.vn")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Admin PartTimeHub")
                    .phone("0900000000")
                    .role(UserRole.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .authProvider(AuthProvider.LOCAL)
                    .build());

            // ─── 2. Employer + Profile ───
            User employerUser = userRepo.save(User.builder()
                    .email("employer@parttimehub.vn")
                    .password(passwordEncoder.encode("employer123"))
                    .fullName("Nguyễn Văn Employer")
                    .phone("0911111111")
                    .role(UserRole.EMPLOYER)
                    .status(UserStatus.ACTIVE)
                    .authProvider(AuthProvider.LOCAL)
                    .build());

            Employer employer = employerRepo.save(Employer.builder()
                    .user(employerUser)
                    .companyName("FPT Software")
                    .companyType(CompanyType.COMPANY)
                    .companySize(CompanySize._201_500)
                    .description("Công ty phần mềm hàng đầu Việt Nam")
                    .website("https://fpt-software.com")
                    .address("Tòa nhà FPT, Duy Tân, Cầu Giấy")
                    .city("Hà Nội")
                    .industry("Công nghệ thông tin")
                    .isVerified(true)
                    .build());

            // ─── 3. Candidate + Profile ───
            User candidateUser = userRepo.save(User.builder()
                    .email("candidate@parttimehub.vn")
                    .password(passwordEncoder.encode("candidate123"))
                    .fullName("Trần Thị Candidate")
                    .phone("0922222222")
                    .role(UserRole.CANDIDATE)
                    .status(UserStatus.ACTIVE)
                    .authProvider(AuthProvider.LOCAL)
                    .build());

            candidateRepo.save(Candidate.builder()
                    .user(candidateUser)
                    .dateOfBirth(LocalDate.of(2000, 5, 15))
                    .gender(Gender.FEMALE)
                    .city("Hồ Chí Minh")
                    .educationLevel(EducationLevel.BACHELOR)
                    .yearsOfExperience(1)
                    .expectedSalaryMin(5000000L)
                    .expectedSalaryMax(10000000L)
                    .bio("Sinh viên năm cuối ngành CNTT, đam mê lập trình web")
                    .build());

            // ─── 4. Categories ───
            Category catIT = categoryRepo.save(Category.builder()
                    .name("Công nghệ thông tin").slug("cong-nghe-thong-tin").icon("💻").build());
            Category catMkt = categoryRepo.save(Category.builder()
                    .name("Marketing").slug("marketing").icon("📢").build());
            Category catDesign = categoryRepo.save(Category.builder()
                    .name("Thiết kế").slug("thiet-ke").icon("🎨").build());
            Category catAcct = categoryRepo.save(Category.builder()
                    .name("Kế toán").slug("ke-toan").icon("📊").build());
            categoryRepo.save(Category.builder()
                    .name("Bán hàng").slug("ban-hang").icon("🛒").build());
            categoryRepo.save(Category.builder()
                    .name("Nhân sự").slug("nhan-su").icon("👥").build());

            // ─── 5. Jobs ───
            jobRepo.save(Job.builder()
                    .employer(employer).category(catIT)
                    .title("Thực tập sinh Java Backend")
                    .description("Tham gia phát triển hệ thống backend sử dụng Spring Boot")
                    .requirements("Biết Java, Spring Boot, MySQL cơ bản")
                    .benefits("Hỗ trợ 5 triệu/tháng, học hỏi dự án thực tế")
                    .jobType(JobType.INTERNSHIP).jobLevel(JobLevel.INTERN)
                    .status(JobStatus.OPEN)
                    .salaryMin(3000000L).salaryMax(5000000L)
                    .location("Tòa nhà FPT, Duy Tân, Cầu Giấy").city("Hà Nội")
                    .positions(3).deadline(LocalDate.now().plusMonths(2))
                    .build());

            jobRepo.save(Job.builder()
                    .employer(employer).category(catIT)
                    .title("Part-time React Developer")
                    .description("Phát triển giao diện ứng dụng web bằng React + TypeScript")
                    .requirements("Thành thạo React, TypeScript, TailwindCSS")
                    .benefits("Lương cạnh tranh, làm việc remote")
                    .jobType(JobType.PART_TIME).jobLevel(JobLevel.JUNIOR)
                    .status(JobStatus.OPEN)
                    .salaryMin(8000000L).salaryMax(15000000L)
                    .location("Remote / Văn phòng HCM").city("Hồ Chí Minh")
                    .positions(2).deadline(LocalDate.now().plusMonths(1))
                    .build());

            jobRepo.save(Job.builder()
                    .employer(employer).category(catMkt)
                    .title("Content Marketing Part-time")
                    .description("Viết content marketing cho các kênh social media")
                    .requirements("Kỹ năng viết tốt, sáng tạo, biết SEO cơ bản")
                    .benefits("Lương theo giờ linh hoạt")
                    .jobType(JobType.PART_TIME).jobLevel(JobLevel.FRESHER)
                    .status(JobStatus.OPEN)
                    .salaryMin(4000000L).salaryMax(7000000L)
                    .location("Quận 1, HCM").city("Hồ Chí Minh")
                    .positions(1).deadline(LocalDate.now().plusMonths(1))
                    .build());

            jobRepo.save(Job.builder()
                    .employer(employer).category(catDesign)
                    .title("Freelance UI/UX Designer")
                    .description("Thiết kế UI/UX cho các dự án web và mobile")
                    .requirements("Thành thạo Figma, có portfolio")
                    .benefits("Trả theo dự án, làm việc tự do")
                    .jobType(JobType.FREELANCE).jobLevel(JobLevel.JUNIOR)
                    .status(JobStatus.OPEN)
                    .salaryMin(10000000L).salaryMax(20000000L)
                    .location("Remote").city("Toàn quốc")
                    .positions(2).deadline(LocalDate.now().plusMonths(3))
                    .build());

            System.out.println("✅ Seed hoàn tất: 1 admin, 1 employer, 1 candidate, 6 categories, 4 jobs");
        };
    }
}
