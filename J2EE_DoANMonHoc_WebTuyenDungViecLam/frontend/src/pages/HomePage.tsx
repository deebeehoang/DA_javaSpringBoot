import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jobService } from '@/services/jobService';
import { categoryService } from '@/services/categoryService';
import type { Job, Category } from '@/types';

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    jobService.search({ size: 6 }).then((res) => {
      const pageData = res.data.data as any;
      setFeaturedJobs(pageData?.content ?? []);
    });
    categoryService.getAll().then((res) => setCategories(res.data.data ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            Tìm việc làm thêm phù hợp với bạn
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Hàng ngàn cơ hội việc làm part-time dành cho sinh viên và người lao động
          </p>
          <div className="mt-8">
            <Link
              to="/jobs"
              className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 shadow hover:bg-gray-100"
            >
              Tìm việc ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
            Danh mục việc làm
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/jobs?categoryId=${cat.id}`}
                className="rounded-lg border p-4 text-center hover:border-blue-500 hover:shadow"
              >
                {cat.icon && <span className="text-3xl">{cat.icon}</span>}
                <p className="mt-2 font-medium text-gray-700">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
              Việc làm nổi bật
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                  <p className="mt-1 text-sm text-blue-600">
                    {job.employer.companyName}
                  </p>
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
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/jobs"
                className="inline-block rounded-lg border border-blue-600 px-6 py-2 text-blue-600 hover:bg-blue-50"
              >
                Xem tất cả việc làm
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
