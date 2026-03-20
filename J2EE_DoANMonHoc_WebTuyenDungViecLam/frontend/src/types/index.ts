// ──── Enums ────
export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type EducationLevel = 'HIGH_SCHOOL' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'INTERNSHIP';
export type JobLevel = 'INTERN' | 'FRESHER' | 'JUNIOR' | 'SENIOR' | 'MANAGER' | 'ANY';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'EXPIRED';
export type ApplicationStatus = 'PENDING' | 'INTERVIEW' | 'APPROVED' | 'REJECTED';
export type CompanyType = 'COMPANY' | 'INDIVIDUAL';
export type CompanySize = '_1_10' | '_11_50' | '_51_200' | '_201_500' | '_500_PLUS';
export type SkillCategory = 'TECHNICAL' | 'SOFT_SKILL' | 'LANGUAGE' | 'OTHER';
export type SkillLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

// ──── User / Auth ────
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  authProvider: AuthProvider;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'CANDIDATE' | 'EMPLOYER';
  companyName?: string;
}

// ──── Employer ────
export interface Employer {
  id: number;
  companyName: string;
  companyType?: CompanyType;
  companySize?: CompanySize;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  industry?: string;
  isVerified: boolean;
}

// ──── Candidate ────
export interface Candidate {
  id: number;
  dateOfBirth?: string;
  gender?: Gender;
  city?: string;
  educationLevel?: EducationLevel;
  yearsOfExperience?: number;
  salary?: number;
  bio?: string;
  cvUrl?: string;
}

// ──── Category ────
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  active: boolean;
}

// ──── Job ────
export interface Job {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  jobType: JobType;
  jobLevel: JobLevel;
  status: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  city?: string;
  positions: number;
  deadline?: string;
  views: number;
  applicationCount?: number;
  employer: Employer;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface JobCreateRequest {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  jobType: JobType;
  jobLevel: JobLevel;
  categoryId?: number | '';
  salaryMin?: number | '';
  salaryMax?: number | '';
  location: string;
  city: string;
  positions: number;
  deadline?: string;
}

export interface JobUpdateRequest extends Partial<JobCreateRequest> {}

// ──── Application ────
export interface ApplicationCandidate {
  id: number;
  cvUrl?: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
  };
}

export interface ApplicationJob {
  id: number;
  title: string;
  employer: {
    id: number;
    companyName: string;
    logoUrl?: string;
  };
}

export interface Application {
  id: number;
  candidate: ApplicationCandidate;
  job: ApplicationJob;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt: string;
}

export interface ApplicationRequest {
  jobId: number;
  coverLetter?: string;
}

// ──── Skill ────
export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
}

// ──── Notification ────
export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ──── API Response ────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  timestamp: string;
  // pagination
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

// ──── Search Params ────
export interface JobSearchParams {
  keyword?: string;
  categoryId?: number;
  city?: string;
  jobType?: JobType;
  page?: number;
  size?: number;
}

// ──── Profile ────
export interface CandidateProfile {
  id: number;
  user: User;
  dateOfBirth?: string;
  gender?: Gender;
  city?: string;
  educationLevel?: EducationLevel;
  yearsOfExperience?: number;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  bio?: string;
  cvUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfileRequest {
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  educationLevel?: string;
  yearsOfExperience?: number;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  bio?: string;
  cvUrl?: string;
}

export interface EmployerProfile {
  id: number;
  user: User;
  companyName: string;
  companyType?: string;
  companySize?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  industry?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerProfileRequest {
  companyName?: string;
  companyType?: string;
  companySize?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  industry?: string;
}
