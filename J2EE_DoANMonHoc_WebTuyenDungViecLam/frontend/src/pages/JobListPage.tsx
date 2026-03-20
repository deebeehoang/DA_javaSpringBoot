import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { categoryService } from '@/services/categoryService';
import type { Job, Category, JobType } from '@/types';

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const city = searchParams.get('city') ?? '';
  const jobType = searchParams.get('jobType') ?? '';
  const page = Number(searchParams.get('page') ?? '0');

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.data ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    jobService
      .search({
        keyword: keyword || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        city: city || undefined,
        jobType: (jobType as JobType) || undefined,
        page,
        size: 12,
      })
      .then((res) => {
        const pageData = res.data.data as any;
        setJobs(pageData?.content ?? []);
        setTotalPages(pageData?.totalPages ?? 0);
      })
      .finally(() => setLoading(false));
  }, [keyword, categoryId, city, jobType, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Tìm kiếm việc làm</h1>

      {/* Filters */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Từ khóa..."
          value={keyword}
          onChange={(e) => updateFilter('keyword', e.target.value)}
          className="rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={categoryId}
          onChange={(e) => updateFilter('categoryId', e.target.value)}
          className="rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Thành phố..."
          value={city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={jobType}
          onChange={(e) => updateFilter('jobType', e.target.value)}
          className="rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tất cả loại</option>
          <option value="PART_TIME">Part-time</option>
          <option value="FULL_TIME">Full-time</option>
          <option value="INTERNSHIP">Thực tập</option>
          <option value="FREELANCE">Freelance</option>
        </select>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="py-12 text-center text-gray-500">Không tìm thấy việc làm nào.</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="rounded-lg border bg-white p-6 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                <p className="mt-1 text-sm text-blue-600">{job.employer.companyName}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded bg-blue-50 px-2 py-1">{job.jobType}</span>
                  <span className="rounded bg-green-50 px-2 py-1">{job.city}</span>
                  {job.salaryMin != null && (
                    <span className="rounded bg-yellow-50 px-2 py-1">
                      {job.salaryMin.toLocaleString()}đ
                      {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}đ` : '+'}
                    </span>
                  )}
                </div>
                {job.deadline && (
                  <p className="mt-2 text-xs text-gray-400">
                    Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(i));
                    setSearchParams(params);
                  }}
                  className={`rounded px-3 py-1 text-sm ${
                    i === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
