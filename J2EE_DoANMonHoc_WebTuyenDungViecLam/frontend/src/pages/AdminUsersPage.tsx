import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import type { User } from '@/types';

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  EMPLOYER: 'bg-blue-100 text-blue-700',
  CANDIDATE: 'bg-green-100 text-green-700',
};

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  EMPLOYER: 'Nhà tuyển dụng',
  CANDIDATE: 'Ứng viên',
};

const statusBadge: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  BANNED: 'bg-red-100 text-red-700',
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
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Bảng điều khiển
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4 flex gap-2">
        {[
          { value: '', label: 'Tất cả' },
          { value: 'EMPLOYER', label: 'Nhà tuyển dụng' },
          { value: 'CANDIDATE', label: 'Ứng viên' },
          { value: 'ADMIN', label: 'Admin' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => handleRoleChange(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              roleFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">SĐT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {user.fullName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.phone ?? '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${roleBadge[user.role]}`}>
                        {roleLabel[user.role]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge[user.status]}`}>
                        {statusLabel[user.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex gap-2">
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => updateStatus(user.id, 'BANNED')}
                            className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                          >
                            Khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(user.id, 'ACTIVE')}
                            className="rounded bg-green-50 px-2 py-1 text-xs text-green-600 hover:bg-green-100"
                          >
                            Kích hoạt
                          </button>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
