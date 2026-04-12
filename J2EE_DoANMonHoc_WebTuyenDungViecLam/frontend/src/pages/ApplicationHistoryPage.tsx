import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import type { Application, ApplicationStatus } from '@/types';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; style: string; icon: string }> = {
  PENDING:   { label: 'Chờ duyệt',         style: 'bg-amber-50 text-amber-700 border-amber-200',   icon: '⏳' },
  VIEWED:    { label: 'Đã xem CV',          style: 'bg-blue-50 text-blue-700 border-blue-200',       icon: '👀' },
  INTERVIEW: { label: 'Mời phỏng vấn',      style: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '📅' },
  APPROVED:  { label: 'Được chấp nhận',     style: 'bg-green-50 text-green-700 border-green-200',    icon: '✅' },
  REJECTED:  { label: 'Không phù hợp',      style: 'bg-red-50 text-red-700 border-red-200',          icon: '❌' },
};

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)} triệu` : n.toLocaleString();
  if (min && max) return `${fmt(min)} – ${fmt(max)} VNĐ`;
  if (min) return `Từ ${fmt(min)} VNĐ`;
  return `Đến ${fmt(max!)} VNĐ`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCvFileName(url?: string) {
  if (!url) return null;
  const parts = url.split('/');
  return decodeURIComponent(parts[parts.length - 1]);
}

export default function ApplicationHistoryPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const fetchApplications = () => {
    setLoading(true);
    setError(null);
    applicationService.myApplications()
      .then((res) => setApplications(res.data.data ?? []))
      .catch((err) => setError(err.response?.data?.message ?? 'Không thể tải lịch sử ứng tuyển. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) return;
    setWithdrawingId(id);
    try {
      await applicationService.withdraw(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Không thể rút đơn. Vui lòng thử lại.');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/candidate/dashboard" className="text-gray-400 transition hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Lịch sử ứng tuyển
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Theo dõi toàn bộ quá trình ứng tuyển của bạn
              {!loading && applications.length > 0 && (
                <span className="ml-2 font-medium text-blue-600">{applications.length} đơn</span>
              )}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-16 flex flex-col items-center gap-3 text-gray-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm">Đang tải lịch sử ứng tuyển...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-gray-700">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && applications.length === 0 && (
          <div className="mt-16 text-center">
            <svg className="mx-auto h-20 w-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-600">Bạn chưa ứng tuyển vị trí nào</p>
            <p className="mt-1 text-sm text-gray-400">Hãy tìm kiếm và ứng tuyển những công việc phù hợp với bạn.</p>
            <Link to="/jobs" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm việc ngay
            </Link>
          </div>
        )}

        {/* Application cards */}
        {!loading && !error && applications.length > 0 && (
          <div className="mt-6 space-y-4">
            {applications.map((app) => {
              const sc = STATUS_CONFIG[app.status];
              const cvFileName = getCvFileName(app.cvUrl);
              return (
                <div key={app.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                  {/* Status bar */}
                  <div className={`flex items-center justify-between border-b px-5 py-3 ${
                    app.status === 'APPROVED' ? 'bg-green-50 border-green-100' :
                    app.status === 'REJECTED' ? 'bg-red-50 border-red-100' :
                    app.status === 'INTERVIEW' ? 'bg-indigo-50 border-indigo-100' :
                    'bg-gray-50 border-gray-100'
                  }`}>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${sc.style}`}>
                      <span>{sc.icon}</span>
                      {sc.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Ứng tuyển: {formatDate(app.appliedAt)}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="shrink-0">
                        {app.job.employer?.logoUrl ? (
                          <img src={app.job.employer.logoUrl} alt="" className="h-14 w-14 rounded-xl border object-contain p-1" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
                            {app.job.employer?.companyName?.[0] ?? 'C'}
                          </div>
                        )}
                      </div>

                      {/* Job info */}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/jobs/${app.job.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-blue-600"
                        >
                          {app.job.title}
                        </Link>
                        <p className="mt-0.5 font-medium text-gray-500">{app.job.employer?.companyName}</p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {/* Salary */}
                          <span className="flex items-center gap-1.5 font-semibold text-green-600">
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatSalary(app.job.salaryMin, app.job.salaryMax)}
                          </span>

                          {/* Location */}
                          {(app.job.city || app.job.location) && (
                            <span className="flex items-center gap-1.5 text-gray-500">
                              <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {app.job.city}{app.job.location ? ` – ${app.job.location}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-4 border-t border-gray-100" />

                    {/* CV & extras */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* CV sent */}
                        {cvFileName ? (
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="max-w-[180px] truncate text-xs text-gray-600">{cvFileName}</span>
                            <a
                              href={app.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-xs font-medium text-blue-600 hover:underline"
                            >
                              Xem
                            </a>
                            <span className="text-gray-300">|</span>
                            <a
                              href={app.cvUrl}
                              download
                              className="text-xs font-medium text-blue-600 hover:underline"
                            >
                              Tải
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Chưa đính kèm CV</span>
                        )}

                        {/* CV viewed badge */}
                        {app.cvViewed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            NTD đã xem CV
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${app.job.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Xem tin
                        </Link>
                        {app.status === 'PENDING' && (
                          <button
                            onClick={() => handleWithdraw(app.id)}
                            disabled={withdrawingId === app.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            {withdrawingId === app.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            Hủy ứng tuyển
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}