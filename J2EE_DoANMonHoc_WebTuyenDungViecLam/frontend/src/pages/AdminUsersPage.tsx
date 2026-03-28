import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import type { User } from '@/types';

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  EMPLOYER: 'bg-blue-50 text-blue-700 border-blue-200',
  CANDIDATE: 'bg-green-50 text-green-700 border-green-200',
};

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  EMPLOYER: 'Nhà tuyển dụng',
  CANDIDATE: 'Ứng viên',
};

const statusBadge: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  INACTIVE: 'bg-gray-50 text-gray-600 border-gray-200',
  BANNED: 'bg-red-50 text-red-600 border-red-200',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Tạm dừng',
  BANNED: 'Bị khóa',
};

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') ?? '');

  const fetchUsers = (p: number, role: string) => {
    setLoading(true);
    adminService
      .getUsers(p, 10, role)
      .then((res) => {
        const pageData = res.data.data;
        setUsers(pageData?.content ?? []);
        setTotalPages(pageData?.totalPages ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(page, roleFilter);
  }, [page, roleFilter]);

  const handleRoleChange = (role: string) => {
    setRoleFilter(role);
    setPage(0);
    if (role) {
      setSearchParams({ role });
    } else {
      setSearchParams({});
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminService.updateUserStatus(id, status);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: status as User['status'] } : u)),
      );
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!globalThis.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-blue-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Bảng điều khiển
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Quản lý người dùng</h1>

        {/* Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { value: '', label: 'Tất cả' },
            { value: 'EMPLOYER', label: 'Nhà tuyển dụng' },
            { value: 'CANDIDATE', label: 'Ứng viên' },
            { value: 'ADMIN', label: 'Admin' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleRoleChange(f.value)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                roleFilter === f.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Người dùng</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">SĐT</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Vai trò</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày tạo</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="transition hover:bg-gray-50/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                                {user.fullName?.[0] ?? '?'}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">{user.phone ?? '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${roleBadge[user.role]}`}>
                            {roleLabel[user.role]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge[user.status]}`}>
                            {statusLabel[user.status]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5">
                            {user.status === 'ACTIVE' ? (
                              <button
                                onClick={() => updateStatus(user.id, 'BANNED')}
                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              >
                                Khóa
                              </button>
                            ) : (
                              <button
                                onClick={() => updateStatus(user.id, 'ACTIVE')}
                                className="rounded-lg border border-green-200 px-2.5 py-1 text-xs font-medium text-green-600 transition hover:bg-green-50"
                              >
                                Kích hoạt
                              </button>
                            )}
                            {user.role !== 'ADMIN' && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-500">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
