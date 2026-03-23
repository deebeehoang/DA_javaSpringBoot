import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import type { Job } from '@/types';

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

export default function AdminJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');

  const fetchJobs = (p: number, status: string) => {
    setLoading(true);
    adminService
      .getJobs(p, 10, status)
      .then((res) => {
        const pageData = res.data.data;
        setJobs(pageData?.content ?? []);
        setTotalPages(pageData?.totalPages ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(0);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminService.updateJobStatus(id, status);
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: status as Job['status'] } : j)));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!globalThis.confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return;
    try {
      await adminService.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Bảng điều khiển
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>

        {/* Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { value: '', label: 'Tất cả' },
            { value: 'DRAFT', label: 'Nháp' },
            { value: 'OPEN', label: 'Đang tuyển' },
            { value: 'CLOSED', label: 'Đã đóng' },
            { value: 'EXPIRED', label: 'Hết hạn' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusFilter(f.value)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">Không có tin tuyển dụng nào.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/jobs/${job.id}`} className="text-base font-semibold text-gray-900 transition hover:text-blue-600">
                          {job.title}
                        </Link>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge[job.status]}`}>
                          {statusLabel[job.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-blue-600">{job.employer?.companyName}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>{jobTypeLabel[job.jobType] ?? job.jobType}</span>
                        <span>{job.city}</span>
                        <span>{job.positions} vị trí</span>
                        <span>{job.views} lượt xem</span>
                        {job.createdAt && (
                          <span>Đăng: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
                    {job.status === 'DRAFT' && (
                      <button onClick={() => handleStatusChange(job.id, 'OPEN')} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100">Duyệt & Mở</button>
                    )}
                    {job.status === 'OPEN' && (
                      <button onClick={() => handleStatusChange(job.id, 'CLOSED')} className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100">Đóng</button>
                    )}
                    {(job.status === 'CLOSED' || job.status === 'EXPIRED') && (
                      <button onClick={() => handleStatusChange(job.id, 'OPEN')} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100">Mở lại</button>
                    )}
                    <button onClick={() => handleDelete(job.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">Xóa</button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
                  Trước
                </button>
                <span className="text-sm text-gray-500">Trang {page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
