// /src/components/modals/DeleteModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm = null, // Remove the problematic default value
  itemName = "Logout",
  itemType = "Logout",
  isLoading = false
}) {
  if (!isOpen) return null;

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    } else {
      // Default logout behavior
      try {
        await logout();
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
    onClose(); // Close the modal after confirmation
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-medium mb-3">{itemType}</h2>
        <hr className="border-gray-300 my-4" />

        <p className="text-gray-700 mb-6">
          Are you sure you want to <span className="font-semibold">{itemName}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-60 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-t-2 border-white rounded-full animate-spin"></span>
                Loading...
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
