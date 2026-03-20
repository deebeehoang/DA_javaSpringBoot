import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import type { Category } from '@/types';
import type { CategoryRequest } from '@/services/adminService';

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
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    await adminService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (editId === id) resetForm();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Bảng điều khiển
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-gray-800">Quản lý danh mục</h1>

      {/* Form */}
      <div className="mt-6 rounded-lg border bg-white p-5">
        <h2 className="font-semibold text-gray-700">
          {editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            placeholder="Tên danh mục *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Slug *"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Icon (emoji hoặc icon class)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.slug.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editId && (
            <button
              onClick={resetForm}
              className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
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
        <p className="mt-8 text-center text-gray-500">Chưa có danh mục nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{cat.id}</td>
                  <td className="px-4 py-3 text-xl">{cat.icon ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-gray-500">{cat.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        cat.active !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.active !== false ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggle(cat.id)}
                        className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-100"
                      >
                        {cat.active !== false ? 'Ẩn' : 'Hiện'}
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
