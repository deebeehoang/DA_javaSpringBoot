import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import { candidateService } from '@/services/candidateService';
import type { Application } from '@/types';
import type { CandidateStats } from '@/services/candidateService';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển ứng viên</h1>

      {/* Stats */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Tổng đơn', value: stats.totalApplications, color: 'blue' },
            { label: 'Chờ duyệt', value: stats.pending, color: 'yellow' },
            { label: 'Được nhận', value: stats.approved, color: 'green' },
            { label: 'Bị từ chối', value: stats.rejected, color: 'red' },
            { label: 'Việc đã lưu', value: stats.savedJobs, color: 'purple' },
            { label: 'Kỹ năng', value: stats.skills, color: 'indigo' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-white p-4 text-center">
              <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/candidate/profile" className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
          Hồ sơ của tôi
        </Link>
        <Link to="/candidate/skills" className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100">
          Kỹ năng
        </Link>
        <Link to="/candidate/saved-jobs" className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-100">
          Việc đã lưu
        </Link>
        <Link to="/jobs" className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-100">
          Tìm việc
        </Link>
      </div>

      {/* Applications list */}
      <h2 className="mt-8 text-lg font-semibold text-gray-800">Đơn ứng tuyển gần đây</h2>

      {applications.length === 0 ? (
        <div className="mt-4 text-center text-gray-500">
          <p>Bạn chưa ứng tuyển công việc nào.</p>
          <Link to="/jobs" className="mt-2 inline-block text-blue-600 hover:underline">
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="rounded-lg border bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/jobs/${app.job.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                  >
                    {app.job.title}
                  </Link>
                  <p className="text-sm text-blue-600">{app.job.employer.companyName}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Ngày ứng tuyển: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[app.status]}`}>
                    {statusLabel[app.status]}
                  </span>
                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
                    >
                      Rút đơn
                    </button>
                  )}
                </div>
              </div>
              {app.coverLetter && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{app.coverLetter}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
