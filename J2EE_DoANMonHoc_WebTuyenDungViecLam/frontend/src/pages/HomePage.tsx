import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jobService } from '@/services/jobService';
import { categoryService } from '@/services/categoryService';
import { locationService, type Province } from '@/services/locationService';
import JobCard from '@/components/JobCard';
import type { Job, Category } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    jobService.search({ size: 6 }).then((res) => {
      const pageData = res.data.data as any;
      setFeaturedJobs(pageData?.content ?? []);
    });
    categoryService.getAll().then((res) => setCategories(res.data.data ?? []));
    locationService.getProvinces().then(setProvinces).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.set('keyword', searchKeyword);
    if (searchCity) params.set('city', searchCity);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 right-20 h-96 w-96 rounded-full bg-white/10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Tìm việc làm <span className="text-blue-200">phù hợp</span> với bạn
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100/80">
            Hàng ngàn cơ hội việc làm part-time, full-time dành cho sinh viên và người lao động trên khắp Việt Nam
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur md:flex-row md:rounded-full md:p-2">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Vị trí, từ khóa, công ty..."
                value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full rounded-xl bg-white/10 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/50 backdrop-blur transition focus:bg-white/20 focus:outline-none md:rounded-full" />
            </div>
            <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)}
              className="rounded-xl bg-white/10 px-4 py-3.5 text-sm text-white backdrop-blur transition focus:bg-white/20 focus:outline-none md:w-52 md:rounded-full [&>option]:text-gray-800">
              <option value="">Tất cả tỉnh/thành</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <button type="submit"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 shadow-lg transition hover:bg-gray-50 md:rounded-full">
              Tìm kiếm
            </button>
          </form>

          {/* Stats */}
          <div className="mx-auto mt-10 flex max-w-lg justify-center gap-10">
            <div>
              <p className="text-3xl font-bold text-white">{featuredJobs.length > 0 ? '1000+' : '...'}</p>
              <p className="mt-1 text-sm text-blue-200">Việc làm</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="mt-1 text-sm text-blue-200">Công ty</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">63</p>
              <p className="mt-1 text-sm text-blue-200">Tỉnh/thành</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Khám phá theo danh mục</h2>
            <p className="mt-2 text-sm text-gray-500">Tìm việc làm theo lĩnh vực bạn quan tâm</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/jobs?categoryId=${cat.id}`}
                className="group rounded-xl border border-gray-100 bg-white p-5 text-center transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50">
                {cat.icon && <span className="text-3xl">{cat.icon}</span>}
                <p className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Việc làm nổi bật</h2>
              <p className="mt-2 text-sm text-gray-500">Cơ hội mới nhất từ các nhà tuyển dụng hàng đầu</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/jobs"
                className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-8 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white">
                Xem tất cả việc làm
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
