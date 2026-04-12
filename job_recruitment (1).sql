-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 12, 2026 lúc 07:50 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `job_recruitment`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` bigint(20) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử hoạt động';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `applications`
--

CREATE TABLE `applications` (
  `id` bigint(20) NOT NULL,
  `job_id` bigint(20) NOT NULL,
  `candidate_id` bigint(20) NOT NULL,
  `cv_url` varchar(500) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `status` enum('PENDING','VIEWED','INTERVIEW','APPROVED','REJECTED') DEFAULT 'PENDING',
  `notes` text DEFAULT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cv_viewed` bit(1) DEFAULT NULL,
  `cv_viewed_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đơn ứng tuyển';

--
-- Đang đổ dữ liệu cho bảng `applications`
--

INSERT INTO `applications` (`id`, `job_id`, `candidate_id`, `cv_url`, `cover_letter`, `status`, `notes`, `applied_at`, `updated_at`, `cv_viewed`, `cv_viewed_at`) VALUES
(1, 1, 2, NULL, 'dđ', 'INTERVIEW', NULL, '2026-03-17 07:04:38', '2026-03-17 07:39:52', NULL, NULL),
(2, 3, 4, NULL, 'k có', 'APPROVED', NULL, '2026-04-11 17:13:29', '2026-04-12 04:26:00', NULL, NULL),
(3, 2, 4, NULL, '', 'PENDING', NULL, '2026-04-11 18:25:37', '2026-04-11 18:25:37', NULL, NULL),
(4, 1, 4, '/uploads/cvs/52be8403-7576-47dd-8b5d-db924abd32e9.pdf', '', 'INTERVIEW', NULL, '2026-04-11 18:59:59', '2026-04-11 19:00:41', b'1', '2026-04-12 02:00:41.000000'),
(5, 4, 4, '/uploads/cvs/cf1c800c-b4a8-47f8-a8c8-411d66e9d097.pdf', '', 'APPROVED', NULL, '2026-04-12 03:53:06', '2026-04-12 04:40:43', b'1', '2026-04-12 10:53:49.000000');

--
-- Bẫy `applications`
--
DELIMITER $$
CREATE TRIGGER `after_application_insert` AFTER INSERT ON `applications` FOR EACH ROW BEGIN
    DECLARE employer_user_id BIGINT;
    DECLARE job_title VARCHAR(255);
    
    SELECT e.user_id, j.title INTO employer_user_id, job_title
    FROM jobs j
    JOIN employers e ON j.employer_id = e.id
    WHERE j.id = NEW.job_id;
    
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        employer_user_id,
        'APPLICATION',
        'Đơn ứng tuyển mới',
        CONCAT('Bạn có đơn ứng tuyển mới cho: ', job_title),
        CONCAT('/applications/', NEW.id)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_application_status_update` AFTER UPDATE ON `applications` FOR EACH ROW BEGIN
    DECLARE candidate_user_id BIGINT;
    DECLARE job_title VARCHAR(255);
    DECLARE status_text VARCHAR(100);
    
    IF NEW.status != OLD.status THEN
        SELECT c.user_id, j.title INTO candidate_user_id, job_title
        FROM candidates c
        JOIN jobs j ON j.id = NEW.job_id
        WHERE c.id = NEW.candidate_id;
        
        SET status_text = CASE NEW.status
            WHEN 'REVIEWED' THEN 'đã được xem xét'
            WHEN 'INTERVIEW' THEN 'được mời phỏng vấn'
            WHEN 'ACCEPTED' THEN 'đã được chấp nhận'
            WHEN 'REJECTED' THEN 'đã bị từ chối'
            ELSE 'đã cập nhật'
        END;
        
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
            candidate_user_id,
            'APPLICATION',
            'Cập nhật đơn ứng tuyển',
            CONCAT('Đơn của bạn cho "', job_title, '" ', status_text),
            CONCAT('/applications/', NEW.id)
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `candidates`
--

CREATE TABLE `candidates` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `education_level` enum('HIGH_SCHOOL','DIPLOMA','BACHELOR','MASTER','PHD') DEFAULT NULL,
  `years_of_experience` int(11) DEFAULT 0,
  `expected_salary_min` bigint(20) DEFAULT NULL,
  `expected_salary_max` bigint(20) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `cv_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ứng viên';

--
-- Đang đổ dữ liệu cho bảng `candidates`
--

INSERT INTO `candidates` (`id`, `user_id`, `date_of_birth`, `gender`, `city`, `education_level`, `years_of_experience`, `expected_salary_min`, `expected_salary_max`, `bio`, `cv_url`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-17 03:44:31', '2026-03-17 03:44:31'),
(2, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-17 04:39:40', '2026-03-17 04:39:40'),
(3, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-11 11:32:44', '2026-04-11 11:32:44'),
(4, 12, '2009-02-12', 'MALE', 'Thành phố Hà Nội', 'BACHELOR', 1, 5000000, 10000000, 'hay hát', '/uploads/cvs/cf1c800c-b4a8-47f8-a8c8-411d66e9d097.pdf', '2026-04-11 17:06:17', '2026-04-12 03:53:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `candidate_skills`
--

CREATE TABLE `candidate_skills` (
  `candidate_id` bigint(20) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `level` enum('BASIC','INTERMEDIATE','ADVANCED','EXPERT') DEFAULT 'INTERMEDIATE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `candidate_skills`
--

INSERT INTO `candidate_skills` (`candidate_id`, `skill_id`, `level`) VALUES
(4, 1, 'BASIC');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục ngành nghề';

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `description`, `is_active`, `created_at`) VALUES
(1, 'làm thêm ', 'a', 'a', 'dada', 1, '2026-03-17 06:35:59'),
(2, 'Kinh doanh / Sales', 'buôn bán trao đổi ', '', '', 1, '2026-04-11 17:23:53'),
(3, 'fulltime', 'Phù hợp cho người rảnh', 'F', 'làm việc cả ngày', 1, '2026-04-12 03:19:03');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employers`
--

CREATE TABLE `employers` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `company_type` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `company_size` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhà tuyển dụng';

--
-- Đang đổ dữ liệu cho bảng `employers`
--

INSERT INTO `employers` (`id`, `user_id`, `company_name`, `company_type`, `description`, `website`, `address`, `city`, `logo_url`, `company_size`, `industry`, `is_verified`, `created_at`, `updated_at`) VALUES
(1, 9, 'gg', 'COMPANY', 'nhà hàng số 1 việt nam', '', '73 đình phong phú đường lê văn việt quận 9 thủ đức', '', '/uploads/avatars/7845bf1d-03e8-4ca4-81dc-9ff99e4634d8.webp', '_11_50', 'phục vụ ', 0, '2026-03-17 04:52:04', '2026-04-11 19:37:54'),
(2, 11, 'Test Company', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-04-11 11:32:52', '2026-04-11 11:32:52'),
(3, 14, 'nhà hàng pô sai đần', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-04-11 17:07:46', '2026-04-11 17:07:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) NOT NULL,
  `employer_id` bigint(20) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `requirements` text DEFAULT NULL,
  `benefits` text DEFAULT NULL,
  `job_type` enum('FULL_TIME','PART_TIME','FREELANCE','INTERNSHIP') NOT NULL,
  `job_level` enum('INTERN','FRESHER','JUNIOR','SENIOR','MANAGER','ANY') DEFAULT 'ANY',
  `salary_min` bigint(20) DEFAULT NULL,
  `salary_max` bigint(20) DEFAULT NULL,
  `is_negotiable` tinyint(1) DEFAULT 0,
  `location` varchar(500) NOT NULL,
  `city` varchar(100) NOT NULL,
  `positions` int(11) DEFAULT 1,
  `deadline` date DEFAULT NULL,
  `status` enum('DRAFT','OPEN','CLOSED','EXPIRED') DEFAULT 'DRAFT',
  `views` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tin tuyển dụng';

--
-- Đang đổ dữ liệu cho bảng `jobs`
--

INSERT INTO `jobs` (`id`, `employer_id`, `category_id`, `title`, `description`, `requirements`, `benefits`, `job_type`, `job_level`, `salary_min`, `salary_max`, `is_negotiable`, `location`, `city`, `positions`, `deadline`, `status`, `views`, `created_at`, `updated_at`, `latitude`, `longitude`) VALUES
(1, 1, 1, 'làm giàu trong 30 ngày', 'làm thêm', '18 tuổi', 'bảo hiểm y tế', 'FREELANCE', 'INTERN', 1000, 1999, 0, 'Phong Phú, Ward 11, 73000, Phu Dinh, Thành phố Hồ Chí Minh, Việt Nam', 'Thành phố Hồ Chí Minh', 2, '2026-03-20', 'OPEN', 71, '2026-03-17 06:37:31', '2026-04-12 03:48:05', NULL, NULL),
(2, 2, 1, 'hay', 'rửa chén', '2 năm kinh nghiệm', 'không lương', 'PART_TIME', 'INTERN', 1000000, 2000000, 0, 'sg', 'hcm', 10, '2026-04-19', 'OPEN', 62, '2026-04-11 17:04:26', '2026-04-12 03:44:31', NULL, NULL),
(3, 3, 1, 'rửa chén', 'xách nước bổ cam', '20 năm kinh nghiệm', 'tăng ca', 'PART_TIME', 'INTERN', 1000000, 2000000, 0, 'Phong Phú, Ward 11, 73000, Phu Dinh, Thành phố Hồ Chí Minh, Việt Nam', 'Thành phố Hồ Chí Minh', 20, '2026-04-23', 'OPEN', 59, '2026-04-11 17:12:48', '2026-04-12 04:33:57', NULL, NULL),
(4, 1, 1, 'nhân viên bán hàng ', 'bán hàng tại cửa hàng', 'năng nổ giao tiếp tốt', 'có mộc', 'PART_TIME', 'INTERN', 20001, 1000000, 0, '120, Đường 2, Khu Nhà Ở Duyên Hải 81 Nguyễn Trãi, Máy Tơ, Phường Ngô Quyền, Thành phố Hải Phòng, 18000, Việt Nam', 'Thành phố Hà Nội', 10, '2026-04-25', 'OPEN', 57, '2026-04-11 20:04:14', '2026-04-12 04:40:46', 20.8647422, 106.6966049);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `job_skills`
--

CREATE TABLE `job_skills` (
  `job_id` bigint(20) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) NOT NULL,
  `sender_id` bigint(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `job_id` bigint(20) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chat realtime';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` enum('APPLICATION','JOB_UPDATE','MESSAGE','SYSTEM') DEFAULT 'SYSTEM',
  `title` varchar(255) NOT NULL,
  `message` varchar(255) NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thông báo realtime';

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`) VALUES
(1, 9, 'APPLICATION', 'Đơn ứng tuyển mới', 'Bạn có đơn ứng tuyển mới cho: làm giàu trong 30 ngày', '/applications/1', 1, '2026-03-17 07:04:38'),
(2, 7, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"làm giàu trong 30 ngày\" được mời phỏng vấn', '/applications/1', 0, '2026-03-17 07:39:52'),
(3, 14, 'APPLICATION', 'Đơn ứng tuyển mới', 'Bạn có đơn ứng tuyển mới cho: rửa chén', '/applications/2', 1, '2026-04-11 17:13:29'),
(4, 14, 'SYSTEM', 'Thông báo tuyển dụng', 'can đã ứng tuyển vào vị trí \"rửa chén\"', NULL, 1, '2026-04-11 17:13:29'),
(5, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"rửa chén\" được mời phỏng vấn', '/applications/2', 1, '2026-04-11 17:14:40'),
(6, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"rửa chén\" đã được chấp nhận', '/applications/2', 1, '2026-04-11 17:15:12'),
(7, 11, 'APPLICATION', 'Đơn ứng tuyển mới', 'Bạn có đơn ứng tuyển mới cho: hay', '/applications/3', 0, '2026-04-11 18:25:37'),
(8, 11, 'APPLICATION', 'Ứng tuyển mới', 'can đã ứng tuyển vào vị trí \"hay\"', '/employer/applications', 0, '2026-04-11 18:25:37'),
(9, 12, 'APPLICATION', 'Ứng tuyển thành công', 'Bạn đã ứng tuyển thành công vào vị trí \"hay\" tại Test Company', '/candidate/applications', 1, '2026-04-11 18:25:37'),
(10, 9, 'APPLICATION', 'Đơn ứng tuyển mới', 'Bạn có đơn ứng tuyển mới cho: làm giàu trong 30 ngày', '/applications/4', 1, '2026-04-11 18:59:59'),
(11, 9, 'APPLICATION', 'Ứng tuyển mới', 'can đã ứng tuyển vào vị trí \"làm giàu trong 30 ngày\"', '/employer/applications', 1, '2026-04-11 18:59:59'),
(12, 12, 'APPLICATION', 'Ứng tuyển thành công', 'Bạn đã ứng tuyển thành công vào vị trí \"làm giàu trong 30 ngày\" tại gg', '/candidate/applications', 1, '2026-04-11 18:59:59'),
(13, 12, 'JOB_UPDATE', 'Cập nhật đơn ứng tuyển', 'Đơn ứng tuyển vị trí \"làm giàu trong 30 ngày\" tại gg đã được mời phỏng vấn', '/candidate/applications', 1, '2026-04-11 19:00:26'),
(14, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"làm giàu trong 30 ngày\" được mời phỏng vấn', '/applications/4', 1, '2026-04-11 19:00:26'),
(16, 12, 'APPLICATION', 'CV đã được xem', 'gg đã xem CV của bạn cho vị trí \"làm giàu trong 30 ngày\"', '/candidate/dashboard', 1, '2026-04-11 19:00:41'),
(17, 9, 'APPLICATION', 'Đơn ứng tuyển mới', 'Bạn có đơn ứng tuyển mới cho: nhân viên bán hàng ', '/applications/5', 1, '2026-04-12 03:53:06'),
(18, 9, 'APPLICATION', 'Ứng tuyển mới', 'can đã ứng tuyển vào vị trí \"nhân viên bán hàng \"', '/employer/applications', 1, '2026-04-12 03:53:06'),
(19, 12, 'APPLICATION', 'Ứng tuyển thành công', 'Bạn đã ứng tuyển thành công vào vị trí \"nhân viên bán hàng \" tại gg', '/candidate/applications', 0, '2026-04-12 03:53:06'),
(20, 12, 'JOB_UPDATE', 'Cập nhật đơn ứng tuyển', 'Đơn ứng tuyển vị trí \"nhân viên bán hàng \" tại gg đã được mời phỏng vấn', '/candidate/applications', 0, '2026-04-12 03:53:26'),
(21, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"nhân viên bán hàng \" được mời phỏng vấn', '/applications/5', 0, '2026-04-12 03:53:26'),
(24, 12, 'APPLICATION', 'CV đã được xem', 'gg đã xem CV của bạn cho vị trí \"nhân viên bán hàng \"', '/candidate/dashboard', 0, '2026-04-12 03:53:49'),
(28, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"rửa chén\" đã cập nhật', '/applications/2', 0, '2026-04-12 04:23:58'),
(29, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"rửa chén\" đã cập nhật', '/applications/2', 0, '2026-04-12 04:26:00'),
(30, 12, 'JOB_UPDATE', 'Cập nhật đơn ứng tuyển', 'Đơn ứng tuyển vị trí \"nhân viên bán hàng \" tại gg đã được cập nhật', '/candidate/applications', 0, '2026-04-12 04:40:06'),
(31, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"nhân viên bán hàng \" đã cập nhật', '/applications/5', 0, '2026-04-12 04:40:06'),
(32, 12, 'JOB_UPDATE', 'Cập nhật đơn ứng tuyển', 'Đơn ứng tuyển vị trí \"nhân viên bán hàng \" tại gg đã được chấp nhận', '/candidate/applications', 0, '2026-04-12 04:40:43'),
(33, 12, 'APPLICATION', 'Cập nhật đơn ứng tuyển', 'Đơn của bạn cho \"nhân viên bán hàng \" đã cập nhật', '/applications/5', 0, '2026-04-12 04:40:43');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `candidate_id` bigint(20) NOT NULL,
  `employer_id` bigint(20) NOT NULL,
  `job_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `comment`, `created_at`, `rating`, `candidate_id`, `employer_id`, `job_id`) VALUES
(1, 'chưa giòn', '2026-04-12 11:40:52.000000', 4, 4, 1, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `saved_jobs`
--

CREATE TABLE `saved_jobs` (
  `id` bigint(20) NOT NULL,
  `candidate_id` bigint(20) NOT NULL,
  `job_id` bigint(20) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `saved_jobs`
--

INSERT INTO `saved_jobs` (`id`, `candidate_id`, `job_id`, `saved_at`) VALUES
(2, 4, 1, '2026-04-11 18:59:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('TECHNICAL','SOFT_SKILL','LANGUAGE','OTHER') DEFAULT 'OTHER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kỹ năng';

--
-- Đang đổ dữ liệu cho bảng `skills`
--

INSERT INTO `skills` (`id`, `name`, `category`, `created_at`) VALUES
(1, 'react', 'TECHNICAL', '2026-04-11 20:42:14'),
(2, 'B1', 'LANGUAGE', '2026-04-12 03:17:27'),
(3, 'python', 'TECHNICAL', '2026-04-12 03:17:34'),
(4, 'B2', 'LANGUAGE', '2026-04-12 03:17:41'),
(5, 'A1', 'LANGUAGE', '2026-04-12 03:17:46'),
(6, 'giao tiếp', 'SOFT_SKILL', '2026-04-12 03:17:56');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `auth_provider` enum('LOCAL','GOOGLE') DEFAULT 'LOCAL',
  `role` enum('ADMIN','EMPLOYER','CANDIDATE') NOT NULL,
  `status` enum('ACTIVE','INACTIVE','BANNED') DEFAULT 'ACTIVE',
  `is_online` tinyint(1) DEFAULT 0,
  `last_seen` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_password_expiry` datetime(6) DEFAULT NULL,
  `reset_password_token` varchar(120) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản - Hỗ trợ Google OAuth';

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone`, `avatar_url`, `google_id`, `auth_provider`, `role`, `status`, `is_online`, `last_seen`, `created_at`, `updated_at`, `reset_password_expiry`, `reset_password_token`) VALUES
(1, 's1@gmail.com', '$2a$10$OZcKGL.ZPYkjtpltEDU1DuASl9ZgjoJybZOskzxK.OUF8akcbs172', 'nguyen van a', NULL, NULL, NULL, 'LOCAL', 'ADMIN', 'ACTIVE', 0, NULL, '2026-03-17 03:44:31', '2026-03-17 04:23:11', NULL, NULL),
(7, 'test@test.com', '$2a$10$RGl26A89MMyuAGH519uQFOXh6S2cH4XzFDhX51uvN9fYTpQzKyNGa', 'Test User', NULL, NULL, NULL, 'LOCAL', 'CANDIDATE', 'ACTIVE', 0, NULL, '2026-03-17 04:39:40', '2026-03-17 06:38:09', NULL, NULL),
(9, 's2@gmail.com', '$2a$10$LlT8bdZYlP6ms9/iPIKvROQeag0VpgnsAlYz36FxHcNfq90Ouq7by', 's2', '0373746742', '/uploads/avatars/375f05c0-ac34-4c07-aafa-f4c614f4a1cc.jpg', NULL, 'LOCAL', 'EMPLOYER', 'ACTIVE', 0, NULL, '2026-03-17 04:52:04', '2026-04-11 19:38:33', NULL, NULL),
(10, 'jettluciasvivu02@gmail.com', '$2a$10$DbUv6mX6m.iwgH6xsvbr6euCZHABYb/F66ZxOXe4p9mh2fng3Ktu2', 'Candidate Test', NULL, NULL, NULL, 'LOCAL', 'CANDIDATE', 'ACTIVE', 0, NULL, '2026-04-11 11:32:44', '2026-04-11 11:32:44', NULL, NULL),
(11, 'jettluciasvivu03@gmail.com', '$2a$10$yX2FTDRSxNhqRgCo7uQrv.PVffr/PweaMumyppORKbUEA30O16fAu', 'Employer Test', NULL, NULL, NULL, 'LOCAL', 'EMPLOYER', 'ACTIVE', 0, NULL, '2026-04-11 11:32:52', '2026-04-11 11:32:52', NULL, NULL),
(12, 'jettluciasvivu@gmail.com', '$2a$10$u/THvagYJbdd9N573XgFbej0x21zbZ.p1eXuwYxlsgMta7MFHQXV2', 'can', '0373746744', '/uploads/avatars/2db5748e-c60f-43db-8f85-5caa2f181ea0.webp', NULL, 'LOCAL', 'CANDIDATE', 'ACTIVE', 0, NULL, '2026-04-11 17:06:17', '2026-04-11 20:40:12', NULL, NULL),
(14, 'jettluciasvivu05@gmail.com', '$2a$10$PoZafEkqQkZiKbdcSQCyO.o6Ox9ZVlzlveWStg2k2roFlZTQPhN7m', 'em1', '0334407222', NULL, NULL, 'LOCAL', 'EMPLOYER', 'ACTIVE', 0, NULL, '2026-04-11 17:07:46', '2026-04-11 17:07:46', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_applications_full`
-- (See below for the actual view)
--
CREATE TABLE `v_applications_full` (
`id` bigint(20)
,`job_id` bigint(20)
,`candidate_id` bigint(20)
,`cv_url` varchar(500)
,`cover_letter` text
,`status` enum('PENDING','VIEWED','INTERVIEW','APPROVED','REJECTED')
,`notes` text
,`applied_at` timestamp
,`updated_at` timestamp
,`job_title` varchar(255)
,`company_name` varchar(255)
,`candidate_name` varchar(255)
,`candidate_email` varchar(100)
,`candidate_avatar` varchar(500)
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_jobs_full`
-- (See below for the actual view)
--
CREATE TABLE `v_jobs_full` (
`id` bigint(20)
,`employer_id` bigint(20)
,`category_id` int(11)
,`title` varchar(255)
,`description` text
,`requirements` text
,`benefits` text
,`job_type` enum('FULL_TIME','PART_TIME','FREELANCE','INTERNSHIP')
,`job_level` enum('INTERN','FRESHER','JUNIOR','SENIOR','MANAGER','ANY')
,`salary_min` bigint(20)
,`salary_max` bigint(20)
,`is_negotiable` tinyint(1)
,`location` varchar(500)
,`city` varchar(100)
,`positions` int(11)
,`deadline` date
,`status` enum('DRAFT','OPEN','CLOSED','EXPIRED')
,`views` int(11)
,`created_at` timestamp
,`updated_at` timestamp
,`company_name` varchar(255)
,`company_logo` varchar(500)
,`category_name` varchar(100)
,`total_applications` bigint(21)
);

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_applications_full`
--
DROP TABLE IF EXISTS `v_applications_full`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_applications_full`  AS SELECT `a`.`id` AS `id`, `a`.`job_id` AS `job_id`, `a`.`candidate_id` AS `candidate_id`, `a`.`cv_url` AS `cv_url`, `a`.`cover_letter` AS `cover_letter`, `a`.`status` AS `status`, `a`.`notes` AS `notes`, `a`.`applied_at` AS `applied_at`, `a`.`updated_at` AS `updated_at`, `j`.`title` AS `job_title`, `e`.`company_name` AS `company_name`, `u`.`full_name` AS `candidate_name`, `u`.`email` AS `candidate_email`, `u`.`avatar_url` AS `candidate_avatar` FROM ((((`applications` `a` join `jobs` `j` on(`a`.`job_id` = `j`.`id`)) join `employers` `e` on(`j`.`employer_id` = `e`.`id`)) join `candidates` `cand` on(`a`.`candidate_id` = `cand`.`id`)) join `users` `u` on(`cand`.`user_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_jobs_full`
--
DROP TABLE IF EXISTS `v_jobs_full`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_jobs_full`  AS SELECT `j`.`id` AS `id`, `j`.`employer_id` AS `employer_id`, `j`.`category_id` AS `category_id`, `j`.`title` AS `title`, `j`.`description` AS `description`, `j`.`requirements` AS `requirements`, `j`.`benefits` AS `benefits`, `j`.`job_type` AS `job_type`, `j`.`job_level` AS `job_level`, `j`.`salary_min` AS `salary_min`, `j`.`salary_max` AS `salary_max`, `j`.`is_negotiable` AS `is_negotiable`, `j`.`location` AS `location`, `j`.`city` AS `city`, `j`.`positions` AS `positions`, `j`.`deadline` AS `deadline`, `j`.`status` AS `status`, `j`.`views` AS `views`, `j`.`created_at` AS `created_at`, `j`.`updated_at` AS `updated_at`, `e`.`company_name` AS `company_name`, `e`.`logo_url` AS `company_logo`, `c`.`name` AS `category_name`, (select count(0) from `applications` where `applications`.`job_id` = `j`.`id`) AS `total_applications` FROM ((`jobs` `j` join `employers` `e` on(`j`.`employer_id` = `e`.`id`)) left join `categories` `c` on(`j`.`category_id` = `c`.`id`)) ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_action` (`user_id`,`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_application` (`job_id`,`candidate_id`),
  ADD UNIQUE KEY `UKkphvsdbcird8yi4ye3ip913d7` (`candidate_id`,`job_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_job_status` (`job_id`,`status`);

--
-- Chỉ mục cho bảng `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_city` (`city`);

--
-- Chỉ mục cho bảng `candidate_skills`
--
ALTER TABLE `candidate_skills`
  ADD PRIMARY KEY (`candidate_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_active` (`is_active`);

--
-- Chỉ mục cho bảng `employers`
--
ALTER TABLE `employers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_verified` (`is_verified`);

--
-- Chỉ mục cho bảng `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employer_id` (`employer_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_status_city` (`status`,`city`),
  ADD KEY `idx_created` (`created_at`);
ALTER TABLE `jobs` ADD FULLTEXT KEY `idx_search` (`title`,`description`);

--
-- Chỉ mục cho bảng `job_skills`
--
ALTER TABLE `job_skills`
  ADD PRIMARY KEY (`job_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Chỉ mục cho bảng `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `idx_conversation` (`sender_id`,`receiver_id`,`created_at`),
  ADD KEY `idx_unread` (`receiver_id`,`is_read`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKkqch6u8el8d56wg7bm6fpqpnc` (`candidate_id`,`job_id`),
  ADD KEY `FKry68f2at4f0rk838c5yoiergj` (`employer_id`),
  ADD KEY `FKqnic4bk1c0ljhjkvyrr055m4a` (`job_id`);

--
-- Chỉ mục cho bảng `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_saved` (`candidate_id`,`job_id`),
  ADD UNIQUE KEY `UK6e7b2qng7km656gwv8c4cv8kj` (`candidate_id`,`job_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Chỉ mục cho bảng `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_google_id` (`google_id`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_online` (`is_online`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `employers`
--
ALTER TABLE `employers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `saved_jobs`
--
ALTER TABLE `saved_jobs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `candidate_skills`
--
ALTER TABLE `candidate_skills`
  ADD CONSTRAINT `candidate_skills_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `candidate_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `employers`
--
ALTER TABLE `employers`
  ADD CONSTRAINT `employers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `job_skills`
--
ALTER TABLE `job_skills`
  ADD CONSTRAINT `job_skills_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `job_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `FKmv59qy2s9xvpvj5k0bqgsik2f` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`),
  ADD CONSTRAINT `FKqnic4bk1c0ljhjkvyrr055m4a` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  ADD CONSTRAINT `FKry68f2at4f0rk838c5yoiergj` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`id`);

--
-- Các ràng buộc cho bảng `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD CONSTRAINT `saved_jobs_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_jobs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
