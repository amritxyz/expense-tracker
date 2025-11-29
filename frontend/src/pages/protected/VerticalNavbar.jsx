import { Link, useLocation } from "react-router-dom";
import * as icons from "../../assets/Icons.jsx";
import LogoutModal from "../../components/modals/LogoutModal.jsx";
import LogoutButton from "../../components/buttons/LogoutButton.jsx";
import { useState, useEffect } from "react";

export default function VerticalNavbar() {
  const menuList = [
    { id: 1, name: "Dashboard", link: "/dashboard", icon: icons.dashboard_icon, className: "text-blue-500" },
    { id: 2, name: "Expense", link: "/dashboard/expense", icon: icons.expense_icon, className: "text-red-500" },
    { id: 3, name: "Income", link: "/dashboard/income", icon: icons.income_icon, className: "text-green-500" },
    { id: 4, name: "Profile", link: "/profile", icon: icons.profile_icon, className: "text-purple-400" },
  ];

  const location = useLocation();
  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        // Set avatar with full URL if it exists
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

  return (
    <div className="flex flex-col h-screen p-4 text-black bg-blue-50">
      {/* Logo Section - Replaced with User Avatar */}
      <div className="flex justify-center items-center gap-2 mb-9">
        <Link to="/profile" className="flex items-center 2xl:gap-2 group">
          <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-200">
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
          <span className="hidden 2xl:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            {user ? user.user_name.charAt(0).toUpperCase() + user.user_name.slice(1) : "ExpenseTracker"}
          </span>
        </Link>
      </div>

      <LogoutModal
        isOpen={isLogoutModelOpen}
        onClose={() => setIsLogoutModelOpen(false)}
        itemName="Logout"
        itemType="Logout"
      />

      {/* Menu List */}
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-4">
          {menuList.map((value) => (
            <Link
              key={value.id}
              to={value.link}
              className={`flex items-center gap-4 font-medium text-lg hover:bg-current/5 w-10 2xl:w-full px-2 py-2 2xl:px-4 2xl:py-2 rounded-lg transition duration-200 ${location.pathname === value.link ? 'bg-gradient-to-r from-blue-200 to-purple-200 shadow-purple-100 shadow-lg text-blue-800 group/rotate' : 'text-gray-700 group/icons '}`}
            >
              <span className={`${value.className} text-2xl 2xl:text-xl transition duration-300 group-hover/icons:scale-120 group-hover/rotate:rotate-12`}>
                {value.icon()}
              </span>
              {/* Text label, hidden for screens >= 2xl */}
              <span className="hidden 2xl:block">{value.name}</span>
            </Link>
          ))}
        </div>

        <LogoutButton onClick={() => setIsLogoutModelOpen(true)} />
      </div>
    </div>
  );
}
