import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const HeroSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to dashboard if already logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="bg-blue-50 h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: Clean White Content */}
            <div className="lg:w-1/2 space-y-6 text-gray-800">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                <span>✨</span>
                Smarter Budgeting, Zero Stress
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Master Your Finances in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  One Place
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                Easily track your spending, set budgets, and reach your savings goals – all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30">
                  Start Free Trial
                </button>
                <button className="bg-white text-gray-700 font-medium py-3 px-8 rounded-xl transition duration-300 border border-gray-300 hover:bg-gray-50">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Demo
                  </span>
                </button>
              </div>

              <div className="pt-6 flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {/* <span>Bank-grade encryption</span> */}
                  <span>OpenSource, free-software</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z" /></svg>
                  <span>No ads / pop-ups.</span>
                  {/* <span>Syncs across all devices</span> */}
                </div>
              </div>
            </div>

            {/* Right: Minimal Dashboard (Updated Colors) */}
            <div className="lg:w-1/2 w-full max-w-2xl">
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                {/* Dashboard Top Bar */}
                <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm font-semibold">ExpenseTracker</div>
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">S</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-5 bg-gray-50">
                  {/* Balance Card */}
                  <div className="border border-gray-300 rounded-2xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <p className="text-gray-600 text-sm font-medium">Available Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">$3,247.89</p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-red-50 to-yellow-50">
                      <p className="text-gray-600 text-sm font-medium">Spent This Month</p>
                      <p className="text-lg font-bold text-red-600 mt-1">-$512.30</p>
                    </div>
                    <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-green-50 to-teal-50">
                      <p className="text-gray-600 text-sm font-medium">Budget Left</p>
                      <p className="text-lg font-bold text-green-600 mt-1">68%</p>
                    </div>
                  </div>

                  {/* Chart Card */}
                  <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-end justify-between h-20 gap-2 mb-3">
                      {[70, 45, 90, 60, 30, 80].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-tr from-purple-500 to-purple-600"
                          style={{
                            height: `${h}%`,
                            backgroundColor: '#4B4B4B',
                          }}
                        ></div>
                      ))}
                    </div>
                    <p className="text-gray-600 text-xs text-center font-medium">Weekly Spending Trend</p>
                  </div>

                  {/* Transactions */}
                  <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-gray-50 to-white">
                    <p className="text-gray-900 font-semibold mb-3">Recent Transactions</p>
                    <div className="space-y-3">
                      {[
                        { name: 'Amazon', amount: '-$24.99', category: 'Shopping', color: 'text-red-600' },
                        { name: 'Salary Deposit', amount: '+$3,200.00', category: 'Income', color: 'text-green-600' },
                        { name: 'Electric Bill', amount: '-$89.50', category: 'Utilities', color: 'text-red-600' },
                      ].map((tx, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0">
                          <div>
                            <p className="font-medium text-gray-900">{tx.name}</p>
                            <p className="text-xs text-gray-500">{tx.category}</p>
                          </div>
                          <span className={`font-semibold ${tx.color}`}>
                            {tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      < Footer />
    </>
  );
};

export default HeroSection;
