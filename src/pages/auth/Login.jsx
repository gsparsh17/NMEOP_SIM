import React, { useState } from "react";
import { Lock, Shield, Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = onLogin(username, password);
    
    if (result.success) {
      // Navigation is handled by parent component
    } else {
      setError("Invalid username or password");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#001a33] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Government Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src="/assets/ut.png" 
                alt="State Emblem of India" 
                className="w-20 h-20 mx-auto"
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#FF9933] text-white text-xs px-2 py-1 rounded">
                SECURE PORTAL
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            NMEO-OP Data Management System
          </h1>
          <p className="text-gray-300">
            Ministry of Agriculture & Farmers Welfare
          </p>
          <div className="mt-2 text-sm text-gray-400">
            Government of India
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#003366] to-[#00509e] text-white p-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Shield size={24} className="text-yellow-300" />
              <h2 className="text-xl font-bold">Secure Admin Login</h2>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              Restricted Access - Authorized Personnel Only
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">ID</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Security Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Security Notice
                </span>
              </div>
              <p className="text-xs text-blue-700">
                This system is for authorized Government personnel only. 
                All activities are monitored and logged.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#003366] to-[#00509e] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Login to Admin Portal"}
            </button>

            {/* Quick Login Hint */}
            <div className="text-center text-sm text-gray-600">
              <p>Test credentials:</p>
              <p className="text-xs text-gray-500 mt-1">
                Username: <code>policy_desk</code> | Password: <code>MoAFW@2025</code>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p>© 2025 Government of India. All rights reserved.</p>
              <p className="mt-1">
                For technical support, contact: support@nmeo-op.gov.in
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-white">256-bit Encryption</span>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-white">2FA Ready</span>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield size={16} className="text-purple-600" />
            </div>
            <span className="text-xs text-white">Audit Trail</span>
          </div>
        </div>
      </div>
    </div>
  );
}