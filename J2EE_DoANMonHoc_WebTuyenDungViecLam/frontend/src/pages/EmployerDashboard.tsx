import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { profileService } from '@/services/profileService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Job, MonthlyCount } from '@/types';

const statusLabel: Record<string, string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang tuyển',
  CLOSED: 'Đã đóng',
  EXPIRED: 'Hết hạn',
};

const statusBadge: Record<string, string> = {
  DRAFT: 'bg-gray-50 text-gray-600 border-gray-200',
  OPEN: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-red-50 text-red-600 border-red-200',
  EXPIRED: 'bg-orange-50 text-orange-600 border-orange-200',
};

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Thực tập',
};

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ applicationsByMonth: MonthlyCount[]; jobsByMonth: MonthlyCount[] } | null>(null);
  const navigate = useNavigate();

  const fetchJobs = () => {
    setLoading(true);
    jobService
      .myJobs()
      .then((res) => {
        const pageData = res.data.data as any;
        setJobs(pageData?.content ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
    profileService.getEmployerChartStats().then((res) => setChartData(res.data.data ?? null)).catch(() => {});
  }, []);

  const handleStatusChange = async (jobId: number, status: string) => {
    try {
      await jobService.updateMyJobStatus(jobId, status);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: status as Job['status'] } : j)));
    } catch { /* ignore */ }
  };

  const handleDelete = async (jobId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return;
    try {
      await jobService.delete(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch { /* ignore */ }
  };

  const openCount = jobs.filter((j) => j.status === 'OPEN').length;
  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationCount ?? 0), 0);
  const totalViews = jobs.reduce((sum, j) => sum + (j.views ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tuyển dụng</h1>
            <p className="mt-1 text-sm text-gray-500">Quản lý tin đăng và ứng viên của bạn</p>
          </div>
          <Link
            to="/employer/jobs/create"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Đăng tin mới
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Tổng tin đăng', value: jobs.length, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', color: 'blue' },
            { label: 'Đang tuyển', value: openCount, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
            { label: 'Tổng ứng tuyển', value: totalApps, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'purple' },
            { label: 'Tổng lượt xem', value: totalViews, icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'orange' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-${s.color}-100`}>
                <svg className={`h-5 w-5 text-${s.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/employer/applications" className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-600 transition hover:bg-purple-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Quản lý ứng viên
          </Link>
          <Link to="/employer/profile" className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Hồ sơ công ty
          </Link>
        </div>

        {/* Charts */}
        {chartData && (() => {
          const months = new Set<string>();
          chartData.jobsByMonth.forEach(d => months.add(d.month));
          chartData.applicationsByMonth.forEach(d => months.add(d.month));
          const data = Array.from(months).sort().map(m => ({
            month: m,
            'Tin tuyển dụng': chartData.jobsByMonth.find(d => d.month === m)?.count ?? 0,
            'Đơn ứng tuyển': chartData.applicationsByMonth.find(d => d.month === m)?.count ?? 0,
          }));
          return (
            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Thống kê 6 tháng gần đây</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Tin tuyển dụng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Đơn ứng tuyển" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })()}

        {/* Job list */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">Tin tuyển dụng</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              <p className="mt-4 text-gray-500">Bạn chưa đăng tin tuyển dụng nào.</p>
              <Link to="/employer/jobs/create" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
                Đăng tin ngay
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-base font-semibold text-gray-900 transition hover:text-blue-600"
                        >
                          {job.title}
                        </Link>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge[job.status]}`}>
                          {statusLabel[job.status]}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {jobTypeLabel[job.jobType] ?? job.jobType}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {job.city}
                        </span>
                        <span>{job.positions} vị trí</span>
                        <span>{job.views} lượt xem</span>
                        <span className="font-medium text-blue-600">{job.applicationCount ?? 0} ứng tuyển</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/employer/jobs/${job.id}/applications`}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Xem ứng viên
                    </Link>
                    <button
                      onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Chỉnh sửa
                    </button>

                    {job.status === 'DRAFT' && (
                      <button onClick={() => handleStatusChange(job.id, 'OPEN')} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100">Đăng tuyển</button>
                    )}
                    {job.status === 'OPEN' && (
                      <button onClick={() => handleStatusChange(job.id, 'CLOSED')} className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100">Đóng tuyển</button>
                    )}
                    {job.status === 'CLOSED' && (
                      <button onClick={() => handleStatusChange(job.id, 'OPEN')} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100">Mở lại</button>
                    )}

                    <button
                      onClick={() => handleDelete(job.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
