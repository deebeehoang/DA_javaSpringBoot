import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export default function JobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    applicationService
      .byJob(Number(jobId))
      .then((res) => setApplications(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, [jobId]);

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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Đơn ứng tuyển</h1>

      {applications.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">Chưa có đơn ứng tuyển nào.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {app.candidate.user?.fullName ?? 'Ứng viên'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {app.candidate.user?.email}
                  </p>
                  {app.candidate.cvUrl && (
                    <a
                      href={app.candidate.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                    >
                      Xem CV
                    </a>
                  )}
                  {app.coverLetter && (
                    <p className="mt-2 text-sm text-gray-600">{app.coverLetter}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[app.status]}`}
                >
                  {statusLabel[app.status]}
                </span>
              </div>

              {app.status === 'PENDING' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateStatus(app.id, 'INTERVIEW')}
                    className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
                  >
                    Phỏng vấn
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, 'APPROVED')}
                    className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, 'REJECTED')}
                    className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                  >
                    Từ chối
                  </button>
                </div>
              )}
              {app.status === 'INTERVIEW' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateStatus(app.id, 'APPROVED')}
                    className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, 'REJECTED')}
                    className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
