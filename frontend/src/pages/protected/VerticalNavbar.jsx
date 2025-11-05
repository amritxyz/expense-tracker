import { Link, useLocation, useNavigate } from "react-router-dom";
import * as icons from "../../assets/Icons.jsx"
import LogoutModal from "../../components/modals/LogoutModal.jsx"
import LogoutButton from "../../components/buttons/LogoutButton.jsx"
import { useState } from "react";

export default function VerticalNavbar() {
  const menuList = [
    { id: 1, name: "Dashboard", link: "/dashboard", icon: icons.dashboard_icon },
    { id: 2, name: "Expense", link: "/dashboard/expense", icon: icons.expense_icon },
    { id: 3, name: "Income", link: "/dashboard/income", icon: icons.income_icon },
    { id: 4, name: "Profile", link: "/profile", icon: icons.profile_icon },
  ];

  const location = useLocation();  // Use location object from `useLocation`
  const navigate = useNavigate();

  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen p-4 text-black bg-blue-50">
      {/* Logo Section */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
            <span className="text-white font-bold text-sm">ExT</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            ExpenseTracker
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
              className={`flex items-center gap-4 text-lg hover:bg-current/5 px-4 py-2 rounded-lg transition duration-200 ${location.pathname === value.link ? 'bg-current/10 shadow-lg hover:bg-current/10 shadow-current/10' : ''}`}
            >
              <span className="">
                {value.icon()}
              </span>
              {value.name}
            </Link>
          ))}
        </div>

        <LogoutButton onClick={() => setIsLogoutModelOpen(true)} />
      </div>
    </div>
  );
}
