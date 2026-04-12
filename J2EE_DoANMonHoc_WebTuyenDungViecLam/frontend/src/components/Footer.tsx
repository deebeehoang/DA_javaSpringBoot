import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">PT</div>
              <span className="text-xl font-bold text-white">PartTimeHub</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Nền tảng tìm kiếm việc làm thêm hàng đầu dành cho sinh viên và người lao động trên khắp Việt Nam.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-blue-600 hover:text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-blue-600 hover:text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-blue-600 hover:text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Dành cho ứng viên</h4>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/jobs" className="text-sm text-gray-400 transition hover:text-white">Tìm việc làm</Link></li>
              <li><Link to="/register" className="text-sm text-gray-400 transition hover:text-white">Tạo tài khoản</Link></li>
              <li><Link to="/candidate/profile" className="text-sm text-gray-400 transition hover:text-white">Hồ sơ ứng viên</Link></li>
              <li><Link to="/candidate/saved-jobs" className="text-sm text-gray-400 transition hover:text-white">Việc đã lưu</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Dành cho nhà tuyển dụng</h4>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/register" className="text-sm text-gray-400 transition hover:text-white">Đăng ký tuyển dụng</Link></li>
              <li><Link to="/employer/jobs/create" className="text-sm text-gray-400 transition hover:text-white">Đăng tin tuyển dụng</Link></li>
              <li><Link to="/employer/dashboard" className="text-sm text-gray-400 transition hover:text-white">Quản lý tuyển dụng</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Liên hệ</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                <span className="text-sm text-gray-400">support@parttimehub.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                <span className="text-sm text-gray-400">0123 456 789</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span className="text-sm text-gray-400">TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} PartTimeHub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">Điều khoản</a>
            <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">Bảo mật</a>
            <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">Trợ giúp</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
