import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import type { Application } from '@/types';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  INTERVIEW: 'Phỏng vấn',
  APPROVED: 'Chấp nhận',
  REJECTED: 'Từ chối',
};

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  INTERVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const statusOptions = ['PENDING', 'INTERVIEW', 'APPROVED', 'REJECTED'];

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    applicationService
      .byEmployer()
      .then((res) => setApplications(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await applicationService.updateStatus(id, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as Application['status'] } : a)),
      );
    } catch {
      /* ignore */
    }
  };

  const filtered = filterStatus
    ? applications.filter((a) => a.status === filterStatus)
    : applications;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/employer/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Quản lý tuyển dụng
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Quản lý ứng viên</h1>
        <p className="mt-1 text-sm text-gray-500">{applications.length} ứng viên tổng cộng</p>

        {/* Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { value: '', label: `Tất cả (${applications.length})` },
            ...statusOptions.map((s) => ({
              value: s,
              label: `${statusLabel[s]} (${applications.filter((a) => a.status === s).length})`,
            })),
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                filterStatus === f.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="mt-4 text-gray-500">Không có đơn ứng tuyển nào.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/50">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Ứng viên</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">CV</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Vị trí</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày nộp</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((app) => (
                    <tr key={app.id} className="transition hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                            {app.candidate.user?.fullName?.[0] ?? '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{app.candidate.user?.fullName ?? 'N/A'}</p>
                            <p className="text-xs text-gray-500">{app.candidate.user?.email ?? 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {app.candidate.cvUrl ? (
                          <a href={app.candidate.cvUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Xem CV
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Chưa có</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/jobs/${app.job.id}`} className="text-sm text-gray-700 hover:text-blue-600">{app.job.title}</Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                        {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge[app.status]}`}>
                          {statusLabel[app.status] ?? app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{statusLabel[s]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
