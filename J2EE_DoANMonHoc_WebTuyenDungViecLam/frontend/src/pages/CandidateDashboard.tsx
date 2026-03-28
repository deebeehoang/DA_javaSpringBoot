import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import { candidateService } from '@/services/candidateService';
import type { Application } from '@/types';
import type { CandidateStats } from '@/services/candidateService';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Được chấp nhận',
  REJECTED: 'Bị từ chối',
};

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationService.myApplications(),
      candidateService.getStats(),
    ])
      .then(([appRes, statsRes]) => {
        setApplications(appRes.data.data ?? []);
        setStats(statsRes.data.data ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) return;
    try {
      await applicationService.withdraw(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (stats) setStats({ ...stats, totalApplications: stats.totalApplications - 1, pending: stats.pending - 1 });
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng đơn', value: stats?.totalApplications ?? 0, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'blue' },
    { label: 'Chờ duyệt', value: stats?.pending ?? 0, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'yellow' },
    { label: 'Được nhận', value: stats?.approved ?? 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
    { label: 'Bị từ chối', value: stats?.rejected ?? 0, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'red' },
    { label: 'Việc đã lưu', value: stats?.savedJobs ?? 0, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'purple' },
    { label: 'Kỹ năng', value: stats?.skills ?? 0, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'indigo' },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
            <p className="mt-1 text-sm text-gray-500">Quản lý hồ sơ và đơn ứng tuyển của bạn</p>
          </div>
          <Link to="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Tìm việc
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((s) => {
            const c = colorMap[s.color];
            return (
              <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <svg className={`h-5 w-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { to: '/candidate/profile', label: 'Hồ sơ của tôi', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'blue' },
            { to: '/candidate/skills', label: 'Kỹ năng', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'indigo' },
            { to: '/candidate/saved-jobs', label: 'Việc đã lưu', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'purple' },
          ].map(({ to, label, icon, color }) => (
            <Link key={to} to={to} className={`inline-flex items-center gap-2 rounded-xl bg-${color}-50 px-4 py-2.5 text-sm font-medium text-${color}-600 transition hover:bg-${color}-100`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
              {label}
            </Link>
          ))}
        </div>

        {/* Applications list */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">Đơn ứng tuyển gần đây</h2>

          {applications.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="mt-4 text-gray-500">Bạn chưa ứng tuyển công việc nào.</p>
              <Link to="/jobs" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
                Tìm việc ngay
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/jobs/${app.job.id}`}
                        className="text-base font-semibold text-gray-900 transition hover:text-blue-600"
                      >
                        {app.job.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-blue-600">{app.job.employer.companyName}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Ngày ứng tuyển: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusBadge[app.status]}`}>
                        {statusLabel[app.status]}
                      </span>
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Rút đơn
                        </button>
                      )}
                    </div>
                  </div>
                  {app.coverLetter && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{app.coverLetter}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
