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
    { label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'blue', link: '/admin/users' },
    { label: 'Nhà tuyển dụng', value: stats?.totalEmployers ?? 0, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'purple', link: '/admin/users?role=EMPLOYER' },
    { label: 'Ứng viên', value: stats?.totalCandidates ?? 0, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'green', link: '/admin/users?role=CANDIDATE' },
    { label: 'Tổng tin tuyển dụng', value: stats?.totalJobs ?? 0, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'orange', link: '/admin/jobs' },
    { label: 'Đang tuyển', value: stats?.openJobs ?? 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald', link: '/admin/jobs?status=OPEN' },
    { label: 'Tổng đơn ứng tuyển', value: stats?.totalApplications ?? 0, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'pink', link: '/admin/users' },
    { label: 'Danh mục ngành', value: stats?.totalCategories ?? 0, icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'indigo', link: '/admin/categories' },
  ];

  const colorMap: Record<string, { iconBg: string; text: string }> = {
    blue: { iconBg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { iconBg: 'bg-purple-100', text: 'text-purple-600' },
    green: { iconBg: 'bg-green-100', text: 'text-green-600' },
    orange: { iconBg: 'bg-orange-100', text: 'text-orange-600' },
    emerald: { iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
    pink: { iconBg: 'bg-pink-100', text: 'text-pink-600' },
    indigo: { iconBg: 'bg-indigo-100', text: 'text-indigo-600' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển quản trị</h1>
        <p className="mt-1 text-sm text-gray-500">Tổng quan hệ thống PartTimeHub</p>

        {/* Stats Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const c = colorMap[card.color];
            return (
              <Link
                key={card.label}
                to={card.link}
                className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <svg className={`h-5 w-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 group-hover:text-blue-600 transition">{card.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick access */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900">Quản lý nhanh</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { to: '/admin/users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', title: 'Quản lý người dùng', desc: 'Xem, khóa, kích hoạt tài khoản', color: 'blue' },
              { to: '/admin/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Quản lý tin tuyển dụng', desc: 'Duyệt, đóng, xóa tin đăng', color: 'orange' },
              { to: '/admin/categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', title: 'Quản lý danh mục', desc: 'Thêm, sửa, ẩn danh mục ngành', color: 'indigo' },
            ].map((item) => {
              const c = colorMap[item.color];
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
                    <svg className={`h-6 w-6 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
