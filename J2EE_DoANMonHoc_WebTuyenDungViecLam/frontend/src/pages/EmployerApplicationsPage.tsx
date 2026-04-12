import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import type { Application } from '@/types';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  VIEWED: 'Đã xem CV',
  INTERVIEW: 'Phỏng vấn',
  APPROVED: 'Chấp nhận',
  REJECTED: 'Từ chối',
};

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  VIEWED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  INTERVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const statusOptions = ['PENDING', 'VIEWED', 'INTERVIEW', 'APPROVED', 'REJECTED'];

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [viewingApp, setViewingApp] = useState<Application | null>(null);

  useEffect(() => {
    applicationService
      .byEmployer()
      .then((res) => setApplications(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await applicationService.updateStatus(id, status);
      const updated = res.data.data;
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      );
    } catch {
      /* ignore */
    }
  };

  const openCvViewer = async (app: Application) => {
    setViewingApp(app);
    // Mark CV as viewed
    if (!app.cvViewed) {
      try {
        const res = await applicationService.markCvViewed(app.id);
        const updated = res.data.data;
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, ...updated } : a)),
        );
        setViewingApp((prev) => prev ? { ...prev, ...updated } : prev);
      } catch {
        /* ignore */
      }
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

  // Get the CV URL: prefer application-specific CV, fallback to candidate profile CV
  const getCvUrl = (app: Application) => app.cvUrl || app.candidate.cvUrl;

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
                        {getCvUrl(app) ? (
                          <button onClick={() => openCvViewer(app)}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Xem CV
                            {app.cvViewed && (
                              <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
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

      {/* CV Viewer Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingApp(null)}>
          <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewingApp.candidate.user?.fullName ?? 'Ứng viên'}
                </h2>
                <p className="text-sm text-gray-500">
                  {viewingApp.job.title} &middot; Nộp {new Date(viewingApp.appliedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusBadge[viewingApp.status]}`}>
                  {statusLabel[viewingApp.status]}
                </span>
                <button onClick={() => setViewingApp(null)} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left: PDF Preview */}
              <div className="flex flex-1 flex-col bg-gray-100">
                {/* Toolbar */}
                {getCvUrl(viewingApp) && (
                  <div className="flex items-center justify-end gap-2 border-b border-gray-200 bg-white px-4 py-2">
                    <a
                      href={getCvUrl(viewingApp)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Mở tab mới
                    </a>
                    <a
                      href={getCvUrl(viewingApp)!}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Tải xuống
                    </a>
                  </div>
                )}
                <div className="flex-1 p-4">
                  {getCvUrl(viewingApp) ? (
                    getCvUrl(viewingApp)!.endsWith('.pdf') ? (
                      <object
                        data={getCvUrl(viewingApp)!}
                        type="application/pdf"
                        className="h-full w-full rounded-lg"
                      >
                        <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-500">
                          <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Trình duyệt không hỗ trợ xem PDF trực tiếp.</p>
                          <a
                            href={getCvUrl(viewingApp)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            Mở xem CV
                          </a>
                        </div>
                      </object>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <a href={getCvUrl(viewingApp)!} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Tải xuống CV
                        </a>
                      </div>
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">Không có CV</div>
                  )}
                </div>
              </div>

              {/* Right: Info sidebar */}
              <div className="w-72 shrink-0 overflow-y-auto border-l border-gray-100 p-5">
                {/* Candidate info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Thông tin ứng viên</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700"><span className="text-gray-500">Email:</span> {viewingApp.candidate.user?.email}</p>
                    {viewingApp.candidate.user?.phone && <p className="text-gray-700"><span className="text-gray-500">SĐT:</span> {viewingApp.candidate.user.phone}</p>}
                  </div>
                </div>

                {/* Cover letter */}
                {viewingApp.coverLetter && (
                  <div className="mt-5 space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Thư giới thiệu</h3>
                    <p className="rounded-lg bg-gray-50 p-3 text-sm italic text-gray-600 leading-relaxed">"{viewingApp.coverLetter}"</p>
                  </div>
                )}

                {/* CV viewed info */}
                {viewingApp.cvViewed && (
                  <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    CV đã xem {viewingApp.cvViewedAt && ('lúc ' + new Date(viewingApp.cvViewedAt).toLocaleString('vi-VN'))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</h3>
                  {(viewingApp.status === 'PENDING' || viewingApp.status === 'VIEWED') && (
                    <div className="space-y-2">
                      <button onClick={() => { updateStatus(viewingApp.id, 'INTERVIEW'); setViewingApp((p) => p ? { ...p, status: 'INTERVIEW' } : p); }}
                        className="w-full rounded-lg bg-blue-50 px-4 py-2.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100">
                        Mời phỏng vấn
                      </button>
                      <button onClick={() => { updateStatus(viewingApp.id, 'APPROVED'); setViewingApp((p) => p ? { ...p, status: 'APPROVED' } : p); }}
                        className="w-full rounded-lg bg-green-50 px-4 py-2.5 text-xs font-medium text-green-700 transition hover:bg-green-100">
                        Chấp nhận
                      </button>
                      <button onClick={() => { updateStatus(viewingApp.id, 'REJECTED'); setViewingApp((p) => p ? { ...p, status: 'REJECTED' } : p); }}
                        className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                        Từ chối
                      </button>
                    </div>
                  )}
                  {viewingApp.status === 'INTERVIEW' && (
                    <div className="space-y-2">
                      <button onClick={() => { updateStatus(viewingApp.id, 'APPROVED'); setViewingApp((p) => p ? { ...p, status: 'APPROVED' } : p); }}
                        className="w-full rounded-lg bg-green-50 px-4 py-2.5 text-xs font-medium text-green-700 transition hover:bg-green-100">
                        Chấp nhận
                      </button>
                      <button onClick={() => { updateStatus(viewingApp.id, 'REJECTED'); setViewingApp((p) => p ? { ...p, status: 'REJECTED' } : p); }}
                        className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
