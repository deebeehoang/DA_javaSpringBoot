import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '@/services/profileService';
import { uploadService } from '@/services/uploadService';
import { locationService, type Province } from '@/services/locationService';
import type { CandidateProfileRequest } from '@/types';

const genderOptions = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const educationOptions = [
  { value: 'HIGH_SCHOOL', label: 'THPT' },
  { value: 'DIPLOMA', label: 'Cao đẳng' },
  { value: 'BACHELOR', label: 'Đại học' },
  { value: 'MASTER', label: 'Thạc sĩ' },
  { value: 'PHD', label: 'Tiến sĩ' },
];

const inputCls = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function CandidateProfilePage() {
  const [form, setForm] = useState<CandidateProfileRequest>({});
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    locationService.getProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    profileService
      .getCandidateProfile()
      .then((res) => {
        const p = res.data.data;
        if (p) {
          setForm({
            dateOfBirth: p.dateOfBirth ?? '',
            gender: p.gender ?? '',
            city: p.city ?? '',
            educationLevel: p.educationLevel ?? '',
            yearsOfExperience: p.yearsOfExperience ?? 0,
            expectedSalaryMin: p.expectedSalaryMin ?? undefined,
            expectedSalaryMax: p.expectedSalaryMax ?? undefined,
            bio: p.bio ?? '',
            cvUrl: p.cvUrl ?? '',
          });
          setAvatarUrl(p.user?.avatarUrl ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('avatar');
    setMessage('');
    try {
      const res = await uploadService.uploadAvatar(file);
      const url = res.data.data?.url ?? '';
      setAvatarUrl(url);
      setMessage('Upload avatar thành công!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Upload avatar thất bại');
    } finally {
      setUploading('');
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('cv');
    setMessage('');
    try {
      const res = await uploadService.uploadCV(file);
      const url = res.data.data?.url ?? '';
      setForm((prev) => ({ ...prev, cvUrl: url }));
      setMessage('Upload CV thành công!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Upload CV thất bại');
    } finally {
      setUploading('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await profileService.updateCandidateProfile(form);
      setMessage('Cập nhật hồ sơ thành công!');
    } catch {
      setMessage('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/candidate/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Bảng điều khiển
        </Link>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ ứng viên</h1>
          <p className="mt-1 text-sm text-gray-500">Cập nhật thông tin để thu hút nhà tuyển dụng</p>

          {message && (
            <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${message.includes('thành công') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d={message.includes('thành công') ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"} clipRule="evenodd" /></svg>
              {message}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="mt-6 flex items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-sm">?</div>
              )}
            </div>
            <div>
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleAvatarUpload} className="hidden" />
              <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploading === 'avatar'}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 disabled:opacity-50">
                {uploading === 'avatar' ? 'Đang tải...' : 'Đổi ảnh đại diện'}
              </button>
              <p className="mt-1.5 text-xs text-gray-400">PNG, JPG, GIF, WEBP (max 5MB)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth ?? ''} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                <select name="gender" value={form.gender ?? ''} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn --</option>
                  {genderOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
              <select name="city" value={form.city ?? ''} onChange={handleChange} className={inputCls}>
                <option value="">-- Chọn tỉnh/thành --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Trình độ học vấn</label>
                <select name="educationLevel" value={form.educationLevel ?? ''} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn --</option>
                  {educationOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số năm kinh nghiệm</label>
                <input type="number" name="yearsOfExperience" value={form.yearsOfExperience ?? ''} onChange={handleChange} min={0} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lương mong muốn (Min)</label>
                <input type="number" name="expectedSalaryMin" value={form.expectedSalaryMin ?? ''} onChange={handleChange} className={inputCls} placeholder="VNĐ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lương mong muốn (Max)</label>
                <input type="number" name="expectedSalaryMax" value={form.expectedSalaryMax ?? ''} onChange={handleChange} className={inputCls} placeholder="VNĐ" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Giới thiệu bản thân</label>
              <textarea name="bio" value={form.bio ?? ''} onChange={handleChange} rows={4} className={inputCls} placeholder="Giới thiệu ngắn về bản thân..." />
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">CV / Hồ sơ</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="hidden" />
                <button type="button" onClick={() => cvInputRef.current?.click()} disabled={uploading === 'cv'}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
                  {uploading === 'cv' ? 'Đang tải...' : 'Chọn file CV'}
                </button>
                {form.cvUrl && (
                  <a href={form.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Xem CV
                  </a>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">PDF, DOC, DOCX (max 10MB)</p>
            </div>

            <button type="submit" disabled={saving}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
