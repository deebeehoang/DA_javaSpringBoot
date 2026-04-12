import { useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '@/services/candidateService';
import type { JobRecommendation } from '@/types';

function scoreColor(score: number) {
  if (score >= 70) return { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700 border-green-200', label: 'Rất phù hợp' };
  if (score >= 40) return { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Khá phù hợp' };
  return { bar: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Có thể phù hợp' };
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}tr` : `${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} VNĐ`;
  if (min) return `Từ ${fmt(min)} VNĐ`;
  return `Tới ${fmt(max!)} VNĐ`;
}

export default function RecommendedJobsPage() {
  const [recs, setRecs] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = () => {
    if (loading) return;
    setLoading(true);
    setError('');
    setFetched(true);
    candidateService.getRecommendations()
      .then((res) => setRecs(res.data.data ?? []))
      .catch(() => setError('Không thể tải gợi ý. Hãy thử lại sau.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/candidate/dashboard" className="text-gray-400 transition hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Gợi ý việc làm bởi AI
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">Các công việc phù hợp được cá nhân hóa dựa trên hồ sơ và kỹ năng của bạn</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-16 flex flex-col items-center gap-3 text-gray-400">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <p className="text-sm">AI đang phân tích hồ sơ của bạn...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Not yet requested */}
        {!fetched && !loading && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
              <svg className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Sẵn sàng nhận gợi ý việc làm phù hợp?</p>
              <p className="mt-1 text-sm text-gray-400">AI sẽ phân tích hồ sơ và kỹ năng của bạn để tìm ra những vị trí tốt nhất.</p>
            </div>
            <button
              onClick={handleFetch}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Nhận gợi ý từ AI
            </button>
          </div>
        )}

        {/* Empty after fetch */}
        {fetched && !loading && !error && recs.length === 0 && (
          <div className="mt-16 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="mt-4 text-gray-500">Chưa có gợi ý nào.</p>
            <p className="mt-1 text-sm text-gray-400">Hãy hoàn thiện hồ sơ và thêm kỹ năng để nhận gợi ý tốt hơn.</p>
            <Link to="/candidate/skills" className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Thêm kỹ năng ngay
            </Link>
          </div>
        )}

        {/* Results */}
        {!loading && recs.length > 0 && (
          <>
            <p className="mt-4 text-sm text-gray-500">
              Tìm thấy <span className="font-semibold text-gray-800">{recs.length}</span> việc làm phù hợp với bạn
            </p>

            <div className="mt-4 space-y-4">
              {recs.map((rec, idx) => {
                const { job } = rec;
                const sc = scoreColor(rec.matchScore);
                const salary = formatSalary(job.salaryMin, job.salaryMax);
                return (
                  <div key={job.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                    {/* Top bar: rank + score */}
                    <div className="flex items-center justify-between border-b border-gray-50 bg-gradient-to-r from-purple-50 px-5 py-3">
                      <span className="text-xs font-semibold text-purple-500">#{idx + 1} Gợi ý AI</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div className={`h-full rounded-full transition-all ${sc.bar}`} style={{ width: `${rec.matchScore}%` }} />
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sc.badge}`}>
                          {rec.matchScore > 0 ? `${rec.matchScore}%` : ''} {sc.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        {job.employer?.logoUrl ? (
                          <img src={job.employer.logoUrl} alt={job.employer.companyName} className="h-12 w-12 shrink-0 rounded-xl border border-gray-100 object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                            {job.employer?.companyName?.[0] ?? 'C'}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-gray-900 transition hover:text-blue-600">
                            {job.title}
                          </Link>
                          <p className="mt-0.5 text-sm font-medium text-blue-600">{job.employer?.companyName}</p>

                          {/* Meta chips */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {job.city && (
                              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {job.city}
                              </span>
                            )}
                            {job.jobType && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                                {{ FULL_TIME: 'Full-time', PART_TIME: 'Part-time', FREELANCE: 'Freelance', INTERNSHIP: 'Thực tập' }[job.jobType] ?? job.jobType}
                              </span>
                            )}
                            {salary && (
                              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {salary}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reason box */}
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-purple-50 px-4 py-3">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm italic text-purple-700">{rec.reason}</p>
                      </div>

                      {/* Matched skills */}
                      {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-400">Kỹ năng khớp:</span>
                          {rec.matchedSkills.map((s) => (
                            <span key={s} className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex gap-3 text-xs text-gray-400">
                          {job.deadline && <span>Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>}
                          {job.positions && <span>{job.positions} vị trí</span>}
                        </div>
                        <Link
                          to={`/jobs/${job.id}`}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Xem chi tiết &amp; Ứng tuyển →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tip */}
            <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              <strong>💡 Mẹo:</strong> Thêm nhiều kỹ năng vào hồ sơ để nhận gợi ý chính xác hơn.&nbsp;
              <Link to="/candidate/skills" className="underline hover:text-amber-900">Cập nhật kỹ năng →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
