import { Link } from "react-router-dom";
import "./styles/index.css";

export default function Navbar() {

  return (
    <>
      <div className="flex items-center justify-center py-1">
        <nav className="w-[75%] flex items-center justify-between">

          {/* INFO: Left side of navbar */}
          <div id="left-nav">
            <Link to="/">🛤️ Expense Tracker</Link>
          </div>

          {/* INFO: Right side of navbar */}
          <div id="right-nav">
            <ul className="flex gap-4">
              <li className="text-[#ffffff]">
                <button id="login_button" className="flex items-center justify-center py-1 rounded-4xl transition hover:text-blue-500">
                  <Link to="/login" className="text-black hover:text-blue-500 py-2 px-1 "> Log in </ Link>
                </button>
              </li>
              <li>
                <button id="login_button" className="flex items-center justify-center py-1 rounded-4xl transition">
                  <Link to="/signup" className="text-white bg-black py-2 px-4 rounded-4xl"> Signup </ Link>
                </button>
              </li>
            </ul>
          </div>

        </nav >
      </div >
    </>
  );
};
