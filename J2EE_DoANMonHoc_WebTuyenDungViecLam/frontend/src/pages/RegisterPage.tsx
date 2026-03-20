import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'CANDIDATE' as 'CANDIDATE' | 'EMPLOYER',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.role === 'EMPLOYER' && !form.companyName.trim()) {
      setError('Vui lòng nhập tên công ty');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone || undefined,
        role: form.role,
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-gray-500">Tham gia PartTimeHub ngay hôm nay</p>

        {error && (
          <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Role Selector */}
          <div className="flex gap-4">
            {(['CANDIDATE', 'EMPLOYER'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => set('role', role)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                  form.role === role
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {role === 'CANDIDATE' ? '🧑 Ứng viên' : '🏢 Nhà tuyển dụng'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {form.role === 'EMPLOYER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
