import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import { candidateService } from '@/services/candidateService';
import { useAuth } from '@/context/AuthContext';
import type { Job } from '@/types';

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time', INTERNSHIP: 'Thực tập', FREELANCE: 'Freelance',
};

const jobLevelLabels: Record<string, string> = {
  INTERN: 'Thực tập sinh', FRESHER: 'Fresher', JUNIOR: 'Junior', SENIOR: 'Senior', MANAGER: 'Quản lý', ANY: 'Tất cả',
};

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(0) + ' triệu' : n.toLocaleString();
  if (min && max) return `${fmt(min)} - ${fmt(max)} VNĐ`;
  if (min) return `Từ ${fmt(min)} VNĐ`;
  return `Đến ${fmt(max!)} VNĐ`;
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    jobService
      .getById(Number(id))
      .then((res) => setJob(res.data.data!))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (user?.role === 'CANDIDATE' && id) {
      candidateService.checkSaved(Number(id)).then((res) => setSaved(res.data.data ?? false)).catch(() => {});
    }
  }, [id, user]);

  const toggleSave = async () => {
    if (!id) return;
    try {
      if (saved) {
        await candidateService.unsaveJob(Number(id));
        setSaved(false);
      } else {
        await candidateService.saveJob(Number(id));
        setSaved(true);
      }
    } catch { /* ignore */ }
  };

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await applicationService.apply({ jobId: Number(id), coverLetter });
      setMessage('Ứng tuyển thành công!');
      setShowApplyForm(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-blue-200 transition hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Quay lại danh sách
          </Link>

          <div className="mt-4 flex items-start gap-5">
            {job.employer?.logoUrl ? (
              <img src={job.employer.logoUrl} alt="" className="h-16 w-16 rounded-xl border-2 border-white/20 bg-white object-contain" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold text-white backdrop-blur">
                {job.employer?.companyName?.[0] ?? 'C'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white md:text-3xl">{job.title}</h1>
              <p className="mt-1 text-lg text-blue-200">{job.employer?.companyName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {jobTypeLabels[job.jobType] ?? job.jobType}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {jobLevelLabels[job.jobLevel] ?? job.jobLevel}
                </span>
                {job.city && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.city}
                  </span>
                )}
                <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-medium text-green-200 backdrop-blur">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Mô tả công việc
              </h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.description}</div>
            </section>

            {job.requirements && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  Yêu cầu
                </h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.requirements}</div>
              </section>
            )}

            {job.benefits && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  Quyền lợi
                </h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{job.benefits}</div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Info Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">Thông tin chung</h3>
              <div className="mt-4 space-y-3">
                {[
                  { icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Loại công việc', value: jobTypeLabels[job.jobType] ?? job.jobType },
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Cấp bậc', value: jobLevelLabels[job.jobLevel] ?? job.jobLevel },
                  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Số vị trí', value: `${job.positions} người` },
                  { icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Lượt xem', value: `${job.views}` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
                {job.category && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Danh mục</p>
                      <p className="text-sm font-medium text-gray-900">{job.category.name}</p>
                    </div>
                  </div>
                )}
                {job.deadline && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hạn nộp hồ sơ</p>
                      <p className="text-sm font-medium text-red-600">{new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Section */}
            {user?.role === 'CANDIDATE' && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
                <button
                  onClick={toggleSave}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition ${
                    saved
                      ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <svg className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {saved ? 'Đã lưu' : 'Lưu tin này'}
                </button>

                {job.status === 'OPEN' && (
                  <>
                    {message && (
                      <div className={`rounded-xl px-4 py-3 text-sm ${message.includes('thành công') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                        {message}
                      </div>
                    )}
                    {!showApplyForm ? (
                      <button
                        onClick={() => setShowApplyForm(true)}
                        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                      >
                        Ứng tuyển ngay
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          placeholder="Thư giới thiệu (không bắt buộc)"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleApply}
                            disabled={applying}
                            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            {applying ? 'Đang gửi...' : 'Gửi ứng tuyển'}
                          </button>
                          <button
                            onClick={() => setShowApplyForm(false)}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
