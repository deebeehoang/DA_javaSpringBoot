import { useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';
import MapboxAddressInput from '@/components/MapboxAddressInput';
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

export default function EmployerProfilePage() {
  const [form, setForm] = useState<EmployerProfileRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Hồ sơ công ty</h1>

      {message && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
          <input type="text" name="companyName" value={form.companyName ?? ''} onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại hình</label>
            <select name="companyType" value={form.companyType ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">-- Chọn --</option>
              {companyTypeOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quy mô</label>
            <select name="companySize" value={form.companySize ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">-- Chọn --</option>
              {companySizeOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ngành nghề</label>
          <input type="text" name="industry" value={form.industry ?? ''} onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="VD: Công nghệ thông tin" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Thành phố</label>
            <input type="text" name="city" value={form.city ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input type="url" name="website" value={form.website ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <MapboxAddressInput
            value={form.address ?? ''}
            onChange={(address, city) => {
              setForm((prev) => ({
                ...prev,
                address,
                ...(city ? { city } : {}),
              }));
            }}
            placeholder="Nhập địa chỉ công ty..."
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả công ty</label>
          <textarea name="description" value={form.description ?? ''} onChange={handleChange} rows={4}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Giới thiệu về công ty..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input type="url" name="logoUrl" value={form.logoUrl ?? ''} onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://..." />
        </div>

        <button type="submit" disabled={saving}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
        </button>
      </form>
    </div>
  );
}
