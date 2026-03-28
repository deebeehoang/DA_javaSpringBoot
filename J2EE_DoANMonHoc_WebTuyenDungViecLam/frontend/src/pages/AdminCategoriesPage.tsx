import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import type { Category } from '@/types';
import type { CategoryRequest } from '@/services/adminService';

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";

function emptyForm(): CategoryRequest {
  return { name: '', slug: '', icon: '', description: '' };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(Category & { active?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CategoryRequest>(emptyForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    adminService
      .getCategories()
      .then((res) => setCategories(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setEditId(null);
  };

  const startEdit = (cat: Category & { active?: boolean }) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon ?? '', description: cat.description ?? '' });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      if (editId !== null) {
        await adminService.updateCategory(editId, form);
      } else {
        await adminService.createCategory(form);
      }
      resetForm();
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    await adminService.toggleCategory(id);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleDelete = async (id: number) => {
    if (!globalThis.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    await adminService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (editId === id) resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Bảng điều khiển
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Quản lý danh mục</h1>

        {/* Form */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={editId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} /></svg>
            {editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input placeholder="Tên danh mục *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input placeholder="Slug *" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} />
            <input placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputCls} />
            <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.slug.trim()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
            </button>
            {editId && (
              <button onClick={resetForm} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                Hủy
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">Chưa có danh mục nào.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Icon</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tên</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="transition hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 text-gray-500">{cat.id}</td>
                      <td className="px-5 py-3.5 text-xl">{cat.icon ?? '—'}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-5 py-3.5 text-gray-500">{cat.slug}</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          cat.active !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {cat.active !== false ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => startEdit(cat)} className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50">Sửa</button>
                          <button onClick={() => handleToggle(cat.id)} className="rounded-lg border border-yellow-200 px-2.5 py-1 text-xs font-medium text-yellow-700 transition hover:bg-yellow-50">
                            {cat.active !== false ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
