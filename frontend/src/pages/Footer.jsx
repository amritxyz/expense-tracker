export default function Footer() {
  return (
    <>
      <footer id="footer" className="py-12 bg-gray-900 text-gray-300 w-[100%] flex flex-col items-center justify-center">
        <div className="w-95/100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          </div>
          <div className="w-[100%] flex md-flex-row justify-between items-center">
            <p className="text-sm">© 2025 ExpenseTracker. All rights reserved.</p>
            <ul className="space-y-2 text-sm flex gap-5">
              <li>
                <a href="#footer" className="hover-text-white">Terms of Service</a>
              </li>
              <li>
                <a href="#footer" className="hover-text-white">Privacy Policy</a>
              </li>
              <li>
                <a href="#footer" className="hover-text-white">Cookie Policy</a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href='#footer' className="hover:text-white ">Facebook
              </a>
              <a href='#footer' className="hover:text-white">Twitter
              </a>
              <a href='#footer' className="hover:text-white">Instagram
              </a>
              <a href='#footer' className="hover:text-white">LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
