import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const HeroSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <Navbar />

      {/* Main Hero - grows as needed, never overlaps footer */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-7xl mx-auto">

          {/* Left: Text Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100 cursor-default group/star">
              <span className='transition duration-300 group-hover/star:rotate-12 group-hover/star:scale-120'>✨</span> Smarter Budgeting, Zero Stress
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Master Your Finances in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                One Place
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
              Easily track your spending, set budgets, and reach your savings goals – all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button onClick={() => navigate("/signup")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30">
                Start Free Trial
              </button>
              <button className="bg-white text-gray-700 font-medium py-3.5 px-8 rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 group/demo">
                <svg className="w-5 h-5 transition duration-300 group-hover/demo:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-8 text-sm text-gray-600 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>OpenSource, free-software</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z" />
                </svg>
                <span>No ads / pop-ups.</span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview - scales nicely */}
          <div className="flex justify-center cursor-default">
            <div className="w-full max-w-lg lg:max-w-2xl">
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
                {/* Top Bar */}
                <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm font-semibold">ExpenseTracker</div>
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold">S</span>
                  </div>
                </div>

                {/* Dashboard Body */}
                <div className="p-6 space-y-5 bg-gray-50">
                  <div className="border border-gray-300 rounded-2xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <p className="text-gray-600 text-sm font-medium">Available Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">$3,247.89</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-red-50 to-yellow-50">
                      <p className="text-gray-600 text-sm">Spent This Month</p>
                      <p className="text-lg font-bold text-red-600">-$512.30</p>
                    </div>
                    <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-green-50 to-teal-50">
                      <p className="text-gray-600 text-sm">Budget Left</p>
                      <p className="text-lg font-bold text-green-600">68%</p>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-end justify-between h-20 gap-2 mb-3">
                      {[70, 45, 90, 60, 30, 80].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-600 to-purple-500 rounded-t transition duration-300 hover:scale-105"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-xs text-center font-medium">Weekly Spending Trend</p>
                  </div>

                  <div className="border border-gray-300 rounded-2xl p-4 bg-white">
                    <p className="text-gray-900 font-semibold mb-3">Recent Transactions</p>
                    <div className="space-y-3">
                      {[
                        { name: 'Amazon', amount: '-$24.99', category: 'Shopping', color: 'text-red-600' },
                        { name: 'Salary Deposit', amount: '+$3,200.00', category: 'Income', color: 'text-green-600' },
                        { name: 'Electric Bill', amount: '-$89.50', category: 'Utilities', color: 'text-red-600' },
                      ].map((tx, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                          <div>
                            <p className="font-medium text-gray-900">{tx.name}</p>
                            <p className="text-xs text-gray-500">{tx.category}</p>
                          </div>
                          <span className={`font-semibold ${tx.color}`}>{tx.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer is always pushed to bottom or stays at natural flow */}
      <Footer />
    </div>
  );
};

export default HeroSection;
