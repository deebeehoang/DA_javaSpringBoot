# PartTimeHub - Web Tuyển Dụng Việc Làm

Nền tảng tuyển dụng việc làm full-stack xây dựng bằng **Spring Boot 4** và **React TypeScript**, hỗ trợ đăng tuyển, ứng tuyển, thông báo real-time và quản lý hồ sơ toàn diện.

---

## Tính Năng Nổi Bật

- **Xác thực JWT** - Đăng ký/đăng nhập bảo mật với phân quyền theo vai trò (Admin / Nhà tuyển dụng / Ứng viên)
- **Tìm kiếm việc làm nâng cao** - Lọc theo danh mục, thành phố, loại công việc, cấp bậc, mức lương
- **Thông báo real-time** - Server-Sent Events (SSE) cho thông báo tức thì
- **Gửi email tự động** - Thông báo qua Gmail SMTP khi có đơn ứng tuyển mới hoặc cập nhật trạng thái
- **Upload file** - Ảnh đại diện, CV (PDF/DOC), logo công ty
- **Tích hợp Mapbox** - Geocoding địa chỉ công ty
- **Bảng điều khiển Admin** - Quản lý người dùng, việc làm, danh mục

---

## Công Nghệ Sử Dụng

### Backend
| Công nghệ | Phiên bản |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.2 |
| Spring Security | JWT stateless |
| Spring Data JPA | Hibernate / MySQL |
| Spring Mail | Gmail SMTP |
| JJWT | 0.12.5 |
| Lombok | - |
| Thymeleaf | Template engine |

### Frontend
| Công nghệ | Mô tả |
|---|---|
| React | UI framework |
| TypeScript | Type-safe JavaScript |
| Vite | Build tool |
| Context API | Quản lý trạng thái xác thực |

### Cơ sở dữ liệu
- MySQL 8+

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────┐
│              React + TypeScript (Vite)           │
│  Trang người dùng  │  Trang admin  │  Auth       │
└──────────────────────────┬──────────────────────┘
                           │ HTTP / SSE
┌──────────────────────────▼──────────────────────┐
│              Spring Boot REST API                │
│  Controllers  │  Services  │  Security (JWT)     │
└──────────────────────────┬──────────────────────┘
                           │ JPA / Hibernate
┌──────────────────────────▼──────────────────────┐
│                    MySQL Database                │
└─────────────────────────────────────────────────┘
```

---

## Cấu Trúc Dự Án

```
J2EE_DoANMonHoc_WebTuyenDungViecLam/
├── src/main/java/com/example/DA_WebTuyenDungViecLam/
│   ├── Config/                  # Cấu hình Security, CORS, Async
│   ├── controller/              # REST API Controllers
│   ├── dto/
│   │   ├── request/             # Request DTOs
│   │   └── response/            # Response DTOs
│   ├── entity/                  # JPA Entities
│   │   └── ids/                 # Composite Keys
│   ├── enums/                   # Enum types
│   ├── exception/               # Custom Exceptions & Global Handler
│   ├── repository/              # Spring Data JPA Repositories
│   ├── security/                # JWT Filter & Util
│   └── service/
│       └── impl/                # Service implementations
├── src/main/resources/
│   ├── application.properties   # Cấu hình ứng dụng
│   └── templates/               # Thymeleaf templates
├── frontend/                    # React TypeScript frontend
│   ├── src/
│   │   ├── pages/               # Trang ứng dụng
│   │   ├── components/          # Components dùng lại
│   │   ├── context/             # AuthContext
│   │   └── layouts/             # Layout wrappers
│   └── vite.config.ts
├── uploads/                     # Thư mục lưu file upload
└── pom.xml
```

---

## API Endpoints

### Xác thực (`/api/auth`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/register` | Đăng ký tài khoản |
| POST | `/login` | Đăng nhập |
| GET | `/me` | Thông tin người dùng hiện tại |

### Việc làm (`/api/jobs`)
| Method | Endpoint | Phân quyền |
|---|---|---|
| GET | `/` | Public - Tìm kiếm & lọc |
| GET | `/{id}` | Public - Chi tiết việc làm |
| POST | `/` | Nhà tuyển dụng |
| PUT | `/{id}` | Nhà tuyển dụng |
| DELETE | `/{id}` | Nhà tuyển dụng |
| GET | `/my` | Nhà tuyển dụng - Danh sách của tôi |
| PATCH | `/{id}/status` | Admin |

### Đơn ứng tuyển (`/api/applications`)
| Method | Endpoint | Phân quyền |
|---|---|---|
| POST | `/` | Ứng viên - Ứng tuyển |
| GET | `/my` | Ứng viên - Đơn của tôi |
| GET | `/job/{jobId}` | Nhà tuyển dụng |
| PATCH | `/{id}/status` | Nhà tuyển dụng |
| DELETE | `/{id}` | Ứng viên - Rút đơn |

### Thông báo (`/api/notifications`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Danh sách thông báo |
| GET | `/unread-count` | Số thông báo chưa đọc |
| PATCH | `/{id}/read` | Đánh dấu đã đọc |
| GET | `/stream` | SSE stream real-time |

### Upload file (`/api/upload`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/avatar` | Upload ảnh đại diện |
| POST | `/cv` | Upload CV |
| POST | `/logo` | Upload logo công ty |

### Admin (`/api/admin`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/stats` | Thống kê tổng quan |
| GET | `/users` | Quản lý người dùng |
| PATCH | `/users/{id}/status` | Khóa/mở tài khoản |
| GET | `/jobs` | Quản lý việc làm |
| GET/POST/PUT | `/categories` | Quản lý danh mục |

---

## Mô Hình Dữ Liệu

```
User ──────── Candidate ──── CandidateSkill ──── Skill
  │               │
  └── Employer    └── SavedJob ──── Job
         │                           │
         └── Job ───────── Application (Candidate)
                    │
                    └── JobSkill ──── Skill

User ──── Notification
```

### Các Enum chính
- **UserRole**: `ADMIN`, `EMPLOYER`, `CANDIDATE`
- **JobType**: `FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `FREELANCE`
- **JobLevel**: `FRESHER`, `JUNIOR`, `SENIOR`, `MANAGER`, `ANY`
- **JobStatus**: `DRAFT`, `OPEN`, `CLOSED`, `PAUSED`
- **ApplicationStatus**: `PENDING`, `APPROVED`, `REJECTED`

---

## Hướng Dẫn Cài Đặt

### Yêu cầu
- Java 21+
- Maven 3.8+
- MySQL 8+
- Node.js 18+ & npm
- Tài khoản Gmail (gửi email)
- Tài khoản Mapbox (geocoding địa chỉ)

### 1. Clone dự án

```bash
git clone <repository-url>
cd J2EE_DoANMonHoc_WebTuyenDungViecLam
```

### 2. Tạo cơ sở dữ liệu MySQL

```sql
CREATE DATABASE job_recruitment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình `application.properties`

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/job_recruitment?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

# JWT
app.jwt.secret=YOUR_JWT_SECRET_KEY_AT_LEAST_256_BITS
app.jwt.expiration=86400000

# Gmail SMTP
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-specific-password
app.mail.from=your-email@gmail.com

# Mapbox
mapbox.access-token=YOUR_MAPBOX_ACCESS_TOKEN

# File upload
app.upload.dir=uploads
```

> **Lưu ý:** Sử dụng **App Password** của Gmail (không phải mật khẩu thông thường). Bật 2FA trên tài khoản Google và tạo App Password tại myaccount.google.com/apppasswords.

### 4. Chạy Backend

```bash
./mvnw spring-boot:run
```

Backend chạy tại: `http://localhost:8080`

Dữ liệu mẫu sẽ tự động được tạo khi khởi động lần đầu (1 Admin, 1 Nhà tuyển dụng, 1 Ứng viên, 6 danh mục, 4 việc làm).

### 5. Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## Tài Khoản Demo

Sau khi chạy lần đầu, hệ thống tự động tạo:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@example.com | Admin123! |
| Nhà tuyển dụng | employer@example.com | Employer123! |
| Ứng viên | candidate@example.com | Candidate123! |

---

## Luồng Hoạt Động

### Đăng ký & Đăng nhập
```
Người dùng → POST /api/auth/register
           → Tạo User + Profile (Candidate/Employer)
           → Trả về JWT token
```

### Ứng tuyển việc làm
```
Ứng viên → POST /api/applications
         → Tạo đơn ứng tuyển
         → Tạo Notification (Employer + Candidate)
         → Gửi email async (Gmail SMTP)
         → SSE push thông báo real-time
```

### Upload file
```
Người dùng → POST /api/upload/avatar (multipart)
           → Validate loại file & kích thước
           → Xóa file cũ (nếu có)
           → Lưu file mới với tên UUID
           → Cập nhật DB & trả về URL
```

---

## Bảo Mật

- Mật khẩu được hash bằng **BCrypt**
- Token JWT có thời hạn **24 giờ**
- CORS chỉ cho phép origin `http://localhost:5173`
- Upload file giới hạn loại (whitelist) và kích thước
- Phân quyền theo vai trò với `@PreAuthorize`
- SSE stream dùng query param token (EventSource không hỗ trợ custom headers)

---

## Đánh Giá Dự Án

### Điểm Mạnh
- Kiến trúc phân lớp rõ ràng: Controller → Service → Repository
- Phân quyền đầy đủ 3 vai trò (Admin / Nhà tuyển dụng / Ứng viên)
- Real-time notification với SSE kết hợp email fallback
- Xử lý bất đồng bộ với `@Async` giúp email không block request
- Validation và exception handling toàn diện với HTTP status codes chuẩn
- Dữ liệu mẫu tự động tạo khi khởi động (TestDataRunner)

### Hướng Phát Triển
- Tích hợp OAuth2 Google Login (cơ sở dữ liệu đã sẵn trường `googleId`)
- Chat real-time giữa ứng viên và nhà tuyển dụng (WebSocket)
- Đề xuất việc làm dựa trên kỹ năng ứng viên (Recommendation Engine)
- Tìm kiếm full-text với Elasticsearch
- Triển khai Docker & CI/CD pipeline

---

## Môi Trường Phát Triển

```
OS:           Windows 10/11
IDE:          IntelliJ IDEA / VS Code
Java:         21 (LTS)
Spring Boot:  4.0.2
Node.js:      18+
MySQL:        8.0
```

---

## Giấy Phép

Dự án môn học - J2EE / Đồ án môn học Web Tuyển Dụng Việc Làm
