import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Leaf } from "lucide-react";
import { useAuthStore } from '../authStore';
import { API_BASE_URL } from "../api/apiConfig";

// --- Reusable SVG Icons ---
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

// --- NEW: Background Leaves Animation Component ---
const BackgroundLeaves = () => {
    // We create an array to easily render multiple leaves
    const leaves = Array.from({ length: 15 }); 

    return (
        <>
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                {leaves.map((_, i) => {
                    const style = {
                        left: `${Math.random() * 100}vw`,
                        animationDuration: `${Math.random() * 5 + 10}s`, // Duration between 10s and 15s
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: Math.random() * 0.5 + 0.3, // Opacity between 0.3 and 0.8
                    };
                    return (
                        <div key={i} className="leaf-container" style={style}>
                            <Leaf className="w-6 h-6 text-green-300" />
                        </div>
                    );
                })}
            </div>
            <style>{`
                .leaf-container {
                    position: absolute;
                    top: -10%;
                    animation: fall linear infinite;
                }
                @keyframes fall {
                    0% {
                        transform: translateY(0vh) rotateZ(0deg);
                    }
                    100% {
                        transform: translateY(110vh) rotateZ(360deg);
                    }
                }
            `}</style>
        </>
    );
};


const FarmerLoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithToken, isLoading } = useAuthStore((state) => ({
    login: state.login,
    loginWithToken: state.loginWithToken,
    isLoading: state.loading,
  }));
  
  const [email, setEmail] = useState("suyog@gmail.com");
  const [password, setPassword] = useState("suyog123");
  const [userRole, setuserRole] = useState(null)
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { role } = await login(email, password, userRole);
      if (role === 'farmer') {
        console.log("Successful farmer login. Navigating to dashboard.");
        navigate("/farmer", { replace: true });
      } else {
        setError("This account does not have farmer permissions.");
        useAuthStore.getState().logout(); 
      }
    } catch (err) {
      setError(err.message);
      console.error("Login failed:", err.message);
    }
  };

  // --- NEW: Google Login Logic ---
    const handleGoogleLogin = () => {
    // Add '?role=farmer' to the URL to tell the backend what kind of user this is.
    const backendUrl = `${API_BASE_URL}/api/auth/login/google?role=farmer`;
    window.open(backendUrl, "oauth-login", "width=500,height=600");
  };

    useEffect(() => {
        // This function will listen for the message sent from the pop-up
        const handleAuthMessage = (event) => {
            // Security: Only accept messages from your backend's origin
            // if (event.origin !== "http://localhost:8000") return;

            const { token } = event.data;
            if (token) {
                // Use our new store function to process the token
                const user = loginWithToken(token);
                
                // Check the role, just like in your email login
                if (user && user.role === 'farmer') {
                    console.log("Successful Google login. Navigating to dashboard.");
                    navigate("/farmer/os/dashboard", { replace: true });
                } else {
                    setError("This Google account is not registered as a farmer.");
                    useAuthStore.getState().logout(); // Log them out if the role is wrong
                }
            }
        };

        window.addEventListener("message", handleAuthMessage);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener("message", handleAuthMessage);
        };
    }, [loginWithToken, navigate]); // Dependencies for the effect
    // ----------------------------

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-600 to-gray-900">
      <BackgroundLeaves />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12 border border-white/20">
          
          <div className="text-center mb-6">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-800">KrishiConnect</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Farmer Portal Login
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/0 text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button type="button" className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
              <MicrosoftIcon />
              <span>Microsoft</span>
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-8">
            Don't have an account?{" "}
            <Link to="/signup-farmer" className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerLoginPage;

