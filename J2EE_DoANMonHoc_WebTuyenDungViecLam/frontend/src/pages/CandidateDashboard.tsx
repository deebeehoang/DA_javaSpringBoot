import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import { candidateService } from '@/services/candidateService';
import { profileService } from '@/services/profileService';
import JobCard from '@/components/JobCard';
import type { Application, CandidateProfile, Job, JobRecommendation } from '@/types';
import type { CandidateStats } from '@/services/candidateService';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  VIEWED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  INTERVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  VIEWED: 'CV đã được xem',
  APPROVED: 'Được chấp nhận',
  REJECTED: 'Bị từ chối',
  INTERVIEW: 'Mời phỏng vấn',
};

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recFetched, setRecFetched] = useState(false);

  useEffect(() => {
    Promise.all([
      applicationService.myApplications(),
      candidateService.getStats(),
      profileService.getCandidateProfile(),
    ])
      .then(([appRes, statsRes, profileRes]) => {
        setApplications(appRes.data.data ?? []);
        setStats(statsRes.data.data ?? null);
        setProfile(profileRes.data.data ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGetRecommendations = () => {
    if (recLoading) return;
    setRecLoading(true);
    setRecFetched(true);
    candidateService.getRecommendations()
      .then((res) => setRecommendations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setRecLoading(false));
  };

  const handleWithdraw = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) return;
    try {
      await applicationService.withdraw(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (stats) setStats({ ...stats, totalApplications: stats.totalApplications - 1, pending: stats.pending - 1 });
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng đơn', value: stats?.totalApplications ?? 0, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'blue' },
    { label: 'Chờ duyệt', value: stats?.pending ?? 0, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'yellow' },
    { label: 'Được nhận', value: stats?.approved ?? 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
    { label: 'Bị từ chối', value: stats?.rejected ?? 0, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'red' },
    { label: 'Việc đã lưu', value: stats?.savedJobs ?? 0, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'purple' },
    { label: 'Kỹ năng', value: stats?.skills ?? 0, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'indigo' },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
            <p className="mt-1 text-sm text-gray-500">Quản lý hồ sơ và đơn ứng tuyển của bạn</p>
          </div>
          <Link to="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Tìm việc
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((s) => {
            const c = colorMap[s.color];
            return (
              <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <svg className={`h-5 w-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { to: '/candidate/profile', label: 'Hồ sơ của tôi', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'blue' },
            { to: '/candidate/skills', label: 'Kỹ năng', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'indigo' },
            { to: '/candidate/saved-jobs', label: 'Việc đã lưu', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'purple' },
            { to: '/candidate/recommendations', label: 'Gợi ý AI', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'yellow' },
            { to: '/candidate/applications', label: 'Lịch sử ứng tuyển', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'green' },
          ].map(({ to, label, icon, color }) => (
            <Link key={to} to={to} className={`inline-flex items-center gap-2 rounded-xl bg-${color}-50 px-4 py-2.5 text-sm font-medium text-${color}-600 transition hover:bg-${color}-100`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
              {label}
            </Link>
          ))}
        </div>

        {/* AI Job Recommendations */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Gợi ý việc làm bởi AI
            </h2>
            <Link to="/candidate/recommendations" className="text-sm font-medium text-purple-600 transition hover:text-purple-800">
              Xem tất cả →
            </Link>
          </div>
          {!recFetched ? (
            <div className="mt-4">
              <button
                onClick={handleGetRecommendations}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Nhận gợi ý từ AI
              </button>
              <p className="mt-2 text-xs text-gray-400">AI sẽ phân tích hồ sơ và kỹ năng của bạn để gợi ý các việc làm phù hợp nhất.</p>
            </div>
          ) : recLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              Đang phân tích hồ sơ của bạn...
            </div>
          ) : recommendations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Chưa có gợi ý. Hãy hoàn thiện hồ sơ và kỹ năng để nhận gợi ý tốt hơn.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.job.id} className="relative">
                  <JobCard job={rec.job} />
                  {rec.matchScore > 0 && (
                    <span className={`absolute left-3 top-3 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      rec.matchScore >= 70 ? 'border-green-200 bg-green-100 text-green-700' :
                      rec.matchScore >= 40 ? 'border-yellow-200 bg-yellow-100 text-yellow-700' :
                      'border-gray-200 bg-gray-100 text-gray-600'
                    }`}>
                      ⭐ {rec.matchScore}% phù hợp
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile completion */}
        {profile && (() => {
          const checks = [
            { label: 'Ảnh đại diện', done: !!profile.user?.avatarUrl, to: '/candidate/profile' },
            { label: 'Ngày sinh & giới tính', done: !!profile.dateOfBirth && !!profile.gender, to: '/candidate/profile' },
            { label: 'Tỉnh/Thành phố', done: !!profile.city, to: '/candidate/profile' },
            { label: 'Trình độ học vấn', done: !!profile.educationLevel, to: '/candidate/profile' },
            { label: 'Giới thiệu bản thân', done: !!profile.bio, to: '/candidate/profile' },
            { label: 'CV / Hồ sơ', done: !!profile.cvUrl, to: '/candidate/profile' },
            { label: 'Kỹ năng (ít nhất 1)', done: (stats?.skills ?? 0) > 0, to: '/candidate/skills' },
          ];
          const doneCount = checks.filter((c) => c.done).length;
          const pct = Math.round((doneCount / checks.length) * 100);
          if (pct >= 100) return null;
          return (
            <div className="mt-6 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Hoàn thiện hồ sơ
                </h2>
                <span className="text-sm font-bold text-amber-600">{pct}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {checks.map((c) => (
                  <Link key={c.label} to={c.to} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${c.done ? 'bg-green-50 text-green-700' : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    {c.done ? (
                      <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    )}
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Applications list */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">Đơn ứng tuyển gần đây</h2>

          {applications.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="mt-4 text-gray-500">Bạn chưa ứng tuyển công việc nào.</p>
              <Link to="/jobs" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
                Tìm việc ngay
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/jobs/${app.job.id}`}
                        className="text-base font-semibold text-gray-900 transition hover:text-blue-600"
                      >
                        {app.job.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-blue-600">{app.job.employer.companyName}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Ngày ứng tuyển: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusBadge[app.status]}`}>
                        {statusLabel[app.status]}
                      </span>
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Rút đơn
                        </button>
                      )}
                    </div>
                  </div>
                  {app.coverLetter && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{app.coverLetter}</p>
                  )}

                  {/* Timeline */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-0">
                      {(() => {
                        const steps = [
                          { key: 'PENDING', label: 'Đã nộp', date: app.appliedAt },
                          { key: 'VIEWED', label: 'CV đã xem', date: app.cvViewedAt },
                          { key: 'INTERVIEW', label: 'Phỏng vấn', date: undefined },
                          { key: 'RESULT', label: app.status === 'APPROVED' ? 'Được nhận' : app.status === 'REJECTED' ? 'Bị từ chối' : 'Kết quả', date: undefined },
                        ];
                        const order = ['PENDING', 'VIEWED', 'INTERVIEW', 'APPROVED', 'REJECTED'];
                        const currentIdx = order.indexOf(app.status);
                        const isRejected = app.status === 'REJECTED';

                        return steps.map((step, i) => {
                          let reached = false;
                          if (step.key === 'PENDING') reached = currentIdx >= 0;
                          else if (step.key === 'VIEWED') reached = currentIdx >= 1;
                          else if (step.key === 'INTERVIEW') reached = currentIdx >= 2;
                          else if (step.key === 'RESULT') reached = currentIdx >= 3;

                          const dotColor = reached
                            ? isRejected && step.key === 'RESULT'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                            : 'bg-gray-300';
                          const lineColor = reached ? (isRejected && step.key === 'RESULT' ? 'bg-red-300' : 'bg-blue-300') : 'bg-gray-200';

                          return (
                            <div key={step.key} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center">
                                <div className={`h-3 w-3 rounded-full ${dotColor} ring-2 ring-white`} />
                                <span className={`mt-1 text-[10px] whitespace-nowrap ${reached ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                  {step.label}
                                </span>
                                {step.date && reached && (
                                  <span className="text-[9px] text-gray-400">
                                    {new Date(step.date).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                              {i < steps.length - 1 && (
                                <div className={`h-0.5 flex-1 ${lineColor} mx-1 mt-[-16px]`} />
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
