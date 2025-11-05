// /src/components/modals/DeleteModal.jsx
import React from 'react';

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
  itemType = "transaction",
  isLoading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-medium mb-3">Delete {itemType}</h2>
        <hr className="border-gray-300 my-4" />

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <span className="font-semibold">{itemName}</span>?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer border border-gray-300 shadow-sm bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-60 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-t-2 border-white rounded-full animate-spin"></span>
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
