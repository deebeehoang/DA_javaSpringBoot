import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '@/services/profileService';
import { uploadService } from '@/services/uploadService';
import { locationService, type Province } from '@/services/locationService';
import type { EmployerProfileRequest } from '@/types';

const companyTypeOptions = [
  { value: 'COMPANY', label: 'Công ty' },
  { value: 'INDIVIDUAL', label: 'Cá nhân' },
];

const companySizeOptions = [
  { value: '_1_10', label: '1-10 nhân viên' },
  { value: '_11_50', label: '11-50 nhân viên' },
  { value: '_51_200', label: '51-200 nhân viên' },
  { value: '_201_500', label: '201-500 nhân viên' },
  { value: '_500_PLUS', label: '500+ nhân viên' },
];

const inputCls = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function EmployerProfilePage() {
  const [form, setForm] = useState<EmployerProfileRequest>({});
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    locationService.getProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    profileService
      .getEmployerProfile()
      .then((res) => {
        const p = res.data.data;
        if (p) {
          setForm({
            companyName: p.companyName ?? '',
            companyType: p.companyType ?? '',
            companySize: p.companySize ?? '',
            description: p.description ?? '',
            website: p.website ?? '',
            address: p.address ?? '',
            city: p.city ?? '',
            logoUrl: p.logoUrl ?? '',
            industry: p.industry ?? '',
          });
          setAvatarUrl(p.user?.avatarUrl ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('avatar');
    setMessage('');
    try {
      const res = await uploadService.uploadAvatar(file);
      setAvatarUrl(res.data.data?.url ?? '');
      setMessage('Upload avatar thành công!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Upload avatar thất bại');
    } finally {
      setUploading('');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('logo');
    setMessage('');
    try {
      const res = await uploadService.uploadLogo(file);
      const url = res.data.data?.url ?? '';
      setForm((prev) => ({ ...prev, logoUrl: url }));
      setMessage('Upload logo thành công!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Upload logo thất bại');
    } finally {
      setUploading('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await profileService.updateEmployerProfile(form);
      setMessage('Cập nhật hồ sơ công ty thành công!');
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
        <Link to="/employer/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Quản lý tuyển dụng
        </Link>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ công ty</h1>
          <p className="mt-1 text-sm text-gray-500">Cập nhật thông tin công ty để thu hút ứng viên</p>

          {message && (
            <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${message.includes('thành công') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d={message.includes('thành công') ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"} clipRule="evenodd" /></svg>
              {message}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="mt-6 flex items-center gap-5">
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
              <input type="text" name="companyName" value={form.companyName ?? ''} onChange={handleChange} className={inputCls} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại hình</label>
                <select name="companyType" value={form.companyType ?? ''} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn --</option>
                  {companyTypeOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quy mô</label>
                <select name="companySize" value={form.companySize ?? ''} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn --</option>
                  {companySizeOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngành nghề</label>
              <input type="text" name="industry" value={form.industry ?? ''} onChange={handleChange} className={inputCls} placeholder="VD: Công nghệ thông tin" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                <select name="city" value={form.city ?? ''} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input type="url" name="website" value={form.website ?? ''} onChange={handleChange} className={inputCls} placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input type="text" name="address" value={form.address ?? ''} onChange={handleChange} className={inputCls} placeholder="Nhập địa chỉ công ty..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả công ty</label>
              <textarea name="description" value={form.description ?? ''} onChange={handleChange} rows={4} className={inputCls} placeholder="Giới thiệu về công ty..." />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo công ty</label>
              <div className="mt-1.5 flex items-center gap-4">
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleLogoUpload} className="hidden" />
                {form.logoUrl && (
                  <img src={form.logoUrl} alt="Logo" className="h-16 w-16 rounded-xl border object-contain shadow-sm" />
                )}
                <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploading === 'logo'}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
                  {uploading === 'logo' ? 'Đang tải...' : form.logoUrl ? 'Đổi logo' : 'Chọn logo'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">PNG, JPG, GIF, WEBP (max 5MB)</p>
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
