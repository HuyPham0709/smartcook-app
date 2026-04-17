import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, Home, Plus, User, Search, Settings, Shield } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--green-medium)' }}>SmartCook</h1>
            </Link>
            
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

            <button 
              className="px-6 py-2 rounded-full text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--orange)' }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
