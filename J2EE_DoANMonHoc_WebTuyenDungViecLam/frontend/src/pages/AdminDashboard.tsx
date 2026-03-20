import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, type DashboardStats } from '@/services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then((res) => setStats(res.data.data!))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, color: 'bg-blue-500', link: '/admin/users' },
    { label: 'Nhà tuyển dụng', value: stats?.totalEmployers ?? 0, color: 'bg-purple-500', link: '/admin/users?role=EMPLOYER' },
    { label: 'Ứng viên', value: stats?.totalCandidates ?? 0, color: 'bg-green-500', link: '/admin/users?role=CANDIDATE' },
    { label: 'Tổng tin tuyển dụng', value: stats?.totalJobs ?? 0, color: 'bg-orange-500', link: '/admin/jobs' },
    { label: 'Đang tuyển', value: stats?.openJobs ?? 0, color: 'bg-emerald-500', link: '/admin/jobs?status=OPEN' },
    { label: 'Tổng đơn ứng tuyển', value: stats?.totalApplications ?? 0, color: 'bg-pink-500', link: '/admin/users' },
    { label: 'Danh mục ngành', value: stats?.totalCategories ?? 0, color: 'bg-indigo-500', link: '/admin/categories' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển quản trị</h1>

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">{card.value}</p>
            <div className={`mt-3 h-1 w-12 rounded ${card.color}`} />
          </Link>
        ))}
      </div>

      {/* Quick access */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800">Quản lý</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link
            to="/admin/users"
            className="flex items-center gap-3 rounded-lg border bg-white p-5 transition hover:border-blue-300 hover:shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-lg">
              👥
            </div>
            <div>
              <p className="font-semibold text-gray-800">Quản lý người dùng</p>
              <p className="text-sm text-gray-500">Xem, khóa, kích hoạt tài khoản</p>
            </div>
          </Link>
          <Link
            to="/admin/jobs"
            className="flex items-center gap-3 rounded-lg border bg-white p-5 transition hover:border-blue-300 hover:shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 text-lg">
              💼
            </div>
            <div>
              <p className="font-semibold text-gray-800">Quản lý tin tuyển dụng</p>
              <p className="text-sm text-gray-500">Duyệt, đóng, xóa tin đăng</p>
            </div>
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-3 rounded-lg border bg-white p-5 transition hover:border-blue-300 hover:shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-lg">
              📂
            </div>
            <div>
              <p className="font-semibold text-gray-800">Quản lý danh mục</p>
              <p className="text-sm text-gray-500">Thêm, sửa, ẩn danh mục ngành</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
