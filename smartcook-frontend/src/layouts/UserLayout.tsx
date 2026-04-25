import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom"; 
import { X } from "lucide-react";
import UserSidebar from "./UserSidebar";
import Header from "./Header"; 
import Footer from "./Footer";
import { Toaster } from 'sonner';
import { socket } from "../socket";
import { useSocket } from "../hooks/useSocket"; 

const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
};

export default function UserLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("accessToken");
  });

  const [currentUser, setCurrentUser] = useState<any>(mockUser);

  // ==========================================
  // 1. useEffect SỐ 1: KIỂM TRA ĐĂNG NHẬP
  // ==========================================
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      
      setIsLoggedIn(!!token);
      
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (error) {
          setCurrentUser(mockUser);
        }
      } else {
        setCurrentUser(mockUser);
      }
    };
    
    checkAuthStatus();
    
    window.addEventListener('storage', checkAuthStatus);
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [location.pathname]);

  // ==========================================
  // 2. useEffect SỐ 2: BẢO MẬT SOCKET (Nằm ngang hàng)
  // ==========================================
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("accessToken");
      socket.auth = { token }; 
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn]);

  // GỌI HOOK HIỂN THỊ TOAST (Nằm ngang hàng)
  useSocket(currentUser?.id);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("temp_user_id"); 
    localStorage.removeItem("user"); 
    setIsLoggedIn(false);
    window.location.href = "/"; 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" richColors />
      <UserSidebar 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded} 
        isLoggedIn={isLoggedIn} 
      />

      <div className={`flex flex-col min-h-screen flex-1 transition-all duration-300 ease-in-out ${isExpanded ? "ml-72" : "ml-20"}`}>
        <Header 
          isLoggedIn={isLoggedIn} 
          currentUser={currentUser} 
          onOpenLoginModal={() => setShowLoginModal(true)} 
          onLogout={handleLogout} 
        />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        <Footer />
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setShowLoginModal(false)} 
          />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
              <p className="text-gray-500 mb-6">Log in to create and share your amazing recipes!</p>
              <Link
                to="/login"
                onClick={() => setShowLoginModal(false)}
                className="block w-full py-3.5 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:opacity-90 transition-all mb-4"
              >
                Go to Login Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}