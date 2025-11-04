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
          className={`text-lg flex items-center justify-center gap-x-3 text-center bg-red-100 hover:bg-current/5 px-4 py-2 mb-6 rounded-lg transition duration-200 cursor-pointer`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 25 25">
            <path fill="currentColor" d="M11.578 2.5a2.25 2.25 0 0 0-2.25 2.25v1.878q.18.122.342.282l1.158 1.159V4.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v15.5a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-3.319l-1.158 1.16q-.16.16-.342.28v1.879a2.25 2.25 0 0 0 2.25 2.25h6a2.25 2.25 0 0 0 2.25-2.25V4.75a2.25 2.25 0 0 0-2.25-2.25z"></path>
            <path fill="currentColor" d="M3.578 12.5c0 .226.1.428.258.566l3.961 3.964a.75.75 0 1 0 1.061-1.06L6.14 13.25h5.938a.75.75 0 0 0 0-1.5H6.14l2.718-2.72a.75.75 0 0 0-1.06-1.06l-3.964 3.966a.75.75 0 0 0-.256.564"></path>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
