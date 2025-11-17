import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import AnimatedContent from "./AnimatedContent";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/equipment/departments/list"
        );
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.department
      );
      navigate("/"); // Redirect to dashboard after successful registration
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex h-full w-full">
        <main className="flex min-h-screen w-full flex-col lg:flex-row">
          {/* Left side - Image */}
          <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5">
            <AnimatedContent
              direction="horizontal"
              distance={200}
              duration={1.2}
              scale={1.1}
              threshold={0}
            >
              <div className="relative h-full w-full">
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: 'url("/auth-background.png")',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-blue-900/80"></div>
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-12 xl:p-16">
                    <div className="max-w-xl space-y-6">
                      <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                        Start Your Journey with AssetFlow
                      </h1>
                      <p className="text-lg xl:text-xl text-blue-100">
                        Join thousands of organizations managing their assets
                        efficiently with QR technology.
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-white text-2xl">
                            check_circle
                          </span>
                          <div>
                            <p className="text-white font-semibold">
                              Easy Setup
                            </p>
                            <p className="text-blue-100 text-sm">
                              Get started in minutes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-white text-2xl">
                            security
                          </span>
                          <div>
                            <p className="text-white font-semibold">
                              Secure Access
                            </p>
                            <p className="text-blue-100 text-sm">
                              Enterprise-grade security
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContent>
          </div>

          {/* Right side - Signup Form */}
          <div className="flex w-full lg:w-1/2 xl:w-2/5 flex-col items-center justify-center bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <div className="flex w-full max-w-md flex-col gap-6 sm:gap-8">
              {/* Header */}
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/10">
                    <svg
                      aria-hidden="true"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                      AssetFlow
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      QR Tag Manager
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                    Create Account
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Get started with AssetFlow and manage your assets
                    efficiently.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="w-full p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-r-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl mt-0.5">
                      error
                    </span>
                    <p className="text-sm text-red-700 dark:text-red-300 flex-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Signup Form */}
              <form
                className="flex w-full flex-col gap-4"
                onSubmit={handleSubmit}
              >
                {/* Name and Email in Grid for Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                      Full Name
                    </label>
                    <input
                      className="form-input w-full rounded-lg text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-primary h-11 sm:h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 text-sm sm:text-base transition-all duration-200"
                      placeholder="John Doe"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                      Email Address
                    </label>
                    <input
                      className="form-input w-full rounded-lg text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-primary h-11 sm:h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 text-sm sm:text-base transition-all duration-200"
                      placeholder="your.email@company.com"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Department Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    Department
                  </label>
                  <select
                    className="form-input w-full rounded-lg text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-primary h-11 sm:h-12 px-4 text-sm sm:text-base transition-all duration-200"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={loading || loadingDepartments}
                  >
                    <option value="">Select your department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password Fields in Grid for Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password Field */}
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        className="form-input w-full rounded-lg text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-primary h-11 sm:h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 pr-12 text-sm sm:text-base transition-all duration-200"
                        placeholder="Min. 6 characters"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        className="form-input w-full rounded-lg text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-primary h-11 sm:h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 pr-12 text-sm sm:text-base transition-all duration-200"
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={loading}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showConfirmPassword
                            ? "visibility_off"
                            : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex w-full flex-col gap-4 pt-2">
                  <button
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary h-11 sm:h-12 text-sm sm:text-base font-bold text-white shadow-md hover:shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">
                          progress_activity
                        </span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">
                          person_add
                        </span>
                        Create Account
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{" "}
                    <Link
                      className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                      to="/login"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>

              {/* Footer */}
              <footer className="w-full pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs sm:text-sm text-center text-slate-500 dark:text-slate-500">
                  © {new Date().getFullYear()} AssetFlow. All rights reserved.
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Signup;
