// /src/components/buttons/LogoutButton.jsx
import React from 'react';
import * as icons from "../../assets/Icons.jsx"

export default function LogoutButton({ onClick, className = "" }) {
  return (
    <>
      <button
        onClick={onClick}
        className={`text-lg flex items-center justify-center gap-x-3 text-center bg-red-100 hover:bg-current/5 px-4 py-2 mb-6 rounded-lg transition duration-200 cursor-pointer`}
      >

        {icons.logout_icon()}

        Logout
      </button>
    </>
  );
}
