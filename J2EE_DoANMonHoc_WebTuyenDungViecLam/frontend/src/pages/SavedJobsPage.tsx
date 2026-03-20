import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '@/services/candidateService';
import type { Job } from '@/types';

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Thực tập',
};

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidateService
      .getSavedJobs()
      .then((res) => setJobs(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId: number) => {
    await candidateService.unsaveJob(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/candidate/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Bảng điều khiển
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-gray-800">Việc làm đã lưu</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          <p>Bạn chưa lưu việc làm nào.</p>
          <Link to="/jobs" className="mt-2 inline-block text-blue-600 hover:underline">
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg border bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-1 text-sm text-blue-600">{job.employer?.companyName}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>{jobTypeLabel[job.jobType] ?? job.jobType}</span>
                    <span>•</span>
                    <span>{job.city}</span>
                    {job.salaryMin && job.salaryMax && (
                      <>
                        <span>•</span>
                        <span>
                          {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} VNĐ
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleUnsave(job.id)}
                  className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                >
                  Bỏ lưu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
