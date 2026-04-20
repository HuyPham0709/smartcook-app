import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Crown,
  Trophy,
  BarChart3,
  MessageCircle,
  ChefHat,
  ChevronLeft,
  User,
} from 'lucide-react';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Search, label: 'Search', path: '/' },
    { icon: Crown, label: 'Premium', path: '/premium', isPremium: true },
    { icon: Trophy, label: 'Challenges', path: '/challenges' },
    { icon: BarChart3, label: 'Stats', path: '/stats' },
    { icon: MessageCircle, label: 'Interactions', path: '/interactions' },
  ];

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
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-72' : 'w-20'
      }`}
    >
      {/* Top Section - Logo & Toggle */}
      <div className={`px-4 py-6 border-b border-gray-100 ${isExpanded ? '' : 'px-3'}`}>
        <div className="flex items-center justify-between">
          {isExpanded ? (
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md shadow-green-500/20">
                <ChefHat className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h1
                className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                SmartCook
              </h1>
            </Link>
          ) : (
            <Link to="/" className="flex items-center justify-center w-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md shadow-green-500/20">
                <ChefHat className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </Link>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-all ${
              isExpanded ? '' : 'absolute right-3 top-6'
            }`}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                isExpanded ? '' : 'rotate-180'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Menu */}
      <nav className={`px-3 py-4 space-y-1 ${isExpanded ? '' : 'px-2'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${active ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                ${isExpanded ? '' : 'justify-center px-0'}
              `}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon
                className={`${isExpanded ? 'w-5 h-5' : 'w-6 h-6'} ${
                  item.isPremium ? 'text-amber-500' : active ? 'text-green-600' : ''
                }`}
                strokeWidth={2.5}
              />
              {isExpanded && (
                <>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.isPremium && (
                    <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                      PRO
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Recipe Stash Section - Only visible when expanded */}
      {isExpanded && (
        <>
          <div className="my-4 px-6">
            <div className="h-px bg-gray-200"></div>
          </div>

          <div className="px-3 flex-1 overflow-y-auto">
            <div className="mb-2 px-3">
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
                      flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200
                      ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'}
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
        </>
      )}

      {/* Bottom Section - Login Button */}
      <div className={`p-4 border-t border-gray-100 ${isExpanded ? '' : 'p-3'}`}>
        {isExpanded ? (
          <Link
            to="/login"
            className="
              w-full flex items-center justify-center gap-2 px-4 py-3
              bg-gradient-to-r from-orange-500 to-orange-600
              text-white font-bold text-sm rounded-xl
              shadow-md shadow-orange-500/30
              transition-all duration-300
              hover:shadow-lg hover:shadow-orange-500/40
            "
          >
            <User className="w-4 h-4" strokeWidth={2.5} />
            <span>Log In / Sign Up</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="
              flex items-center justify-center p-3
              bg-gradient-to-r from-orange-500 to-orange-600
              text-white rounded-xl
              shadow-md shadow-orange-500/30
              transition-all duration-300
              hover:shadow-lg hover:shadow-orange-500/40
            "
            title="Log In / Sign Up"
          >
            <User className="w-5 h-5" strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </aside>
  );
}
