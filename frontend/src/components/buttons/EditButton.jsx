// /src/components/buttons/EditButton.jsx
import React from 'react';

export default function EditButton({ onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`font-semibold text-green-600 opacity-0 group-hover:opacity-100 duration-200 hover:text-green-500 hover:shadow-md hover:bg-gray-100 px-2 py-2 rounded-2xl transition-all cursor-pointer ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path strokeDasharray={56} strokeDashoffset={56} d="M3 21l2 -6l11 -11c1 -1 3 -1 4 0c1 1 1 3 0 4l-11 11l-6 2">
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="56;0"></animate>
          </path>
          <path strokeDasharray={8} strokeDashoffset={8} d="M15 5l4 4">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"></animate>
          </path>
          <path strokeDasharray={6} strokeDashoffset={6} strokeWidth={1} d="M6 15l3 3">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"></animate>
          </path>
        </g>
      </svg>
    </button>
  );
}
