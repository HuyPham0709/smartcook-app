import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { ChefHat, Home, Plus, User, Search, Settings, Shield, LogOut } from 'lucide-react'; // Thêm icon LogOut
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate(); // Khởi tạo hàm chuyển trang

  const isActive = (path: string) => location.pathname === path;

  // Hàm xử lý khi bấm Đăng xuất
  const handleLogout = () => {
    // 1. Xóa Token khỏi trình duyệt
    localStorage.removeItem('accessToken');
    localStorage.removeItem('temp_user_id'); 
    
    // 2. Chuyển hướng người dùng về trang Đăng nhập
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content with left margin to account for sidebar */}
      <div className="ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`flex items-center gap-2 transition-colors ${isActive('/') ? 'text-[var(--green-medium)]' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/fridge-creatives"
                  className={`flex items-center gap-2 transition-colors ${isActive('/fridge-creatives') ? 'text-[var(--green-medium)]' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <Search className="w-5 h-5" />
                  <span>Fridge Creatives</span>
                </Link>
                <Link
                  to="/create"
                  className={`flex items-center gap-2 transition-colors ${isActive('/create') ? 'text-[var(--green-medium)]' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Create</span>
                </Link>
                <Link
                  to="/profile/1"
                  className={`flex items-center gap-2 transition-colors ${location.pathname.startsWith('/profile') ? 'text-[var(--green-medium)]' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings/sessions"
                  className={`flex items-center gap-2 transition-colors ${location.pathname.startsWith('/settings') ? 'text-[var(--green-medium)]' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 transition-colors ${location.pathname.startsWith('/admin') ? 'text-[var(--green-medium)]' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <Shield className="w-5 h-5" />
                </Link>
              </nav>

              {/* Nhóm các nút bên phải (Share Recipe & Đăng xuất) */}
              <div className="ml-auto flex items-center gap-4">
                <button
                  className="px-6 py-2 rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--orange)' }}
                >
                  Share Recipe
                </button>
                
                {/* NÚT ĐĂNG XUẤT */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}