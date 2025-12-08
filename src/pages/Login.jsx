// Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(null);
  
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check for lockout
  useEffect(() => {
    const storedAttempts = localStorage.getItem("loginAttempts");
    const lockTime = localStorage.getItem("lockTime");
    
    if (storedAttempts) {
      const attempts = parseInt(storedAttempts);
      setLoginAttempts(attempts);
      
      if (attempts >= 50 && lockTime) {
        const lockEnd = new Date(lockTime);
        const now = new Date();
        
        if (now < lockEnd) {
          setIsLocked(true);
          setLockTime(lockEnd);
          
          // Calculate remaining minutes
          const remaining = Math.ceil((lockEnd - now) / 60000);
          const interval = setInterval(() => {
            const now = new Date();
            if (now >= lockEnd) {
              setIsLocked(false);
              setLoginAttempts(0);
              localStorage.removeItem("loginAttempts");
              localStorage.removeItem("lockTime");
              clearInterval(interval);
            }
          }, 60000);
          
          return () => clearInterval(interval);
        } else {
          // Lock expired
          localStorage.removeItem("loginAttempts");
          localStorage.removeItem("lockTime");
        }
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (isLocked) {
      setError("Account is temporarily locked. Please try again later.");
      return;
    }
    
    if (loginAttempts >= 5) {
      // Lock account for 15 minutes
      const lockEnd = new Date(Date.now() + 15 * 60 * 1000);
      localStorage.setItem("lockTime", lockEnd.toISOString());
      setIsLocked(true);
      setLockTime(lockEnd);
      setError("Too many failed attempts. Account locked for 15 minutes.");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Reset login attempts on successful login
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("lockTime");
        
        // Check user role and redirect accordingly
        if (result.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);
        localStorage.setItem("loginAttempts", attempts.toString());
        
        if (attempts >= 3) {
          setError(`Invalid credentials. ${5 - attempts} attempts remaining before lockout.`);
        } else {
          setError("Invalid email or password");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("For security reasons, please contact the system administrator at helpdesk@agriculture.gov.in");
  };

  const handleQuickDemo = (role) => {
    if (role === "admin") {
      setEmail("admin@cpo.com");
      setPassword("Admin@123");
    } else if (role === "analyst") {
      setEmail("analyst@cpo.com");
      setPassword("Analyst@123");
    } else {
      setEmail("user@cpo.com");
      setPassword("User@123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Government Header Strip */}
      <div className="bg-[#003366] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/ut.png" 
              alt="State Emblem" 
              className="w-8 h-8"
            />
            <div>
              <div className="text-sm font-semibold">Government of India</div>
              <div className="text-xs opacity-90">Ministry of Agriculture & Farmers Welfare</div>
            </div>
          </div>
          <div className="text-xs">
            <span className="bg-green-600 px-2 py-1 rounded">Secure Portal</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#0072bc] p-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Policy Situation Room</h1>
                  <p className="text-sm text-white/90 mt-1">Secure Authentication Portal</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {isLocked && lockTime && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="text-red-700 font-medium">Account Temporarily Locked</span>
                      <p className="text-red-600 text-sm mt-1">
                        Too many failed attempts. Try again after {Math.ceil((lockTime - new Date()) / 60000)} minutes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && !isLocked && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                  {loginAttempts > 0 && (
                    <p className="text-red-600 text-xs mt-1">
                      Attempts: {loginAttempts}/5
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Address
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072bc] focus:border-transparent transition-all"
                      placeholder="Enter your official email"
                      required
                      disabled={isLocked || loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072bc] focus:border-transparent transition-all pr-12"
                      placeholder="Enter your password"
                      required
                      disabled={isLocked || loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      disabled={isLocked}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-end my-0">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#0072bc] hover:text-[#00509e] font-medium"
                    disabled={isLocked || loading}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLocked || loading || authLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isLocked || loading || authLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#003366] to-[#0072bc] hover:from-[#002244] hover:to-[#00509e]'
                  } text-white shadow-md hover:shadow-lg`}
                >
                  {loading || authLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {authLoading ? 'Checking Session...' : 'Authenticating...'}
                    </div>
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    New user?{' '}
                    <Link to="/register" className="text-[#0072bc] hover:underline font-medium">
                      Request Access
                    </Link>
                  </p>
                </div>

                {/* Security Notice */}
                <div className="text-center text-xs text-gray-500">
                  <p>⚠️ This system contains sensitive government data. Unauthorized access is prohibited. All activities are monitored and logged.</p>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2025 Ministry of Agriculture & Farmers Welfare, Government of India</p>
            <p className="mt-1">For technical support: helpdesk@agriculture.gov.in | Helpline: 011-2338xxxx</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;