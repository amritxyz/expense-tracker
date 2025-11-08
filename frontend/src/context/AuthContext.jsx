// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the context
export const AuthContext = createContext();

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT (just to extract user data)
        setUser({ email: decoded.email, id: decoded.id });
        setIsLogged(true);
      } catch (error) {
        console.error('Invalid token', error);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      const token = response.data.token;  // Assuming we return the JWT in the response

      /* INFO: Save the token to localStorage */
      localStorage.setItem('token', token);

      /* INFO: Decode the token to extract user info (or we can store user details directly in the token) */
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT

      setUser({ email: decoded.email, id: decoded.id });

      setIsLogged(true);

      return { success: true, message: response.data.message };
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
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLogged(false);
  };

  // Value object for the context
  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    loading,
    setLoading,
    error,
    setError,
    isLogged,
    setIsLogged,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
