import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import AvatarDropdown from "./AvatarDropdown";

interface HeaderProps {
  isLoggedIn: boolean;
  currentUser: any;
  onOpenLoginModal: () => void;
}

export default function Header({ isLoggedIn, currentUser, onOpenLoginModal }: HeaderProps) {
  
  // Hàm xử lý khi click vào nút Create Recipe
  const handleCreateClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault(); // Chặn chuyển trang
      onOpenLoginModal(); // Mở modal yêu cầu đăng nhập
    }
  };

  return (
    // Thêm backdrop-blur-md và bg-white/80 để tạo hiệu ứng kính mờ (Glassmorphism)
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-12 py-4">
        
        {/* Search Input */}
        <div className="flex-1 max-w-2xl group">
          <div className="relative">
            {/* Đổi màu icon khi focus vào ô search */}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--green-medium)] transition-colors" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or chefs..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)]/20 focus:border-[var(--green-medium)] transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-6">
          
          {/* Nút Create Recipe - Xử lý logic chặn nếu chưa login */}
          <Link
            to="/create"
            onClick={handleCreateClick}
            className="group flex items-center gap-2 px-5 py-2.5 bg-[var(--orange)] rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md shadow-orange-500/20"
          >
            <Plus
              className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90"
              strokeWidth={3}
            />
            {/* Ẩn chữ trên màn hình nhỏ để tránh vỡ layout */}
            <span className="hidden sm:inline">Create Recipe</span>
          </Link>

          {/* User Auth */}
          {isLoggedIn ? (
            <AvatarDropdown user={currentUser} />
          ) : (
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}