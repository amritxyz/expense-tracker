function NavButton({ children, href, className = "", ...props }) {
  /* INFO: If the button's link is active then remains the background
   *       as darker variant #005a71
   */
  const isActive = window.location.pathname == href;

  return (
    <a
      href={href}
      className={`flex items-center justify-center px-4 py-2 text-[#ffffff] rounded hover:bg-[#005a71] transition
        ${isActive
          ? 'bg-[#005a71]'
          : 'bg-transparent hover:bg-[#005a71]'}
        ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

export default NavButton;
