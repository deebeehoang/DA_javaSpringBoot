import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '@/types';

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time', INTERNSHIP: 'Thực tập', FREELANCE: 'Freelance',
};
const jobLevelLabels: Record<string, string> = {
  INTERN: 'Intern', FRESHER: 'Fresher', JUNIOR: 'Junior', SENIOR: 'Senior', MANAGER: 'Manager', ANY: 'Tất cả cấp độ',
};

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}tr` : `${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  if (max) return `Đến ${fmt(max)}`;
  return null;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<'right' | 'left'>('right');
  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPopup = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos(window.innerWidth - rect.right >= 320 ? 'right' : 'left');
    }
    setHovered(true);
  };

  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setHovered(false), 250);
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const descPreview = job.description
    ? job.description.replace(/<[^>]*>/g, '').slice(0, 200) + (job.description.length > 200 ? '...' : '')
    : null;
  const requirementsPreview = job.requirements
    ? job.requirements.replace(/<[^>]*>/g, '').slice(0, 150) + (job.requirements.length > 150 ? '...' : '')
    : null;
  const benefitsPreview = job.benefits
    ? job.benefits.replace(/<[^>]*>/g, '').slice(0, 100) + (job.benefits.length > 100 ? '...' : '')
    : null;

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={showPopup}
      onMouseLeave={scheduleHide}
    >
      <Link
        to={`/jobs/${job.id}`}
        className="group block rounded-xl border border-gray-100 bg-white p-5 transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50"
      >
        <div className="flex items-start gap-3">
          {job.employer?.logoUrl ? (
            <img src={job.employer.logoUrl} alt="" className="h-12 w-12 rounded-lg border object-contain" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-blue-600">
              {job.employer?.companyName?.[0] ?? 'C'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-blue-600">
              {job.title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-gray-500">{job.employer?.companyName}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {jobTypeLabels[job.jobType] ?? job.jobType}
          </span>
          {job.jobLevel && job.jobLevel !== 'ANY' && (
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
              {jobLevelLabels[job.jobLevel] ?? job.jobLevel}
            </span>
          )}
          {job.city && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.city}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {salary ? (
            <span className="text-sm font-semibold text-green-600">{salary}</span>
          ) : (
            <span className="text-sm text-gray-400">Thỏa thuận</span>
          )}
          {job.deadline && (
            <span className="text-xs text-gray-400">
              Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </Link>

      {/* Hover tooltip */}
      {hovered && (
        <div
          onMouseEnter={showPopup}
          onMouseLeave={scheduleHide}
          className={`absolute top-0 z-50 w-80 rounded-xl border border-blue-100 bg-white p-5 shadow-2xl ${
            tooltipPos === 'right' ? 'left-full ml-3' : 'right-full mr-3'
          }`}
          style={{ maxHeight: '420px', overflowY: 'auto' }}
        >
          {/* Arrow */}
          <div
            className={`absolute top-5 h-3 w-3 rotate-45 border bg-white ${
              tooltipPos === 'right'
                ? '-left-1.5 border-r-0 border-t-0 border-blue-100'
                : '-right-1.5 border-l-0 border-b-0 border-blue-100'
            }`}
          />

          {/* Header */}
          <div className="flex items-center gap-3">
            {job.employer?.logoUrl ? (
              <img src={job.employer.logoUrl} alt="" className="h-10 w-10 rounded-lg border object-contain" />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                {job.employer?.companyName?.[0] ?? 'C'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 line-clamp-1">{job.title}</p>
              <p className="text-xs text-blue-600">{job.employer?.companyName}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {jobTypeLabels[job.jobType] ?? job.jobType}
            </span>
            {job.jobLevel && job.jobLevel !== 'ANY' && (
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                {jobLevelLabels[job.jobLevel] ?? job.jobLevel}
              </span>
            )}
            {job.category?.name && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {job.category.name}
              </span>
            )}
          </div>

          {/* Key info */}
          <div className="mt-3 space-y-1.5">
            {job.city && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{job.city}{job.location ? ` – ${job.location}` : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-green-600">{salary ?? 'Thỏa thuận'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{job.positions} vị trí</span>
              <span className="text-gray-300">•</span>
              <span>{job.views} lượt xem</span>
            </div>
            {job.deadline && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>

          {/* Description preview */}
          {descPreview && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mô tả công việc</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{descPreview}</p>
            </div>
          )}

          {/* Requirements preview */}
          {requirementsPreview && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Yêu cầu</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{requirementsPreview}</p>
            </div>
          )}

          {/* Benefits preview */}
          {benefitsPreview && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Quyền lợi</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{benefitsPreview}</p>
            </div>
          )}

          <Link
            to={`/jobs/${job.id}`}
            className="mt-4 block rounded-lg bg-blue-600 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Xem chi tiết →
          </Link>
        </div>
      )}
    </div>
  );
}
