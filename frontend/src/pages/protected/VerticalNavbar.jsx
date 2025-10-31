import { Link, useLocation } from "react-router-dom";

export default function VerticalNavbar() {
  const menuList = [
    { id: 1, name: "Dashboard", link: "/dashboard" },
    { id: 2, name: "Expenses", link: "/dashboard/expenses" },
    { id: 3, name: "Income", link: "/dashboard/income" },
    { id: 4, name: "Profile", link: "/profile" }
  ];

  const location = useLocation();  // Use location object from `useLocation`

  return (
    <div className="flex flex-col h-screen p-4 text-black">
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
      <div className="flex flex-col gap-4">
        {menuList.map((value) => (
          <Link
            key={value.id}
            to={value.link}
            className={`text-lg hover:bg-current/10 px-4 py-2 rounded-lg transition duration-200 ${location.pathname === value.link ? 'bg-current/10' : ''}`}
          >
            {value.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
