import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Monitor, LogOut, ChevronDown } from 'lucide-react';

interface AvatarDropdownProps {
  user: {
    id?: string | number;
    name: string;
    email: string;
    avatar: string;
  };
  onLogout: () => void;
}

export default function AvatarDropdown({ user, onLogout }: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
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
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-green-200"
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
              <User className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Profile
              </span>
            </Link>

            <Link
              to="user/settings/sessions"
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
              onClick={() => {
                setIsOpen(false);
                // ĐÃ SỬA: Gọi hàm onLogout thay vì chỉ console.log
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors group"
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