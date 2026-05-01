import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, loading } = useAuth();

  // ✅ wait for auth initialization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ if no user → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ role-based redirect (FIXED PATHS)
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/member/dashboard" replace />;
};

export default Home;
