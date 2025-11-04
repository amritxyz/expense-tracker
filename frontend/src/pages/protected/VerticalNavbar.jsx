import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function VerticalNavbar() {
  const menuList = [
    { id: 1, name: "Dashboard", link: "/dashboard" },
    { id: 2, name: "Expense", link: "/dashboard/expense" },
    { id: 3, name: "Income", link: "/dashboard/income" },
    { id: 4, name: "Profile", link: "/profile" }
  ];

  const location = useLocation();  // Use location object from `useLocation`
  const { logout } = useAuth();
  const navigate = useNavigate();

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

      {/* Menu List */}
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-4">
          {menuList.map((value) => (
            <Link
              key={value.id}
              to={value.link}
              className={`text-lg hover:bg-current/5 px-4 py-2 rounded-lg transition duration-200 ${location.pathname === value.link ? 'bg-current/10 shadow-lg hover:bg-current/10 shadow-current/10' : ''}`}
            >
              {value.name}
            </Link>
          ))}
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className={`text-lg  text-center bg-red-100 hover:bg-current/5 px-4 py-2 mb-6 rounded-lg transition duration-200 cursor-pointer`}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
