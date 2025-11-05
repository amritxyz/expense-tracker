// /src/components/modals/EditModal.jsx
import React from 'react';

export default function EditModal({
  isOpen,
  onClose,
  title = "Edit Item",
  children
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-medium">{title}</p>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <hr className="text-gray-300 my-3" />
        {children}
      </div>
    </div>
  );
}
