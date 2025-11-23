// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

// Create the context
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: Check if token is expired or invalid
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return false; // no exp claim = assume valid (not recommended)
      return decoded.exp * 1000 < Date.now(); // exp is in seconds
    } catch (err) {
      console.warn('Invalid JWT format', err);
      return true;
    }
  };

  // Logout function (centralized)
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLogged(false);
    setError(null);
    // Optional: redirect
    // window.location.href = '/login';
  };

  // Check auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && !isTokenExpired(token)) {
      try {
        const decoded = jwtDecode(token);
        setUser({ email: decoded.email, id: decoded.id });
        setIsLogged(true);
      } catch (err) {
        console.error('Failed to decode token', err);
        logout();
      }
    } else {
      // Token missing or expired → clean up
      logout();
    }
    setLoading(false);
  }, []);

  // Axios Interceptor: Catch 401 globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('Unauthorized - logging out');
          logout();
          // Optional: redirect only if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=1';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      setUser({ email: decoded.email, id: decoded.id });
      setIsLogged(true);

      return { success: true, message: response.data.message || 'Login successful' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (user_name, email, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/register', {
        user_name,
        email,
        password,
      });
      return { success: true, message: response.data.message || 'Registered successfully' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Optional: Manual token validation (call from protected components if needed)
  const validateToken = () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      logout();
      return false;
    }
    return true;
  };

  const value = {
    user,
    isLogged,
    loading,
    error,
    login,
    register,
    logout,
    validateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};
