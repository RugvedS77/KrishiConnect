// src/pages/FarmerLoginPage.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

const FarmerLoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Prevents reload

    // --- 1. Set FARMER auth flag ---
    localStorage.setItem("farmerAuth", "true");

    console.log("Simulating successful farmer login...");

    // --- 2. Navigate to FARMER dashboard ---
    navigate("/farmer/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* --- Left Column: Image Section --- */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1590682680695-49b964a40b00?auto=format&fit=crop&q=80')",
        }}
      >
        <div className="w-full h-full bg-black/40"></div>
      </div>

      {/* --- Right Column: Form Section --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Farmer Portal</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Please log in to your account.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  defaultValue="farmer@agri.com"
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-green-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password123"
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Log In
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600 mt-8">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup-farmer"
              className="font-medium text-green-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerLoginPage;
