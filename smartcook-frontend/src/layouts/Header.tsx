import { Search, Plus, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AvatarDropdown from "./AvatarDropdown";
import { interactionApi } from "../api/interactionApi";
import { socket } from "../socket";

interface HeaderProps {
  isLoggedIn: boolean;
  currentUser: any;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export default function Header({ isLoggedIn, currentUser, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  // Đếm số thông báo chưa đọc (bảo vệ chống crash bằng || [])
  const unreadCount = (notifications || []).filter(n => !n.IsRead).length;

  // 1. Lấy thông báo lần đầu khi load trang
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  // 2. Lắng nghe thông báo Real-time
  useEffect(() => {
    if (isLoggedIn) {
      socket.on('new_notification', (data) => {
        setNotifications(prev => [data, ...(prev || [])]);
      });
      return () => { socket.off('new_notification'); };
    }
  }, [isLoggedIn]);

  // Hàm gọi API lấy danh sách
  const fetchNotifications = async () => {
    try {
      const res = await interactionApi.getNotifications();
      // Xử lý thông minh: lấy mảng dù Axios trả về kiểu gì
      const notifData = Array.isArray(res) ? res : (res?.data || []);
      setNotifications(notifData);
    } catch (err) {
      console.error("Lỗi lấy thông báo", err);
      setNotifications([]);
    }
  };

  // Hàm đánh dấu đã đọc
  const handleMarkRead = async () => {
    setShowNotif(!showNotif);
    if (unreadCount > 0) {
      try {
        await interactionApi.markAsRead();
        setNotifications((notifications || []).map(n => ({ ...n, IsRead: true })));
      } catch (error) {
        console.error("Lỗi update thông báo", error);
      }
    }
  };

  // Hàm click vào thông báo để xem chi tiết món ăn
  const handleNotificationClick = (recipeId: number) => {
    setShowNotif(false);
    if (recipeId) {
      navigate(`/recipe/${recipeId}`);
    }
  };

  // Hàm click tạo món ăn
  const handleCreateClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      // CHUYỂN THẲNG SANG TRANG LOGIN, KHÔNG HIỆN MODAL
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-12 py-4">
        
        {/* Search Input */}
        <div className="flex-1 max-w-2xl group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--green-medium)] transition-colors" />
            <input
              type="text"
              placeholder="Search recipes, chefs, or ingredients..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)]/20 focus:border-[var(--green-medium)] transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-6">
          
          {/* Nút Create Recipe */}
          <Link
            to="/create"
            onClick={handleCreateClick}
            className="group flex items-center gap-2 px-5 py-2.5 bg-[var(--orange)] rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md shadow-orange-500/20"
          >
            <Plus
              className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90"
              strokeWidth={3}
            />
            <span className="hidden sm:inline">Create Recipe</span>
          </Link>

          {/* User Auth & Notifications */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              
              {/* === KHỐI CHUÔNG THÔNG BÁO === */}
              <div className="relative">
                <button 
                  onClick={handleMarkRead}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Thông báo */}
                {showNotif && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {(notifications || []).length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
                      ) : (
                        (notifications || []).map((notif) => (
                          <div 
                            key={notif.ID} 
                            onClick={() => handleNotificationClick(notif.RecipeID)}
                            className={`p-4 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${!notif.IsRead ? 'bg-blue-50/30' : ''}`}
                          >
                           <img 
                              src={notif.SenderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.SenderName || 'User')}&background=random&color=fff`} 
                              className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                              alt={notif.SenderName} 
                              onError={(e) => { 
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.SenderName || 'User')}&background=random&color=fff`;
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 leading-snug">
                                <span className="font-bold">{notif.SenderName}</span> {notif.Message}
                              </p>
                              <span className="text-[11px] text-gray-400 mt-1 block">
                                {new Date(notif.CreatedAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            {!notif.IsRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shadow-sm shadow-blue-200"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-50 text-center">
                      <button className="text-xs text-[var(--green-medium)] font-medium hover:underline">View all</button>
                    </div>
                  </div>
                )}
              </div>

              <AvatarDropdown user={currentUser} onLogout={onLogout} />
            </div>
          ) : (
            // NÚT SIGN IN CHUYỂN THẲNG TRANG LOGIN
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}