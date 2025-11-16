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
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex min-h-screen w-full items-stretch justify-center">
          <div className="flex w-full flex-1">
            {/* Left side - Image */}
            <div className="relative hidden w-0 flex-1 bg-gray-50 dark:bg-gray-900 lg:block">
              <AnimatedContent
                direction="horizontal"
                distance={200}
                duration={1.2}
                scale={1.1}
                threshold={0}
              >
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpfwD2_QgxdDD-w_yqI9rL-KXBTjMkJnIC0XbNf67G6kKHbqWRyRpr08-nCmg1VWJUmi2EjbO1lGGXDhTz1vN5riSTX-a8zB_6Bj8n59BKNg7s3BoDBIOQm91fvBSp8hB4aXcodxHs2zu5q8pfLMtcLSjbALCUFY3nw-1-_m3OLGxaYFaG6Ox8maGvGCkL35GtUdV0_MDn2ggaGWU0-UZMnp8sVebSrJV6fw7UCFwpI7QVb7ZmlUSZEAYpkY5Pf0U7plDtDmT80-A")',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </AnimatedContent>
            </div>

            {/* Right side - Signup Form */}
            <div className="flex w-full flex-1 flex-col items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="flex w-full max-w-md flex-col items-start gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                  <svg
                    aria-hidden="true"
                    className="h-10 w-10 text-primary"
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
                  <div className="flex flex-col gap-3">
                    <p className="text-slate-900 dark:text-slate-50 text-4xl font-black leading-tight tracking-[-0.033em]">
                      Create an account
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                      Sign up to get started with AssetFlow.
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Signup Form */}
                <form
                  className="flex w-full flex-col gap-6"
                  onSubmit={handleSubmit}
                >
                  {/* Name Field */}
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-slate-900 dark:text-slate-50 text-sm font-medium leading-normal pb-2">
                      Full Name
                    </p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-base font-normal leading-normal"
                      placeholder="Enter your full name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </label>

                  {/* Email Field */}
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-slate-900 dark:text-slate-50 text-sm font-medium leading-normal pb-2">
                      Email Address
                    </p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-base font-normal leading-normal"
                      placeholder="Enter your email address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </label>

                  {/* Department Field */}
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-slate-900 dark:text-slate-50 text-sm font-medium leading-normal pb-2">
                      Department
                    </p>
                    <select
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 p-4 text-base font-normal leading-normal"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={loading || loadingDepartments}
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Password Field */}
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-slate-900 dark:text-slate-50 text-sm font-medium leading-normal pb-2">
                      Password
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg group">
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3 pr-2 border-r-0 rounded-r-none text-base font-normal leading-normal"
                        placeholder="At least 6 characters"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <button
                        className="text-slate-400 dark:text-slate-500 flex border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center px-3 rounded-r-lg border-l-0 group-focus-within:ring-2 group-focus-within:ring-primary/50 group-focus-within:border-primary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </label>

                  {/* Confirm Password Field */}
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-slate-900 dark:text-slate-50 text-sm font-medium leading-normal pb-2">
                      Confirm Password
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg group">
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3 pr-2 border-r-0 rounded-r-none text-base font-normal leading-normal"
                        placeholder="Re-enter your password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <button
                        className="text-slate-400 dark:text-slate-500 flex border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center px-3 rounded-r-lg border-l-0 group-focus-within:ring-2 group-focus-within:ring-primary/50 group-focus-within:border-primary"
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={loading}
                      >
                        <span className="material-symbols-outlined">
                          {showConfirmPassword
                            ? "visibility_off"
                            : "visibility"}
                        </span>
                      </button>
                    </div>
                  </label>

                  {/* Submit Button */}
                  <div className="flex w-full flex-col gap-3 pt-2">
                    <button
                      className="flex items-center justify-center rounded-lg bg-primary h-12 text-base font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Sign Up"}
                    </button>
                    <p className="text-center text-sm font-normal text-slate-500 dark:text-slate-400">
                      Already have an account?{" "}
                      <Link
                        className="font-medium text-primary hover:text-primary/80"
                        to="/login"
                      >
                        Log In
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Footer */}
                <footer className="w-full pt-8 text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-600">
                    {new Date().getFullYear()} QR Tag Manager. All rights
                    reserved.
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Signup;
