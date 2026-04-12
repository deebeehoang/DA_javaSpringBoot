import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    notificationService.unreadCount().then((r) => setUnreadCount(r.data.data ?? 0)).catch(() => {});

    const token = localStorage.getItem('token');
    if (!token) return;

    const eventSource = new EventSource(`/api/notifications/stream?token=${token}`);
    eventSource.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data);
      setUnreadCount((c) => c + 1);
      setNotifications((prev) => prev.length > 0 ? [notification, ...prev] : prev);
    });
    eventSource.onerror = () => {
      eventSource.close();
      const interval = setInterval(() => {
        notificationService.unreadCount().then((r) => setUnreadCount(r.data.data ?? 0)).catch(() => {});
      }, 30000);
      setTimeout(() => clearInterval(interval), 5000);
    };
    return () => eventSource.close();
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
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

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  };

  const profileLink = user?.role === 'EMPLOYER' ? '/employer/profile'
    : user?.role === 'ADMIN' ? '/admin/dashboard'
    : '/candidate/profile';

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">PT</div>
            <span className="text-xl font-bold text-gray-900">PartTimeHub</span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/jobs" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
              Tìm việc
            </Link>
            {user?.role === 'EMPLOYER' && (
              <>
                <Link to="/employer/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Quản lý tuyển dụng
                </Link>
                <Link to="/employer/applications" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Ứng viên
                </Link>
              </>
            )}
            {user?.role === 'CANDIDATE' && (
              <>
                <Link to="/candidate/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/candidate/applications" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Lịch sử ứng tuyển
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <Link to="/admin/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/admin/users" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Người dùng
                </Link>
                <Link to="/admin/jobs" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Tin tuyển dụng
                </Link>
                <Link to="/admin/categories" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Danh mục
                </Link>
                <Link to="/admin/skills" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
                  Kỹ năng
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                  Đăng nhập
                </Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                  Đăng ký
                </Link>
              </div>
            ) : (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={toggleNotif}
                    className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                      <div className="border-b bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">Thông báo</div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-sm text-gray-400">Chưa có thông báo</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)}
                              className={`cursor-pointer border-b border-gray-50 px-4 py-3 text-sm transition hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                              <p className={!n.isRead ? 'font-medium text-gray-800' : 'text-gray-600'}>{n.message}</p>
                              <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar + Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-gray-100">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <span className="hidden text-sm font-medium text-gray-700 sm:block">{user.fullName}</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                      <div className="border-b px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to={profileLink} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Hồ sơ cá nhân
                        </Link>
                        <Link to="/change-password" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Đổi mật khẩu
                        </Link>
                        <button onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
