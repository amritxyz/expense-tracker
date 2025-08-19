function Navbar() {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-2">
        {/* INFO: Left side of navbar */}
        <div id="left-nav flex items-center justify-between">
          <ul>
            <li>
              <a href="#" className="text-black hover:text-blue-500"> Home </a>
            </li>
          </ul>
        </div>

        {/* INFO: Right side of navbar */}
        <div id="right-nav">
          <ul className="flex gap-4">
            <li className="text-black hover:text-blue-500">
              <a href="#">Login</a>
            </li>
            <li>
              <a href="#" className="text-black hover:text-blue-500">Signup</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
