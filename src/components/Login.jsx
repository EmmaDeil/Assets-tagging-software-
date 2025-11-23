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
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900">
      {/* Left side - Image Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <AnimatedContent
          direction="horizontal"
          distance={200}
          duration={1.2}
          scale={1.1}
          threshold={0}
        >
          <div className="h-full relative" style={{ width: '5000px'}}>
            {/* Background Image */}
            <img
              src="/auth-background.png"
              alt="AssetFlow Background"
              className="absolute h-full py-12"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/85 to-blue-900/90"></div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 xl:p-16">
              <div className="max-w-lg space-y-6">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="material-symbols-outlined text-white text-2xl">
                    qr_code_scanner
                  </span>
                  <span className="text-white font-semibold">
                    AssetFlow QR Manager
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  Welcome Back to AssetFlow
                </h1>

                <p className="text-base lg:text-lg text-blue-50">
                  Manage your assets efficiently with our comprehensive QR tag
                  management system.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <span className="material-symbols-outlined text-white text-xl">
                      verified
                    </span>
                    <span className="text-white text-sm font-medium">
                      Secure
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <span className="material-symbols-outlined text-white text-xl">
                      speed
                    </span>
                    <span className="text-white text-sm font-medium">Fast</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <span className="material-symbols-outlined text-white text-xl">
                      devices
                    </span>
                    <span className="text-white text-sm font-medium">
                      Reliable
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <span className="material-symbols-outlined text-white text-xl">
                      cloud_done
                    </span>
                    <span className="text-white text-sm font-medium">
                      Cloud-based
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
              <span className="material-symbols-outlined text-white text-3xl">
                qr_code_scanner
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to your AssetFlow account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                  error
                </span>
                <p className="text-sm text-red-800 dark:text-red-200 flex-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                placeholder="you@company.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} AssetFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
