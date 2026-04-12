import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { categoryService } from '@/services/categoryService';
import { locationService, type Province } from '@/services/locationService';
import JobCard from '@/components/JobCard';
import type { Category, Job, JobType, JobLevel } from '@/types';

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Thực tập',
  FREELANCE: 'Freelance',
};

const jobLevelLabels: Record<string, string> = {
  INTERN: 'Thực tập sinh',
  FRESHER: 'Fresher',
  JUNIOR: 'Junior',
  SENIOR: 'Senior',
  MANAGER: 'Quản lý',
  ANY: 'Tất cả cấp bậc',
};

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const suggestRef = useRef<HTMLDivElement>(null);
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const keyword = searchParams.get('keyword') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const city = searchParams.get('city') ?? '';
  const jobType = searchParams.get('jobType') ?? '';
  const jobLevel = searchParams.get('jobLevel') ?? '';
  const salaryMin = searchParams.get('salaryMin') ?? '';
  const salaryMax = searchParams.get('salaryMax') ?? '';
  const page = Number(searchParams.get('page') ?? '0');

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.data ?? []));
    locationService.getProvinces().then(setProvinces).catch(() => {});
  }, []);

  // Sync keyword input from URL
  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeywordChange = (value: string) => {
    setKeywordInput(value);
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    if (value.trim().length >= 2) {
      suggestTimerRef.current = setTimeout(() => {
        jobService.suggest(value.trim()).then((res) => {
          setSuggestions(res.data.data ?? []);
          setShowSuggestions(true);
        }).catch(() => {});
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s: string) => {
    setKeywordInput(s);
    setShowSuggestions(false);
    updateFilter('keyword', s);
  };

  const handleKeywordSubmit = () => {
    setShowSuggestions(false);
    updateFilter('keyword', keywordInput);
  };

  // Auto-show advanced filters if they have values
  useEffect(() => {
    if (jobLevel || salaryMin || salaryMax) setShowAdvanced(true);
  }, [jobLevel, salaryMin, salaryMax]);

  useEffect(() => {
    setLoading(true);
    jobService
      .search({
        keyword: keyword || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        city: city || undefined,
        jobType: (jobType as JobType) || undefined,
        jobLevel: (jobLevel as JobLevel) || undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        page,
        size: 12,
      })
      .then((res) => {
        const pageData = res.data.data as any;
        setJobs(pageData?.content ?? []);
        setTotalPages(pageData?.totalPages ?? 0);
        setTotalElements(pageData?.totalElements ?? 0);
      })
      .finally(() => setLoading(false));
  }, [keyword, categoryId, city, jobType, jobLevel, salaryMin, salaryMax, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setShowAdvanced(false);
  };

  const hasFilters = keyword || categoryId || city || jobType || jobLevel || salaryMin || salaryMax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm việc làm</h1>
          <p className="mt-1 text-sm text-gray-500">Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn</p>

          {/* Main Filters */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1" ref={suggestRef}>
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm theo từ khóa, vị trí, công ty..."
                value={keywordInput}
                onChange={(e) => handleKeywordChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleKeywordSubmit(); }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select value={city} onChange={(e) => updateFilter('city', e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-52">
              <option value="">Tất cả tỉnh/thành</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <select value={categoryId} onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-48">
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Tags Row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE'].map((t) => (
                <button key={t} onClick={() => updateFilter('jobType', jobType === t ? '' : t)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    jobType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {jobTypeLabels[t]}
                </button>
              ))}
            </div>
            <div className="mx-1 h-5 w-px bg-gray-200" />
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100">
              <svg className={`h-3.5 w-3.5 transition ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Bộ lọc nâng cao
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="rounded-full px-3.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50">
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 md:flex-row">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">Cấp bậc</label>
                <select value={jobLevel} onChange={(e) => updateFilter('jobLevel', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">Tất cả</option>
                  {Object.entries(jobLevelLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">Lương tối thiểu (VNĐ)</label>
                <input type="number" placeholder="VD: 5000000" value={salaryMin}
                  onChange={(e) => updateFilter('salaryMin', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" min={0} />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">Lương tối đa (VNĐ)</label>
                <input type="number" placeholder="VD: 20000000" value={salaryMax}
                  onChange={(e) => updateFilter('salaryMax', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" min={0} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {!loading && (
          <p className="mb-4 text-sm text-gray-500">
            Tìm thấy <span className="font-semibold text-gray-800">{totalElements}</span> việc làm
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-4 text-gray-500">Không tìm thấy việc làm nào phù hợp.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">
                Xóa bộ lọc và thử lại
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-1">
                <button disabled={page === 0}
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(page - 1)); setSearchParams(p); }}
                  className="rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i}
                    onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(i)); setSearchParams(p); }}
                    className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition ${
                      i === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page >= totalPages - 1}
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(page + 1)); setSearchParams(p); }}
                  className="rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">
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
