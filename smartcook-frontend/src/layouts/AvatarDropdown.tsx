// src/layouts/AvatarDropdown.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Monitor, LogOut, ChevronDown } from 'lucide-react';

import { authApi } from '../api/authApi';
import { UserProfile } from '../types/user';

interface AvatarDropdownProps {
  onLogout: () => void;
}

export default function AvatarDropdown({ onLogout }: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Xử lý click ra ngoài để đóng Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch dữ liệu User Profile khi mount
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getProfile();  
      if (data && data.id) {
        setUser(data);
      } else {
        setError(true);
      }
    } catch (err: any) {
      // LOG lỗi ra đây để biết là do Token (401) hay do sai đường dẫn (404)
      console.error('Lỗi API Profile:', err.response?.status, err.message);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  fetchUserProfile();
}, []);

  // Xử lý API Logout
  const handleLogoutClick = async () => {
    try {
      setIsOpen(false);
      await authApi.logout();
    } catch (err) {
      console.error('Logout API failed, proceeding with local logout', err);
    } finally {
      onLogout();
    }
  };

  // Trạng thái Loading: Hiển thị Skeleton
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-1.5 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-200"></div>
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // CHỈ hiện Session Expired nếu thực sự có lỗi fetch hoặc không có user hoàn toàn
  if (error || !user) {
    return (
      <button 
        onClick={onLogout}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-red-500 text-sm font-medium"
      >
        Session expired. Login again.
      </button>
    );
  }

  // XỬ LÝ AVATAR MẶC ĐỊNH: Luôn có fallback nếu user.avatar là null/undefined/empty
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;
  const avatarSrc = (user.avatar && user.avatar !== "") ? user.avatar : defaultAvatar;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <img
          src={avatarSrc}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
          onError={(e) => {
            // Dự phòng nếu link ảnh trong DB bị hỏng (404)
            (e.target as HTMLImageElement).src = defaultAvatar;
          }}
        />
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn">
          {/* User Info Section */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-green-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to={`/user/profile/${user.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <UserIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Profile
              </span>
            </Link>

            <Link
              to="/user/settings/sessions"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <Monitor className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Session Management
              </span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Logout Button */}
          <div className="p-2">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors group focus:outline-none"
            >
              <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
              <span className="text-sm font-semibold text-red-600 group-hover:text-red-700">
                Logout
              </span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}