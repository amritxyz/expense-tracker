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
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-[100] backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-medium mb-3">{itemType}</h2>
        <hr className="border-gray-300 my-4" />

        <p className="text-gray-700 font-medium mb-6">
          Are you sure you want to <span className="font-bold">{itemName}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer border border-gray-300 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
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
