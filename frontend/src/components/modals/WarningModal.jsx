// /src/components/modals/WarningModal.jsx
import React from 'react';

export default function WarningModal({
  isOpen,
  onClose,
  onAddIncome,
  onContinueExpense,
  totalBudget,
  totalIncome,
  totalExpense,
  pendingExpense // New prop for pending expense data
}) {
  if (!isOpen) return null;

  // Calculate new totals if expense is added
  const newExpenseAmount = pendingExpense ? parseFloat(pendingExpense.amount) : 0;
  const newTotalExpense = totalExpense + newExpenseAmount;
  const newBudget = totalIncome - newTotalExpense;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl shadow-2xl w-full max-w-xl border border-red-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-800">Budget Alert!</h2>
              <p className="text-sm text-red-600">Financial warning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full p-2 transition-all duration-300 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-white/70 rounded-xl p-4 mb-4 border border-red-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Income</span>
              <span className="text-sm font-bold text-green-600">Rs {totalIncome}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Current Expenses</span>
              <span className="text-sm font-bold text-red-600">Rs {totalExpense}</span>
            </div>
            {pendingExpense && (
              <div className="flex justify-between items-center mb-2 pl-4 border-l-2 border-red-300">
                <span className="text-sm font-medium text-gray-600">+ New Expense</span>
                <span className="text-sm font-bold text-red-600">Rs {newExpenseAmount}</span>
              </div>
            )}
            <hr className="border-red-200 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">New Budget</span>
              <span className={`text-sm font-bold ${newBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rs {newBudget}
              </span>
            </div>
          </div>

          <p className="text-gray-700 font-medium text-center mb-2">
            Adding this expense will put you over budget.
          </p>
          <p className="text-gray-600 font-medium text-center text-sm">
            Would you like to add income or continue adding this expense?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 cursor-pointer border border-gray-300 shadow-sm hover:scale-102 group"
          >
            <span className='transition-all duration-300 group-hover:scale-110'>Cancel</span>
          </button>
          <button
            onClick={onAddIncome}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 cursor-pointer shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group hover:scale-102"
          >
            <svg className="w-5 h-5 transition-all duration-300 group-hover:scale-120" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Add Income
          </button>
          <button
            onClick={onContinueExpense}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 group hover:scale-102"
          >
            <svg className="w-5 h-5 transition-all duration-300 group-hover:scale-115" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
