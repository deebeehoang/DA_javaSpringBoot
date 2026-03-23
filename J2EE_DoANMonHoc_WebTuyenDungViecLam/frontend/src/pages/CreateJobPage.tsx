import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobService } from '@/services/jobService';
import { categoryService } from '@/services/categoryService';
import { locationService, type Province } from '@/services/locationService';
import type { Category, JobCreateRequest, JobType, JobLevel } from '@/types';

const jobTypeOptions: { value: JobType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Thực tập' },
];

const jobLevelOptions: { value: JobLevel; label: string }[] = [
  { value: 'INTERN', label: 'Thực tập sinh' },
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'ANY', label: 'Tất cả cấp bậc' },
];

const inputCls = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
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
    locationService.getProvinces().then(setProvinces).catch(() => {});
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/employer/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Quay lại
        </Link>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng</h1>
          <p className="mt-1 text-sm text-gray-500">Điền thông tin chi tiết để thu hút ứng viên phù hợp</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tiêu đề công việc <span className="text-red-500">*</span></label>
              <input type="text" required value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} placeholder="VD: Nhân viên bán hàng part-time" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại việc làm <span className="text-red-500">*</span></label>
                <select value={form.jobType} onChange={(e) => set('jobType', e.target.value)} className={inputCls}>
                  {jobTypeOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cấp bậc <span className="text-red-500">*</span></label>
                <select value={form.jobLevel} onChange={(e) => set('jobLevel', e.target.value)} className={inputCls}>
                  {jobLevelOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Danh mục <span className="text-red-500">*</span></label>
              <select required value={form.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả công việc <span className="text-red-500">*</span></label>
              <textarea required rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls} placeholder="Mô tả chi tiết về công việc..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Yêu cầu ứng viên</label>
              <textarea rows={3} value={form.requirements} onChange={(e) => set('requirements', e.target.value)} className={inputCls} placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quyền lợi</label>
              <textarea rows={3} value={form.benefits} onChange={(e) => set('benefits', e.target.value)} className={inputCls} placeholder="Lương thưởng, bảo hiểm, đào tạo..." />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lương tối thiểu (VNĐ)</label>
                <input type="number" value={form.salaryMin ?? ''} onChange={(e) => set('salaryMin', e.target.value ? Number(e.target.value) : '')} className={inputCls} placeholder="VD: 5000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lương tối đa (VNĐ)</label>
                <input type="number" value={form.salaryMax ?? ''} onChange={(e) => set('salaryMax', e.target.value ? Number(e.target.value) : '')} className={inputCls} placeholder="VD: 10000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số vị trí <span className="text-red-500">*</span></label>
                <input type="number" required min={1} value={form.positions} onChange={(e) => set('positions', Number(e.target.value))} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa điểm làm việc <span className="text-red-500">*</span></label>
                <input type="text" required value={form.location} onChange={(e) => set('location', e.target.value)} className={inputCls} placeholder="VD: Quận 1, TP.HCM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                <select required value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls}>
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map((p) => (<option key={p.id} value={p.name}>{p.name}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hạn nộp hồ sơ</label>
              <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputCls} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Đang gửi...' : 'Đăng tin'}
              </button>
              <button type="button" onClick={() => navigate('/employer/dashboard')}
                className="rounded-xl border border-gray-200 px-8 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
