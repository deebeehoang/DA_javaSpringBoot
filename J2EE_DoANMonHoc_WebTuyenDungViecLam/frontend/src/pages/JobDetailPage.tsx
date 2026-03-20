import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { applicationService } from '@/services/applicationService';
import { candidateService } from '@/services/candidateService';
import { useAuth } from '@/context/AuthContext';
import type { Job } from '@/types';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    jobService
      .getById(Number(id))
      .then((res) => setJob(res.data.data!))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (user?.role === 'CANDIDATE' && id) {
      candidateService.checkSaved(Number(id)).then((res) => setSaved(res.data.data ?? false)).catch(() => {});
    }
  }, [id, user]);

  const toggleSave = async () => {
    if (!id) return;
    try {
      if (saved) {
        await candidateService.unsaveJob(Number(id));
        setSaved(false);
      } else {
        await candidateService.saveJob(Number(id));
        setSaved(true);
      }
    } catch { /* ignore */ }
  };

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await applicationService.apply({ jobId: Number(id), coverLetter });
      setMessage('Ứng tuyển thành công!');
      setShowApplyForm(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
        <p className="mt-2 text-lg text-blue-600">{job.employer.companyName}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
            {job.jobType}
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            {job.jobLevel}
          </span>
          {job.city && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
              📍 {job.city}
            </span>
          )}
          {job.salaryMin != null && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
              💰 {job.salaryMin.toLocaleString()}đ
              {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}đ` : '+'}
            </span>
          )}
        </div>
        {job.deadline && (
          <p className="mt-3 text-sm text-gray-500">
            Hạn nộp hồ sơ: {new Date(job.deadline).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-800">Mô tả công việc</h2>
            <div className="mt-3 whitespace-pre-line text-gray-600">{job.description}</div>
          </section>

          {job.requirements && (
            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-800">Yêu cầu</h2>
              <div className="mt-3 whitespace-pre-line text-gray-600">{job.requirements}</div>
            </section>
          )}

          {job.benefits && (
            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-800">Quyền lợi</h2>
              <div className="mt-3 whitespace-pre-line text-gray-600">{job.benefits}</div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="font-semibold text-gray-800">Thông tin</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Loại: {job.jobType}</li>
              <li>Cấp bậc: {job.jobLevel}</li>
              <li>Vị trí tuyển: {job.positions}</li>
              <li>Lượt xem: {job.views}</li>
              {job.category && <li>Danh mục: {job.category.name}</li>}
            </ul>
          </div>

          {/* Apply button */}
          {user?.role === 'CANDIDATE' && (
            <div className="rounded-lg bg-white p-6 shadow space-y-3">
              {/* Save button */}
              <button
                onClick={toggleSave}
                className={`w-full rounded-lg border py-2.5 text-sm font-semibold transition ${
                  saved
                    ? 'border-red-300 text-red-600 hover:bg-red-50'
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {saved ? '❤ Đã lưu' : '♡ Lưu tin này'}
              </button>

              {/* Apply */}
              {job.status === 'OPEN' && (
                <>
                  {message && (
                    <p className={`text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
                      {message}
                    </p>
                  )}
                  {!showApplyForm ? (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      Ứng tuyển ngay
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Thư giới thiệu (không bắt buộc)"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {applying ? 'Đang gửi...' : 'Gửi ứng tuyển'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
