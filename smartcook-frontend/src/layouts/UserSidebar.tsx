import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChefHat, 
  User, 
  Search, 
  Crown, 
  Refrigerator, 
  Trophy, 
  BarChart3, 
  MessageCircle, 
  Shield
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  isLoggedIn?: boolean;
}

export default function UserSidebar({ isExpanded, setIsExpanded, isLoggedIn = false }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Dữ liệu menu từ file gốc của bạn
  const menuItems = [
    { icon: Search, label: 'Search', path: '/' },
    { icon: Crown, label: 'Premium', path: '/premium', isPremium: true },
    { icon: Refrigerator, label: 'Fridge Creatives', path: '/fridge-creatives' },
    { icon: Trophy, label: 'Challenges', path: '/challenges' },
    { icon: BarChart3, label: 'Stats', path: '/stats' },
    { icon: MessageCircle, label: 'Interactions', path: '/interactions' },
    { icon: Shield, label: 'Dashboard', path: '/admin' },
  ];

  // Dữ liệu recipe stash
  const recipeStash = [
    { label: 'All', count: 142, path: '/recipes/all' },
    { label: 'Saved', count: 28, path: '/recipes/saved' },
    { label: 'Cooked', count: 56, path: '/recipes/cooked' },
    { label: 'Mine', count: 12, path: '/recipes/mine' },
    { label: 'Published', count: 8, path: '/recipes/published' },
    { label: 'Drafts', count: 1, path: '/recipes/drafts', hasBadge: true },
    { label: 'Imported', count: 7, path: '/recipes/imported' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm transition-all duration-300 ease-in-out z-30 ${
        isExpanded ? 'w-72' : 'w-20'
      }`}
    >
      {/* SECTION 1: TOP CONTROL (Toggle Button) */}
      <div className="h-14 flex items-center justify-end px-4 mt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-gray-50 hover:bg-green-50 hover:text-green-600 transition-all border border-gray-100"
          aria-label="Toggle Sidebar"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${!isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* SECTION 2: LOGO (Nhảy xuống dưới toggle) */}
      <div className={`px-4 mb-6 mt-2 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'flex justify-center'}`}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="min-w-[48px] h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-100 group-hover:scale-105 transition-transform">
            <ChefHat className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          {isExpanded && (
            <h1 className="text-xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              SmartCook
            </h1>
          )}
        </Link>
      </div>

      {/* SECTION 3: MAIN MENU */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${
                active 
                  ? 'bg-green-50 text-green-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              } ${!isExpanded ? 'justify-center px-0' : ''}`}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon 
                className={`w-5 h-5 flex-shrink-0 ${item.isPremium ? 'text-amber-500' : active ? 'text-green-600' : ''}`} 
                strokeWidth={2.5} 
              />
              {isExpanded && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold">{item.label}</span>
                  {item.isPremium && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                      PRO
                    </span>
                  )}
                </div>
              )}
            </Link>
            
          );
        })}

        {/* RECIPE STASH - Chỉ hiện khi đăng nhập và mở rộng */}
        {isLoggedIn && isExpanded && (
          <div className="mt-6 mb-2">
            <div className="px-4 mb-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Your Recipe Stash
              </h2>
            </div>
            <div className="space-y-0.5">
              {recipeStash.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200
                      ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}
                    `}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.count}
                      </span>
                      {item.hasBadge && (
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 4: LOGIN BUTTON */}
      {!isLoggedIn && (
        <div className="p-4 border-t border-gray-50">
          <Link
            to="/login"
            className={`flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-md shadow-orange-100 hover:shadow-lg hover:opacity-90 transition-all ${
              isExpanded ? 'py-4 px-4 w-full' : 'h-12 w-12 mx-auto'
            }`}
            title={!isExpanded ? "Log In / Sign Up" : undefined}
          >
            <User className="w-5 h-5" strokeWidth={2.5} />
            {isExpanded && <span>Sign In</span>}
          </Link>
        </div>
      )}
    </aside>
  );
}