import { useNavigate } from "react-router-dom";

export default function Warning({ data }) {
  const { totalBudget, totalIncome, totalExpense } = data;
  const navigate = useNavigate();

  return (
    <>
      {totalBudget < 0 && (
        <div className="w-full flex items-center justify-center mt-6">
          <div className="w-[90%] bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    Budget Alert!
                  </h3>
                  <p className="text-red-700">
                    Your expenses (Rs {totalExpense}) exceed your income (Rs {totalIncome}) by Rs {Math.abs(totalBudget)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/expense")}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                Review Expenses
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
