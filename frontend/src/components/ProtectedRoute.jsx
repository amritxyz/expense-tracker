// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check for token in localStorage
  const token = localStorage.getItem('token');

  // If there's no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;  // Allow the protected route (children) to render if the token is present
}

export default ProtectedRoute;
