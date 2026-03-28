import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '@/services/candidateService';
import type { Job } from '@/types';

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Thực tập',
};

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(0) + ' triệu' : n.toLocaleString();
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/candidate/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Bảng điều khiển
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Việc làm đã lưu</h1>
        <p className="mt-1 text-sm text-gray-500">{jobs.length} việc làm đã lưu</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <p className="mt-4 text-gray-500">Bạn chưa lưu việc làm nào.</p>
            <Link to="/jobs" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              Tìm việc ngay
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    {job.employer?.logoUrl ? (
                      <img src={job.employer.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border object-contain" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-blue-600">
                        {job.employer?.companyName?.[0] ?? 'C'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link to={`/jobs/${job.id}`} className="text-base font-semibold text-gray-900 transition group-hover:text-blue-600">
                        {job.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-blue-600">{job.employer?.companyName}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {jobTypeLabel[job.jobType] ?? job.jobType}
                        </span>
                        {job.city && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            {job.city}
                          </span>
                        )}
                        {formatSalary(job.salaryMin, job.salaryMax) && (
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(job.id)}
                    className="shrink-0 rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Bỏ lưu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
