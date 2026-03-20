import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '@/services/jobService';
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

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = () => {
    setLoading(true);
    jobService
      .myJobs()
      .then((res) => {
        const pageData = res.data.data as any;
        setJobs(pageData?.content ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleStatusChange = async (jobId: number, status: string) => {
    try {
      await jobService.updateMyJobStatus(jobId, status);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: status as Job['status'] } : j)));
    } catch { /* ignore */ }
  };

  const handleDelete = async (jobId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return;
    try {
      await jobService.delete(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyển dụng</h1>
        <Link
          to="/employer/jobs/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Đăng tin tuyển dụng
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">Bạn chưa đăng tin tuyển dụng nào.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                  >
                    {job.title}
                  </Link>
                  <div className="mt-1 flex gap-2 text-xs text-gray-500">
                    <span>{jobTypeLabel[job.jobType] ?? job.jobType}</span>
                    <span>•</span>
                    <span>{job.city}</span>
                    <span>•</span>
                    <span>{job.positions} vị trí</span>
                    <span>•</span>
                    <span>{job.views} lượt xem</span>
                    <span>•</span>
                    <span>{job.applicationCount ?? 0} ứng tuyển</span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[job.status]}`}
                >
                  {statusLabel[job.status]}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to={`/employer/jobs/${job.id}/applications`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Xem đơn ứng tuyển
                </Link>
                <button
                  onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                  className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                >
                  Chỉnh sửa
                </button>

                {/* Status actions */}
                {job.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange(job.id, 'OPEN')}
                    className="rounded bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100"
                  >
                    Đăng tuyển
                  </button>
                )}
                {job.status === 'OPEN' && (
                  <button
                    onClick={() => handleStatusChange(job.id, 'CLOSED')}
                    className="rounded bg-orange-50 px-3 py-1 text-sm text-orange-700 hover:bg-orange-100"
                  >
                    Đóng tuyển
                  </button>
                )}
                {job.status === 'CLOSED' && (
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
      )}
    </div>
  );
}
