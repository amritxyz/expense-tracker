import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import * as icons from "../../assets/Icons.jsx";
import LogoutModal from "../../components/modals/LogoutModal.jsx";

export default function HorizontalNavbar() {
  const { isLogged, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (isLogged) {
      fetchUserProfile();
    }
  }, [isLogged]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        if (data.avatar) {
          const fullAvatarUrl = data.avatar.startsWith('http')
            ? data.avatar
            : `http://localhost:5000${data.avatar}`;
          setAvatar(fullAvatarUrl);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const getInitials = (name) =>
    name
      ? name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "ExT";

  // Only show full nav when logged in
  if (!isLogged) {
    return (
      <header className="sticky top-0 z-50 w-full h-16 flex items-center shadow-sm bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/#hero" className="flex items-center gap-2">
            <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
              <span className="text-white font-bold text-sm">ExT</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              ExpenseTracker
            </span>
          </Link>

          {/* Guest Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-md"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu (Guest) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12" strokeWidth={2} strokeLinecap="round" />
                  <line x1="4" x2="20" y1="6" y2="6" strokeWidth={2} strokeLinecap="round" />
                  <line x1="4" x2="20" y1="18" y2="18" strokeWidth={2} strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Guest Menu */}
        {mobileMenuOpen && !isLogged && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl">
              <div className="p-4 space-y-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium hover:bg-gray-100 rounded-lg">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }

  function showLocation() {
    if (location.pathname == "/dashboard")
      return "Dashboard"
    else if (location.pathname == "/dashboard/income")
      return "Income"
    else if (location.pathname == "/dashboard/expense")
      return "Expense"
    else if (location.pathname == "/profile")
      return "Profile"
    else
      return "Nil"
  }


  // Logged-in Menu Items (same as vertical navbar)
  const menuList = [
    { id: 1, name: "Dashboard", link: "/dashboard", icon: icons.dashboard_icon, className: "text-blue-500" },
    { id: 2, name: "Expense", link: "/dashboard/expense", icon: icons.expense_icon, className: "text-red-500" },
    { id: 3, name: "Income", link: "/dashboard/income", icon: icons.income_icon, className: "text-green-500" },
    { id: 4, name: "Profile", link: "/profile", icon: icons.profile_icon, className: "text-purple-400" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 flex items-center shadow-sm bg-blue-50 backdrop-blur-md border-b border-gray-100">
        <div className="w-[95%] mx-auto px-4 flex items-center justify-between">
          {/* Logo with User Avatar */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden border-2 border-white shadow-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user ? getInitials(user.user_name) : "ExT"}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-800 block leading-tight">
                {user ? user.user_name : "ExpenseTracker"}
              </span>
              <span className="text-xs text-gray-600 block">{showLocation()}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuList.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 group
                  ${isActive(item.link)
                    ? "bg-gradient-to-r from-blue-200 to-purple-200 shadow-purple-100 shadow-lg text-blue-800 group-hover:rotate-12"
                    : "text-gray-700 hover:bg-current/5"
                  }`}
              >
                <span className={`${item.className} text-xl transition duration-300 group-hover:scale-110`}>
                  {item.icon()}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="ml-2 flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 group"
            >
              <span className="text-xl transition duration-300 group-hover:scale-110">
                {icons.logout_icon?.() || "🚪"}
              </span>
              <span>Logout</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12" strokeWidth={2} strokeLinecap="round" />
                  <line x1="4" x2="20" y1="6" y2="6" strokeWidth={2} strokeLinecap="round" />
                  <line x1="4" x2="20" y1="18" y2="18" strokeWidth={2} strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu (Logged In) - Simplified with only links */}
      {mobileMenuOpen && isLogged && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 right-0 bg-white border-l border-b border-gray-200 shadow-xl rounded-bl-lg">
            <div className="p-3 space-y-1">
              {menuList.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group min-w-48
                    ${isActive(item.link)
                      ? "bg-gradient-to-r from-blue-200 to-purple-200 shadow-purple-100 shadow-lg text-blue-800"
                      : "text-gray-700 hover:bg-current/5"
                    }`}
                >
                  <span className={`${item.className} text-xl transition duration-300 group-hover:scale-110`}>
                    {item.icon()}
                  </span>
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsLogoutModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 group"
              >
                <span className="text-xl transition duration-300 group-hover:scale-110">
                  {icons.logout_icon?.() || "🚪"}
                </span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        itemName="Logout"
        itemType="session"
      />
    </>
  );
}
