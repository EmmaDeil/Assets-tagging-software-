import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // const response = await axios.get("http://localhost:5000/api/auth/me");
          const response = await axios.get("https://assets-tagging-software-backend.onrender.com/api/auth/me");
          setUser(response.data.user);
        } catch (error) {
          console.error("Failed to load user:", error);
          // Token is invalid, clear it
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        // "http://localhost:5000/api/auth/login",
        "https://assets-tagging-software-backend.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (
    name,
    email,
    password,
    role = "User",
    department = ""
  ) => {
    try {
      const response = await axios.post(
        // "http://localhost:5000/api/auth/register",
        "https://assets-tagging-software-backend.onrender.com/api/auth/register",
        {
          name,
          email,
          password,
          role,
          department,
        }
      );

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      if (token) {
        // await axios.post("http://localhost:5000/api/auth/logout");
        await axios.post("https://assets-tagging-software-backend.onrender.com/api/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === "Administrator") return true;
    return user.permissions?.[permission] || false;
  };

  // Check if user has specific role
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
