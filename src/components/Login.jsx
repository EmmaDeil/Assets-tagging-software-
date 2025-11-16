import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnimatedContent from "./AnimatedContent";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/"); // Redirect to dashboard after successful login
    } catch (err) {
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
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
                      'url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8f&auto=format&fit=crop&w=1470&q=80")',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </AnimatedContent>
            </div>

            {/* Right side - Login Form */}
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
                      Log in to your account
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                      Welcome back! Please enter your details.
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

                {/* Login Form */}
                <form
                  className="flex w-full flex-col gap-6"
                  onSubmit={handleSubmit}
                >
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

                  {/* Password Field */}
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-slate-900 dark:text-slate-50 text-sm font-medium leading-normal pb-2">
                        Password
                      </p>
                      <div className="flex w-full flex-1 items-stretch rounded-lg group">
                        <input
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-slate-900 dark:text-slate-50 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3 pr-2 border-r-0 rounded-r-none text-base font-normal leading-normal"
                          placeholder="Enter your password"
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
                    <Link
                      className="text-sm font-medium leading-normal self-end text-primary hover:text-primary/80"
                      to="/forgot-password"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <div className="flex w-full flex-col gap-3 pt-2">
                    <button
                      className="flex items-center justify-center rounded-lg bg-primary h-12 text-base font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Log In"}
                    </button>
                    <p className="text-center text-sm font-normal text-slate-500 dark:text-slate-400">
                      Don't have an account?{" "}
                      <Link
                        className="font-medium text-primary hover:text-primary/80"
                        to="/signup"
                      >
                        Sign Up
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

export default Login;
