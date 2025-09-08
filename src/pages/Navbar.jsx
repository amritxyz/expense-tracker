import NavButton from "../components/Nav_button";
import { Link } from "react-router-dom";

function Navbar() {

  return (
    <>
      <div className="bg-[#4793cc] flex items-center justify-center py-2">
        <nav className="w-[95%] flex items-center justify-between">
          {/* INFO: Left side of navbar */}
          <div id="left-nav flex items-center justify-between">
            <Link to="/"><NavButton>Home</NavButton> </Link>
          </div>

          {/* INFO: Right side of navbar */}
          <div id="right-nav">
            <ul className="flex gap-4">
              <li className="text-[#ffffff]">
                <Link to="/login"> <NavButton>Login</NavButton> </ Link>
              </li>
              <li>
                <Link to="/signup"> <NavButton>Signup</NavButton> </ Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
