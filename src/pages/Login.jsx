// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VALID_CREDENTIALS } from '../data/staticData';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = VALID_CREDENTIALS.find(
      cred => cred.username === username && cred.password === password
    );

    if (user) {
      // Successful login
      const userSession = {
        ...user,
        loginTime: new Date().toISOString(),
        sessionId: 'session_' + Date.now(),
        lastActivity: new Date().toISOString()
      };
      
      localStorage.setItem('policy_user', JSON.stringify(userSession));
      localStorage.setItem('isAuthenticated', 'true');
      setLoginAttempts(0);
      
      // Notify parent component
      onLogin(userSession);
      
      // Navigate to overview
      navigate('/overview');
    } else {
      // Failed login
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      
      if (attempts >= 3) {
        setError('Maximum login attempts reached. Please contact system administrator.');
        setTimeout(() => {
          setLoginAttempts(0);
          setError('');
        }, 30000); // Reset after 30 seconds
      } else {
        setError(`Invalid credentials. ${3 - attempts} attempts remaining.`);
      }
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    alert('For security reasons, please contact the system administrator at helpdesk@agriculture.gov.in or call 011-2338xxxx');
  };

  const handleQuickLogin = (userType) => {
    const user = VALID_CREDENTIALS.find(cred => cred.role.includes(userType));
    if (user) {
      setUsername(user.username);
      setPassword(user.password);
    }
  };

  // Check for existing session
  useEffect(() => {
    const userSession = localStorage.getItem('policy_user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userSession && isAuthenticated === 'true') {
      const session = JSON.parse(userSession);
      const sessionTime = new Date(session.loginTime);
      const currentTime = new Date();
      const hoursDiff = Math.abs(currentTime - sessionTime) / 36e5;
      
      // Auto-logout after 8 hours
      if (hoursDiff < 8) {
        onLogin(session);
        navigate('/overview');
      } else {
        localStorage.removeItem('policy_user');
        localStorage.removeItem('isAuthenticated');
      }
    }
  }, [navigate, onLogin]);

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
                  <p className="text-sm text-white/90 mt-1">Secure Login Portal</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Username / Employee ID
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072bc] focus:border-transparent transition-all"
                      placeholder="Enter your username"
                      required
                      disabled={isLoading || loginAttempts >= 3}
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
                      disabled={isLoading || loginAttempts >= 3}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-[#0072bc] focus:ring-[#0072bc] border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#0072bc] hover:text-[#00509e] font-medium"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || loginAttempts >= 3}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isLoading || loginAttempts >= 3
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#003366] to-[#0072bc] hover:from-[#002244] hover:to-[#00509e]'
                  } text-white shadow-md hover:shadow-lg`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </div>
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>

                {/* Security Notice */}
                <div className="text-center text-xs text-gray-500">
                  <p>⚠️ This system contains sensitive government data. Unauthorized access is prohibited. Your activity is being monitored and logged.</p>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2025 Ministry of Agriculture & Farmers Welfare, Government of India</p>
            <p className="mt-1">For technical support: helpdesk@agriculture.gov.in | Helpline: 011-2338xxxx</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="text-gray-400">v2.1.5</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Build: 2025.12.08</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Secure Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;