import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', phone: '',
    role: 'CANDIDATE' as 'CANDIDATE' | 'EMPLOYER', companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (form.role === 'EMPLOYER' && !form.companyName.trim()) { setError('Vui lòng nhập tên công ty'); return; }
    setLoading(true);
    try {
      const res = await authService.register({
        email: form.email, password: form.password, fullName: form.fullName,
        phone: form.phone || undefined, role: form.role,
        companyName: form.role === 'EMPLOYER' ? form.companyName : undefined,
      });
      const { token, user } = res.data.data!;
      login(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Branding */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 lg:flex">
        <div className="max-w-md px-12 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">PT</div>
          <h2 className="mt-6 text-4xl font-extrabold leading-tight">Bắt đầu hành trình của bạn</h2>
          <p className="mt-4 text-lg text-blue-100/80">
            Tạo tài khoản để khám phá hàng ngàn cơ hội việc làm hoặc tìm kiếm ứng viên phù hợp.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">PT</div>
              <span className="text-2xl font-bold text-gray-900">PartTimeHub</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-gray-500">Đăng ký miễn phí chỉ trong 1 phút</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3">
              {([['CANDIDATE', 'Ứng viên', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'], ['EMPLOYER', 'Nhà tuyển dụng', 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4']] as const).map(([role, label, icon]) => (
                <button key={role} type="button" onClick={() => set('role', role)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                    form.role === role ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
                  {label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input type="text" required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} placeholder="0901 234 567" />
            </div>

            {form.role === 'EMPLOYER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
                <input type="text" required value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inputCls} placeholder="Công ty ABC" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} className={inputCls} placeholder="Tối thiểu 6 ký tự" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận</label>
                <input type="password" required value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} className={inputCls} placeholder="Nhập lại" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
