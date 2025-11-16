import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { user, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="max-w-md p-8 text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to access this page. Required role:{" "}
            {requiredRole}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check for required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="max-w-md p-8 text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to access this page. Required permission:{" "}
            {requiredPermission}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
