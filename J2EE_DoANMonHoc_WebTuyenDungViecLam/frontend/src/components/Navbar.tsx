import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    // Lấy unread count ban đầu
    notificationService.unreadCount().then((r) => setUnreadCount(r.data.data ?? 0)).catch(() => {});

    // SSE realtime notifications
    const token = localStorage.getItem('token');
    if (!token) return;

    const eventSource = new EventSource(`/api/notifications/stream?token=${token}`);

    eventSource.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data);
      setUnreadCount((c) => c + 1);
      // Nếu dropdown đang mở, thêm notification mới vào đầu danh sách
      setNotifications((prev) => prev.length > 0 ? [notification, ...prev] : prev);
    });

    eventSource.onerror = () => {
      eventSource.close();
      // Fallback polling khi SSE mất kết nối
      const interval = setInterval(() => {
        notificationService.unreadCount().then((r) => setUnreadCount(r.data.data ?? 0)).catch(() => {});
      }, 30000);
      // Thử reconnect SSE sau 5s
      setTimeout(() => clearInterval(interval), 5000);
    };

    return () => eventSource.close();
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleNotif = async () => {
    if (!notifOpen) {
      try {
        const res = await notificationService.getAll();
        setNotifications(res.data.data ?? []);
      } catch { /* ignore */ }
    }
    setNotifOpen(!notifOpen);
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            PartTimeHub
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600">
              Tìm việc
            </Link>

            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {user.role === 'EMPLOYER' && (
                  <>
                    <Link
                      to="/employer/dashboard"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Quản lý tuyển dụng
                    </Link>
                    <Link
                      to="/employer/applications"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Quản lý ứng viên
                    </Link>
                    <Link
                      to="/employer/profile"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Hồ sơ công ty
                    </Link>
                  </>
                )}
                {user.role === 'CANDIDATE' && (
                  <>
                    <Link
                      to="/candidate/skills"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Kỹ năng
                    </Link>
                    <Link
                      to="/candidate/saved-jobs"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Việc đã lưu
                    </Link>
                    <Link
                      to="/candidate/profile"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Hồ sơ
                    </Link>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Bảng điều khiển
                    </Link>
                    <Link
                      to="/admin/users"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Người dùng
                    </Link>
                    <Link
                      to="/admin/jobs"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Tin tuyển dụng
                    </Link>
                    <Link
                      to="/admin/categories"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Danh mục
                    </Link>
                  </>
                )}
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={toggleNotif}
                    className="relative rounded-full p-1.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border bg-white shadow-lg">
                      <div className="border-b px-4 py-2.5 font-semibold text-gray-800">Thông báo</div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-6 text-center text-sm text-gray-400">Chưa có thông báo</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => !n.isRead && markAsRead(n.id)}
                              className={`cursor-pointer border-b px-4 py-3 text-sm hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50 font-medium' : 'text-gray-600'}`}
                            >
                              <p>{n.message}</p>
                              <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-sm text-gray-500">{user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
