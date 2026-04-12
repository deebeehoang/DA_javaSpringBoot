import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';

const CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'TECHNICAL', label: 'Kỹ thuật' },
  { value: 'SOFT_SKILL', label: 'Kỹ năng mềm' },
  { value: 'LANGUAGE', label: 'Ngôn ngữ' },
  { value: 'OTHER', label: 'Khác' },
];

const categoryLabel: Record<string, string> = {
  TECHNICAL: 'Kỹ thuật',
  SOFT_SKILL: 'Kỹ năng mềm',
  LANGUAGE: 'Ngôn ngữ',
  OTHER: 'Khác',
};

const categoryColor: Record<string, string> = {
  TECHNICAL: 'bg-blue-50 text-blue-700 border-blue-200',
  SOFT_SKILL: 'bg-green-50 text-green-700 border-green-200',
  LANGUAGE: 'bg-purple-50 text-purple-700 border-purple-200',
  OTHER: 'bg-gray-50 text-gray-700 border-gray-200',
};

interface SkillItem {
  id: number;
  name: string;
  category: string;
  createdAt?: string;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('TECHNICAL');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchSkills = () => {
    setLoading(true);
    adminService
      .getSkills(filterCategory || undefined)
      .then((res) => setSkills(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSkills(); }, [filterCategory]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => {
    setEditingSkill(null);
    setFormName('');
    setFormCategory('TECHNICAL');
    setShowForm(true);
  };

  const openEdit = (skill: SkillItem) => {
    setEditingSkill(skill);
    setFormName(skill.name);
    setFormCategory(skill.category);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingSkill) {
        await adminService.updateSkill(editingSkill.id, { name: formName.trim(), category: formCategory });
        showToast('Cập nhật kỹ năng thành công');
      } else {
        await adminService.createSkill({ name: formName.trim(), category: formCategory });
        showToast('Tạo kỹ năng thành công');
      }
      setShowForm(false);
      fetchSkills();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa kỹ năng này?')) return;
    try {
      await adminService.deleteSkill(id);
      showToast('Xóa kỹ năng thành công');
      fetchSkills();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể xóa');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý kỹ năng</h1>
            <p className="mt-1 text-sm text-gray-500">Thêm, sửa, xóa kỹ năng cho hệ thống</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Thêm kỹ năng
          </button>
        </div>

        {/* Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filterCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skills Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : skills.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">Chưa có kỹ năng nào</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Tên kỹ năng</th>
                  <th className="px-6 py-3">Danh mục</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{skill.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{skill.name}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColor[skill.category] ?? categoryColor.OTHER}`}>
                        {categoryLabel[skill.category] ?? skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(skill)}
                        className="mr-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-400">Tổng: {skills.length} kỹ năng</p>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSkill ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}
              </h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên kỹ năng</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ví dụ: React, Python, English..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="TECHNICAL">Kỹ thuật</option>
                    <option value="SOFT_SKILL">Kỹ năng mềm</option>
                    <option value="LANGUAGE">Ngôn ngữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : editingSkill ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
