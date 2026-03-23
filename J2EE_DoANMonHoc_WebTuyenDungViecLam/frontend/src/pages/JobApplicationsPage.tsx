import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/employer/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Quản lý tuyển dụng
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Đơn ứng tuyển</h1>
        <p className="mt-1 text-sm text-gray-500">{applications.length} ứng viên đã nộp đơn</p>

        {applications.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="mt-4 text-gray-500">Chưa có đơn ứng tuyển nào.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
                      {app.candidate.user?.fullName?.[0] ?? '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {app.candidate.user?.fullName ?? 'Ứng viên'}
                      </h3>
                      <p className="text-sm text-gray-500">{app.candidate.user?.email}</p>
                      {app.candidate.cvUrl && (
                        <a href={app.candidate.cvUrl} target="_blank" rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Xem CV
                        </a>
                      )}
                      {app.coverLetter && (
                        <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 italic">"{app.coverLetter}"</p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Nộp đơn: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusBadge[app.status]}`}>
                    {statusLabel[app.status]}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-4">
                  {app.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(app.id, 'INTERVIEW')}
                        className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100">
                        Mời phỏng vấn
                      </button>
                      <button onClick={() => updateStatus(app.id, 'APPROVED')}
                        className="rounded-lg bg-green-50 px-4 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100">
                        Chấp nhận
                      </button>
                      <button onClick={() => updateStatus(app.id, 'REJECTED')}
                        className="rounded-lg bg-red-50 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100">
                        Từ chối
                      </button>
                    </>
                  )}
                  {app.status === 'INTERVIEW' && (
                    <>
                      <button onClick={() => updateStatus(app.id, 'APPROVED')}
                        className="rounded-lg bg-green-50 px-4 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100">
                        Chấp nhận
                      </button>
                      <button onClick={() => updateStatus(app.id, 'REJECTED')}
                        className="rounded-lg bg-red-50 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100">
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
