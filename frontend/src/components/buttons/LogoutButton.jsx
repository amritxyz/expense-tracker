// /src/components/buttons/LogoutButton.jsx
import React from 'react';
import * as icons from "../../assets/Icons.jsx"

export default function LogoutButton({ onClick }) {
  return (
    <>
      <button
        onClick={onClick}
        className={`w-10 2xl:w-full px-2 py-2 2xl:px-4 2xl:py-3 mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2`}
      >



        <span className={`text-2xl 2xl:text-xl`}>
          {icons.logout_icon()}
        </span>

        <span className="hidden 2xl:block">Logout</span>
      </button>
    </>
  );
}
