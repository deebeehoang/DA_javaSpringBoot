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
  DRAFT: 'bg-gray-100 text-gray-700',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
};

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
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
    if (!window.confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return;
    try {
      await adminService.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <Link to="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Bảng điều khiển
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-800">Quản lý tin tuyển dụng</h1>
      </div>

      {/* Filter */}
      <div className="mt-4 flex gap-2">
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <p className="mt-8 text-center text-gray-500">Không có tin tuyển dụng nào.</p>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-lg border bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[job.status]}`}>
                        {statusLabel[job.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-blue-600">{job.employer?.companyName}</p>
                    <div className="mt-1 flex gap-2 text-xs text-gray-500">
                      <span>{jobTypeLabel[job.jobType] ?? job.jobType}</span>
                      <span>•</span>
                      <span>{job.city}</span>
                      <span>•</span>
                      <span>{job.positions} vị trí</span>
                      <span>•</span>
                      <span>{job.views} lượt xem</span>
                      {job.createdAt && (
                        <>
                          <span>•</span>
                          <span>Đăng: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {job.status === 'DRAFT' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'OPEN')}
                      className="rounded bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100"
                    >
                      Duyệt & Mở
                    </button>
                  )}
                  {job.status === 'OPEN' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'CLOSED')}
                      className="rounded bg-orange-50 px-3 py-1 text-sm text-orange-700 hover:bg-orange-100"
                    >
                      Đóng
                    </button>
                  )}
                  {(job.status === 'CLOSED' || job.status === 'EXPIRED') && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'OPEN')}
                      className="rounded bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100"
                    >
                      Mở lại
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
