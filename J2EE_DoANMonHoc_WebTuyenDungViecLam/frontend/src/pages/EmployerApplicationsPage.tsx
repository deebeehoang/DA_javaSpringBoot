import { useEffect, useState } from 'react';
import { applicationService } from '@/services/applicationService';
import type { Application } from '@/types';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  INTERVIEW: 'Phỏng vấn',
  APPROVED: 'Chấp nhận',
  REJECTED: 'Từ chối',
};

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý ứng viên</h1>

      {/* Filter */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Lọc theo trạng thái:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm"
        >
          <option value="">Tất cả ({applications.length})</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]} ({applications.filter((a) => a.status === s).length})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">Không có đơn ứng tuyển nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Ứng viên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">CV</th>
                <th className="px-4 py-3">Vị trí ứng tuyển</th>
                <th className="px-4 py-3">Ngày nộp</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((app) => (
                <tr key={app.id} className="bg-white hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                    {app.candidate.user?.fullName ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {app.candidate.user?.email ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {app.candidate.cvUrl ? (
                      <a
                        href={app.candidate.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Xem CV
                      </a>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{app.job.title}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[app.status]}`}
                    >
                      {statusLabel[app.status] ?? app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
