// src/pages/FarmerLoginPage.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
// We need the Leaf icon for the logo
import { Mail, Lock, Leaf } from "lucide-react"; 

// --- Reusable SVG Icons for Social Login ---
// (These are simple placeholders so you don't need new libraries)
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.94H12V14.28H17.96C17.67 15.63 17.03 16.8 16.14 17.48V20.2H19.83C21.66 18.57 22.56 15.69 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.45 22.04 19.28 20.2L16.14 17.48C15.15 18.14 13.67 18.57 12 18.57C9.31 18.57 6.99 16.81 6.09 14.39H2.38V17.21C4.18 20.79 7.8 23 12 23Z" fill="#34A853"/>
    <path d="M6.09 14.39C5.83 13.68 5.69 12.92 5.69 12.14C5.69 11.36 5.83 10.6 6.09 9.89V7.07H2.38C1.5 8.7 1 10.36 1 12.14C1 13.92 1.5 15.58 2.38 17.21L6.09 14.39Z" fill="#FBBC05"/>
    <path d="M12 5.43C13.43 5.43 14.67 5.9 15.6 6.78L18.42 4.14C16.63 2.52 14.47 1.5 12 1.5C7.8 1.5 4.18 3.71 2.38 7.07L6.09 9.89C6.99 7.47 9.31 5.43 12 5.43Z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.7208 1.49805H1.6708V10.548H10.7208V1.49805Z" fill="#F25022"/>
    <path d="M21.3292 1.49805H12.2792V10.548H21.3292V1.49805Z" fill="#7FBA00"/>
    <path d="M10.7208 12.0498H1.6708V21.0998H10.7208V12.0498Z" fill="#00A4EF"/>
    <path d="M21.3292 12.0498H12.2792V21.0998H21.3292V12.0498Z" fill="#FFB900"/>
  </svg>
);


const FarmerLoginPage = () => {
  const navigate = useNavigate();

  // --- Logic is unchanged (sets farmerAuth, navigates to /farmer) ---
  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("farmerAuth", "true"); // Farmer-specific auth
    console.log("Simulating successful farmer login...");
    navigate("/farmer", { replace: true }); // Farmer-specific navigation
  };

  return (
    // --- Full Screen Centering Container with a LIGHT BLUE Gradient "Shade" ---
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-100"
    >
      {/* --- Centered Login Card --- */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center justify-center space-x-2">
            {/* Blue leaf icon */}
            <Leaf className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">Agri-Connector</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Farmer Portal Login
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back!
          </p>
        </div>

        {/* --- Form (Logic Unchanged) --- */}
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
                defaultValue="farmer@agri.com" // Farmer-specific default
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm" // Blue focus
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
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors" // Blue links
              >
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
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm" // Blue focus
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/30" // Blue button
          >
            Log In
          </button>
        </form>

        {/* --- Social Login Placeholder --- */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            <MicrosoftIcon />
            <span>Microsoft</span>
          </button>
        </div>
        {/* --- End Social Login --- */}

        {/* --- Sign Up Link --- */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup-farmer" // Farmer-specific signup
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors" // Blue link
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default FarmerLoginPage;