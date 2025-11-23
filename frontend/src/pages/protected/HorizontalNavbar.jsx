import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import * as icons from "../../assets/Icons.jsx";
import LogoutModal from "../../components/modals/LogoutModal.jsx";

export default function HorizontalNavbar() {
  const { isLogged, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  // Logged-in Menu Items (same as vertical navbar)
  const menuList = [
    { id: 1, name: "Dashboard", link: "/dashboard", icon: icons.dashboard_icon, color: "text-blue-500" },
    { id: 2, name: "Expense", link: "/dashboard/expense", icon: icons.expense_icon, color: "text-red-500" },
    { id: 3, name: "Income", link: "/dashboard/income", icon: icons.income_icon, color: "text-green-500" },
    { id: 4, name: "Profile", link: "/profile", icon: icons.profile_icon, color: "text-purple-400" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 flex items-center shadow-sm bg-blue-50 backdrop-blur-md border-b border-gray-100">
        <div className="w-[90%] mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
              <span className="text-white font-bold text-sm">ExT</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              ExpenseTracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuList.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${isActive(item.link)
                    ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <span className={`${item.color} text-xl`}>{item.icon()}</span>
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="ml-4 flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
            >
              <span className="text-xl">{icons.logout_icon?.() || "Exit"}</span>
              <span>Logout</span>
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
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
      </header>

      {/* Mobile Menu (Logged In) */}
      {mobileMenuOpen && isLogged && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl">
            <div className="p-4 space-y-2">
              {menuList.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-medium transition
                    ${isActive(item.link)
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className={`${item.color} text-2xl`}>{item.icon()}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsLogoutModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 text-lg font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <span className="text-2xl">{icons.logout_icon?.() || "Exit"}</span>
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
