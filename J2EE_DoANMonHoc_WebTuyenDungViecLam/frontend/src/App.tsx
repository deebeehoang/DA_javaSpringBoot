import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import HomePage from '@/pages/HomePage';
import JobListPage from '@/pages/JobListPage';
import JobDetailPage from '@/pages/JobDetailPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CandidateProfilePage from '@/pages/CandidateProfilePage';
import CandidateSkillsPage from '@/pages/CandidateSkillsPage';
import SavedJobsPage from '@/pages/SavedJobsPage';
import EmployerDashboard from '@/pages/EmployerDashboard';
import EmployerProfilePage from '@/pages/EmployerProfilePage';
import CreateJobPage from '@/pages/CreateJobPage';
import EditJobPage from '@/pages/EditJobPage';
import JobApplicationsPage from '@/pages/JobApplicationsPage';
import EmployerApplicationsPage from '@/pages/EmployerApplicationsPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminJobsPage from '@/pages/AdminJobsPage';
import AdminCategoriesPage from '@/pages/AdminCategoriesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Candidate */}
        <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
          <Route path="/candidate/profile" element={<CandidateProfilePage />} />
          <Route path="/candidate/skills" element={<CandidateSkillsPage />} />
          <Route path="/candidate/saved-jobs" element={<SavedJobsPage />} />
        </Route>

        {/* Employer */}
        <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/profile" element={<EmployerProfilePage />} />
          <Route path="/employer/jobs/create" element={<CreateJobPage />} />
          <Route path="/employer/jobs/:id/edit" element={<EditJobPage />} />
          <Route path="/employer/jobs/:jobId/applications" element={<JobApplicationsPage />} />
          <Route path="/employer/applications" element={<EmployerApplicationsPage />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
