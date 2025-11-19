// AuthProvider.js (Final, Production-Ready Version)
import React, { createContext, useContext, useState, useEffect } from "react";
// Import the base axios for configuring the global default header (optional, but good practice)
import axios from "axios"; 
// Import the custom instance for all API calls
import axiosInstance from "../config/axiosInstance"; 

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

// Configure axios defaults for both the base axios and the instance
 useEffect(() => {
 if (token) {
// Setting on base axios
 axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
       // Setting on instance (used for all calls in this file)
       axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`; 
 localStorage.setItem("token", token);
 } else {
 delete axios.defaults.headers.common["Authorization"];
       delete axiosInstance.defaults.headers.common["Authorization"];
 localStorage.removeItem("token");
 }
 }, [token]);

// Load user data on mount if token exists
 useEffect(() => {
 const loadUser = async () => {
 if (token) {
 try {
// **USE INSTANCE:** Path is relative to the baseURL set in axiosInstance.js
 const response = await axiosInstance.get("/auth/me"); 
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
// **USE INSTANCE:** Path is relative to the baseURL
 const response = await axiosInstance.post(
 "/auth/login",
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
// **USE INSTANCE:** Path is relative to the baseURL
 const response = await axiosInstance.post(
 "/auth/register",
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
// **USE INSTANCE:** Path is relative to the baseURL
 await axiosInstance.post("/auth/logout");
 }
 } catch (error) {
 console.error("Logout error:", error);
 } finally {
// Clear local state regardless of API call success
 setToken(null);
 setUser(null);
 localStorage.removeItem("token");
 delete axios.defaults.headers.common["Authorization"];
       delete axiosInstance.defaults.headers.common["Authorization"];
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