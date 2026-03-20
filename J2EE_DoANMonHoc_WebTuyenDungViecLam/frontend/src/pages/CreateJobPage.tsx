import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { categoryService } from '@/services/categoryService';
import MapboxAddressInput from '@/components/MapboxAddressInput';
import type { Category, JobCreateRequest, JobType, JobLevel } from '@/types';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<JobCreateRequest>({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    jobType: 'PART_TIME',
    jobLevel: 'INTERN',
    positions: 1,
    location: '',
    city: '',
    deadline: '',
  });

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.data ?? []));
  }, []);

  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.categoryId) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    setLoading(true);
    try {
      // Clean payload: convert empty strings to undefined so they become null in JSON
      const payload = {
        ...form,
        requirements: form.requirements || undefined,
        benefits: form.benefits || undefined,
        salaryMin: form.salaryMin || undefined,
        salaryMax: form.salaryMax || undefined,
        deadline: form.deadline || undefined,
        categoryId: form.categoryId || undefined,
      };
      await jobService.create(payload as any);
      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Đăng tin tuyển dụng</h1>

      {error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tiêu đề công việc *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại việc làm *</label>
            <select
              value={form.jobType}
              onChange={(e) => set('jobType', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2"
            >
              {(['FULL_TIME', 'PART_TIME', 'FREELANCE', 'INTERNSHIP'] as JobType[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cấp bậc *</label>
            <select
              value={form.jobLevel}
              onChange={(e) => set('jobLevel', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2"
            >
              {(['INTERN', 'FRESHER', 'JUNIOR', 'SENIOR', 'MANAGER', 'ANY'] as JobLevel[]).map(
                (l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Danh mục *</label>
          <select
            required
            value={form.categoryId ?? ''}
            onChange={(e) => set('categoryId', e.target.value ? Number(e.target.value) : '')}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả công việc *</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Yêu cầu</label>
          <textarea
            rows={3}
            value={form.requirements}
            onChange={(e) => set('requirements', e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quyền lợi</label>
          <textarea
            rows={3}
            value={form.benefits}
            onChange={(e) => set('benefits', e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lương tối thiểu</label>
            <input
              type="number"
              value={form.salaryMin ?? ''}
              onChange={(e) => set('salaryMin', e.target.value ? Number(e.target.value) : '')}
              className="mt-1 w-full rounded-lg border px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lương tối đa</label>
            <input
              type="number"
              value={form.salaryMax ?? ''}
              onChange={(e) => set('salaryMax', e.target.value ? Number(e.target.value) : '')}
              className="mt-1 w-full rounded-lg border px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số vị trí *</label>
            <input
              type="number"
              required
              min={1}
              value={form.positions}
              onChange={(e) => set('positions', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border px-4 py-2"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa điểm *</label>
            <MapboxAddressInput
              value={form.location}
              onChange={(address, city) => {
                setForm((prev) => ({
                  ...prev,
                  location: address,
                  ...(city ? { city } : {}),
                }));
              }}
              placeholder="Nhập địa điểm làm việc..."
              required
              className="mt-1 w-full rounded-lg border px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Thành phố *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2"
              placeholder="Tự động điền khi chọn địa chỉ"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hạn nộp hồ sơ</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => set('deadline', e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Đăng tin'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/employer/dashboard')}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
