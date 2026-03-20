export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-white">PartTimeHub</h3>
            <p className="mt-2 text-sm">
              Nền tảng tìm kiếm việc làm thêm hàng đầu dành cho sinh viên và người lao động.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white">Liên kết</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li><a href="/jobs" className="hover:text-white">Tìm việc</a></li>
              <li><a href="/register" className="hover:text-white">Đăng ký</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white">Liên hệ</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Email: support@parttimehub.vn</li>
              <li>SĐT: 0123 456 789</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} PartTimeHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
