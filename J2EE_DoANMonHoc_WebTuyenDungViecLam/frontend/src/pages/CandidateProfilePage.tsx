import { useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';
import MapboxAddressInput from '@/components/MapboxAddressInput';
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

export default function CandidateProfilePage() {
  const [form, setForm] = useState<CandidateProfileRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Hồ sơ ứng viên</h1>

      {message && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giới tính</label>
            <select name="gender" value={form.gender ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">-- Chọn --</option>
              {genderOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Thành phố</label>
          <MapboxAddressInput
            value={form.city ?? ''}
            onChange={(val) => setForm((prev) => ({ ...prev, city: val }))}
            placeholder="VD: Hồ Chí Minh"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Trình độ học vấn</label>
            <select name="educationLevel" value={form.educationLevel ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">-- Chọn --</option>
              {educationOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số năm kinh nghiệm</label>
            <input type="number" name="yearsOfExperience" value={form.yearsOfExperience ?? ''} onChange={handleChange}
              min={0} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mức lương mong muốn (Min)</label>
            <input type="number" name="expectedSalaryMin" value={form.expectedSalaryMin ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="VNĐ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mức lương mong muốn (Max)</label>
            <input type="number" name="expectedSalaryMax" value={form.expectedSalaryMax ?? ''} onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="VNĐ" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Giới thiệu bản thân</label>
          <textarea name="bio" value={form.bio ?? ''} onChange={handleChange} rows={4}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Giới thiệu ngắn về bản thân..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Link CV</label>
          <input type="url" name="cvUrl" value={form.cvUrl ?? ''} onChange={handleChange}
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
