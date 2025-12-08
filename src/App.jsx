// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import ScenarioBuilder from "./pages/ScenerioBuilder";
import ImpactDashboard from "./pages/ImpactDashboard";
import Diagnostics from "./pages/Diagnostics";
import FarmerPayoutCalculator from "./pages/FarmerPayoutCalculator";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import AuditLogs from "./pages/admin/AuditLogs";
import DutyManagement from "./pages/admin/DutyManagement";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#003366] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check permission-based access
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Admin Layout Component
// Admin Layout Component with similar UI to MainApp
const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOP GOVERNMENT STRIP - Bilingual - Mobile Responsive */}
      <div className="bg-[#003366] text-white text-[10px] sm:text-xs py-1 px-2 sm:px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
          <div className="flex items-center flex-wrap gap-1 sm:gap-4">
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap">भारत सरकार</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap">GOVERNMENT OF INDIA</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap hidden sm:inline">कृषि एवं किसान कल्याण मंत्रालय</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap hidden sm:inline">Ministry of Agriculture & Farmers Welfare</a>
          </div>
          <div className="flex items-center flex-wrap gap-1 sm:gap-4">
            <a href="#main-content" className="hover:text-[#FF9933] transition-colors whitespace-nowrap text-[9px] sm:text-xs">Skip to Main</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <button
              onClick={logout}
              className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors text-[10px] sm:text-xs flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN HEADER WITH ACTUAL LOGOS - Mobile Responsive */}
      <header className="bg-gradient-to-r from-blue-50 to-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-2 sm:px-4">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center justify-between py-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[#003366] p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/assets/ut.png" 
                alt="State Emblem of India" 
                className="w-10 h-10 object-contain"
              />
              <span className="bg-[#138808] text-white text-[10px] px-1.5 py-0.5 rounded">v2.1.5</span>
            </div>
          </div>

          {/* Main Header Content */}
          <div className="hidden lg:flex items-center justify-between py-4">
            {/* Left Side: State Emblem & Portal Info */}
            <div className="flex items-center gap-6">
              {/* State Emblem Logo */}
              <div className="relative">
                <img 
                  src="/assets/ut.png" 
                  alt="State Emblem of India" 
                  className="w-20 h-20 object-contain drop-shadow-md"
                />
                <div className="absolute -bottom-1 -right-3 bg-[#FF9933] text-white text-[8px] px-1 py-0.5 rounded">
                  Official
                </div>
              </div>

              <div className="border-l-2 border-[#FF9933] pl-6">
                <h1 className="text-2xl font-bold text-[#003366] leading-tight">
                  National Mission on Edible Oils - Oil Palm
                  <span className="text-[#FF9933] ml-2">(NMEO-OP)</span>
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-[#138808]">Administration Panel</span> · 
                    <span className="hidden xl:inline"> Ministry of Agriculture & Farmers Welfare · Government of India</span>
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-1 hidden md:block">
                  System Administration & Configuration Management
                </div>
              </div>
            </div>

            {/* Right Side: User Info */}
            <div className="flex flex-col items-end">
              <div className="text-right">
                <div className="flex items-center gap-4">
                  {/* User Info */}
                  <div className="text-sm">
                    <div className="text-gray-600">Logged in as:</div>
                    <div className="font-semibold text-[#003366] capitalize">{user?.role}</div>
                    <div className="text-xs text-gray-500">
                      {user?.email} • {user?.last_login ? new Date(user.last_login).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'New session'}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
                  <div className="text-sm hidden md:block">
                    <div className="text-gray-600">Department:</div>
                    <div className="font-semibold text-[#003366]">{user?.department || 'Ministry of Agriculture'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header Content */}
          <div className="lg:hidden flex flex-col items-center py-3">
            <h1 className="text-lg font-bold text-[#003366] text-center">
              Admin Panel - DSS
            </h1>
            <p className="text-xs text-gray-600 text-center mt-1">
              Ministry of Agriculture & Farmers Welfare
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs text-gray-500">User: </span>
              <span className="text-xs font-semibold text-[#003366] capitalize">
                {user?.role}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* NATIONAL FLAG STRIP & SCHEMES - Mobile Responsive */}
      <div className="relative bg-gradient-to-r from-[#FF9933] via-white to-[#138808] py-1 sm:py-2">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#FF9933] rounded-full border border-black"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full border border-black"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#138808] rounded-full border border-black"></div>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-1">National Portal of India</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Flagship Initiatives:</span>
              <div className="flex gap-1 overflow-x-auto pb-1">
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Digital India
                </div>
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Make in India
                </div>
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Atmanirbhar
                </div>
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Swachh Bharat
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA WITH SIDEBAR - Mobile Responsive */}
      <div className="flex-1 flex">
        {/* Sidebar for Desktop */}
        <div className={`hidden lg:block sticky top-0 ${sidebarOpen ? 'w-64' : 'w-20'} bg-[#003366] text-white transition-all duration-300 border-r border-[#004578]`}>
          <div className="p-4 border-b border-[#004578]">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">Admin Panel</span>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-[#004578] p-2 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          </div>
          <nav className="py-4">
            <AdminSidebarLink to="/admin" icon="🏠" label="Dashboard" open={sidebarOpen} />
            <AdminSidebarLink to="/admin/users" icon="👥" label="User Management" open={sidebarOpen} />
            <AdminSidebarLink to="/admin/audit" icon="📊" label="Audit Logs" open={sidebarOpen} />
            <AdminSidebarLink to="/admin/duties" icon="💰" label="Custom Duties" open={sidebarOpen} />
            <AdminSidebarLink to="/admin/data" icon="📈" label="Data Management" open={sidebarOpen} />
            <AdminSidebarLink to="/admin/settings" icon="⚙️" label="System Settings" open={sidebarOpen} />
          </nav>
          {sidebarOpen && (
            <div className="p-4 border-t border-[#004578] mt-4">
              <div className="bg-[#004578] rounded-lg p-3">
                <div className="text-xs text-white/80 mb-1">Admin Session</div>
                <div className="text-sm font-medium">{user?.email}</div>
                <div className="text-xs text-white/60 mt-1">Role: {user?.role}</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 py-4 sm:py-6 bg-gradient-to-b from-gray-50 to-gray-100 pb-16 lg:pb-6">
          <div className="max-w-6xl mx-auto px-2 sm:px-4">
            {/* Admin Portal Introduction Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#003366] via-[#0072bc] to-[#9c27b0] text-white p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Administration Control Panel</h2>
                    <p className="text-xs sm:text-sm opacity-90 mt-1">
                      System Configuration & User Management
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/30 self-start">
                    <div className="text-[10px] sm:text-xs font-medium">Administrator Mode</div>
                    <div className="text-[9px] sm:text-xs opacity-80 capitalize">Role: {user?.role}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-5 bg-gradient-to-r from-purple-50 via-white to-blue-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="text-gray-700">
                    <span className="font-semibold text-[#003366]">Purpose:</span> Manage system users, configure duties, and monitor system activities.
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold text-[#003366]">Access Level:</span> Restricted to authorized administrators only.
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold text-[#003366]">Audit Trail:</span> All administrative actions are logged for security.
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-2 sm:p-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full animate-pulse mt-0.5"></div>
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold text-amber-800">Security Notice:</span>
                    <span className="text-amber-700 ml-1 sm:ml-2">
                      You are accessing sensitive administrative functions. All actions are monitored and logged.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Content */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* COMPREHENSIVE GOVERNMENT FOOTER - Mobile Responsive */}
      <footer className="bg-[#003366] text-white border-t-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* About Section */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">About NMEO-OP</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-1 sm:gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Mission Objectives
                </a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-1 sm:gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Implementation
                </a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-1 sm:gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Progress Reports
                </a></li>
              </ul>
            </div>

            {/* Ministry Links */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Ministry Links</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">About Ministry</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Schemes</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Citizen Charter</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="hidden sm:block">
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Policy Documents</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Statistics</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Data Downloads</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="hidden md:block">
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Help Desk</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Feedback</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="hidden lg:block">
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright & Information */}
          <div className="pt-4 sm:pt-6 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center flex-wrap gap-2 sm:gap-4 justify-center text-[10px] sm:text-xs">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Website Policies</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Help</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors hidden sm:inline">Accessibility</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors hidden sm:inline">Site Map</a>
              </div>
            </div>
            
            <div className="text-[10px] sm:text-xs text-gray-400 space-y-1">
              <p>Content Owned by Ministry of Agriculture & Farmers Welfare, Government of India</p>
              <p className="hidden sm:block">
                © 2025 Government of India. All Rights Reserved.
                <span className="mx-2">|</span>
                Best viewed in Chrome 80+, Firefox 75+
              </p>
              <p className="mt-1 sm:mt-2">
                <span className="font-medium text-gray-300">Last Updated:</span> 
                {' '}{new Date().toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric'
                })}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-2 hidden sm:block">
                Designed and Developed by National Informatics Centre, Government of India
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Admin Sidebar Link Component
const AdminSidebarLink = ({ to, icon, label, open }) => {
  const location = window.location.pathname;
  const isActive = location === to || location.startsWith(`${to}/`);
  
  return (
    <a
      href={to}
      className={`flex items-center p-3 mx-2 my-1 rounded-lg transition-colors ${
        isActive 
          ? 'bg-[#004578] text-white' 
          : 'text-white/80 hover:bg-[#004578] hover:text-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {open && (
        <>
          <span className="ml-3 text-sm font-medium">{label}</span>
          {isActive && (
            <span className="ml-auto w-2 h-2 bg-green-400 rounded-full"></span>
          )}
        </>
      )}
    </a>
  );
};

// Admin Nav Item Component for Header
const AdminNavItem = ({ to, label }) => {
  const location = window.location.pathname;
  const isActive = location === to || location.startsWith(`${to}/`);
  
  return (
    <a
      href={to}
      className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium transition-all duration-200 flex items-center justify-center ${
        isActive 
          ? "bg-gradient-to-r from-[#005b94] to-[#004578] text-white shadow-inner border-t-2 border-[#FF9933]" 
          : "text-white/90 hover:text-white hover:bg-[#0066a6]"
      }`}
    >
      {label}
    </a>
  );
};

// Admin Mobile Nav Item Component
const AdminMobileNavItem = ({ to, label, onClick }) => {
  const location = window.location.pathname;
  const isActive = location === to || location.startsWith(`${to}/`);
  
  return (
    <a
      href={to}
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center ${
        isActive 
          ? "bg-gradient-to-r from-[#005b94] to-[#004578] text-white" 
          : "text-white hover:bg-[#0066a6]"
      }`}
    >
      {label}
    </a>
  );
};
const NavLink = ({ to, icon, label, open }) => (
  <a
    href={to}
    className="flex items-center p-4 hover:bg-[#004578] transition-colors"
  >
    <span className="text-xl">{icon}</span>
    {open && <span className="ml-3">{label}</span>}
  </a>
);

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Main Application Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/overview" />} />
            <Route path="overview" element={<Overview />} />
            <Route path="scenario" element={<ScenarioBuilder />} />
            <Route path="impact" element={<ImpactDashboard />} />
            <Route path="data" element={<Diagnostics />} />
            <Route path="payout" element={<FarmerPayoutCalculator />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="audit" element={<AuditLogs />} />
                  <Route path="duties" element={<DutyManagement />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Main Application Component for authenticated users
function MainApp() {
  const { user, logout } = useAuth();
  const [activeScreen, setActiveScreen] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const screens = {
    overview: <Overview />,
    scenario: <ScenarioBuilder />,
    impact: <ImpactDashboard />,
    data: <Diagnostics />,
    payout: <FarmerPayoutCalculator />
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOP GOVERNMENT STRIP - Bilingual - Mobile Responsive */}
      <div className="bg-[#003366] text-white text-[10px] sm:text-xs py-1 px-2 sm:px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
          <div className="flex items-center flex-wrap gap-1 sm:gap-4">
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap">भारत सरकार</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap">GOVERNMENT OF INDIA</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap hidden sm:inline">कृषि एवं किसान कल्याण मंत्रालय</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap hidden sm:inline">Ministry of Agriculture & Farmers Welfare</a>
          </div>
          <div className="flex items-center flex-wrap gap-1 sm:gap-4">
            <a href="#main-content" className="hover:text-[#FF9933] transition-colors whitespace-nowrap text-[9px] sm:text-xs">Skip to Main</a>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <button
              onClick={logout}
              className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors text-[10px] sm:text-xs flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN HEADER WITH ACTUAL LOGOS - Mobile Responsive */}
      <header className="bg-gradient-to-r from-blue-50 to-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-2 sm:px-4">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center justify-between py-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[#003366] p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/assets/ut.png" 
                alt="State Emblem of India" 
                className="w-10 h-10 object-contain"
              />
              <span className="bg-[#138808] text-white text-[10px] px-1.5 py-0.5 rounded">v2.1.5</span>
            </div>
          </div>

          {/* Main Header Content */}
          <div className="hidden lg:flex items-center justify-between py-4">
            {/* Left Side: State Emblem & Portal Info */}
            <div className="flex items-center gap-6">
              {/* State Emblem Logo */}
              <div className="relative">
                <img 
                  src="/assets/ut.png" 
                  alt="State Emblem of India" 
                  className="w-20 h-20 object-contain drop-shadow-md"
                />
                <div className="absolute -bottom-1 -right-3 bg-[#FF9933] text-white text-[8px] px-1 py-0.5 rounded">
                  Official
                </div>
              </div>

              <div className="border-l-2 border-[#FF9933] pl-6">
                <h1 className="text-2xl font-bold text-[#003366] leading-tight">
                  National Mission on Edible Oils - Oil Palm
                  <span className="text-[#FF9933] ml-2">(NMEO-OP)</span>
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-[#138808]">Policy Decision Support System</span> · 
                    <span className="hidden xl:inline"> Ministry of Agriculture & Farmers Welfare · Government of India</span>
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-1 hidden md:block">
                  Tariff Impact Navigation System for Crude Palm Oil Policy Making
                </div>
              </div>
            </div>

            {/* Right Side: User Info */}
            <div className="flex flex-col items-end">
              <div className="text-right">
                <div className="flex items-center gap-4">
                  {/* User Info */}
                  <div className="text-sm">
                    <div className="text-gray-600">Logged in as:</div>
                    <div className="font-semibold text-[#003366] capitalize">{user?.role}</div>
                    <div className="text-xs text-gray-500">
                      {user?.email} • {user?.last_login ? new Date(user.last_login).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'New session'}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
                  <div className="text-sm hidden md:block">
                    <div className="text-gray-600">Department:</div>
                    <div className="font-semibold text-[#003366]">{user?.department || 'Ministry of Agriculture'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header Content */}
          <div className="lg:hidden flex flex-col items-center py-3">
            <h1 className="text-lg font-bold text-[#003366] text-center">
              PalmPolicy - DSS
            </h1>
            <p className="text-xs text-gray-600 text-center mt-1">
              Ministry of Agriculture & Farmers Welfare
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs text-gray-500">User: </span>
              <span className="text-xs font-semibold text-[#003366] capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="bg-[#0072bc] rounded-t-lg overflow-hidden shadow-md hidden lg:block">
            <div className="flex divide-x divide-[#005b94]">
              <NavItem 
                id="overview" 
                label="Policy Situation Room" 
                active={activeScreen === "overview"}
                onClick={setActiveScreen}
              />
              <NavItem 
                id="scenario" 
                label="Tariff Strategy Builder" 
                active={activeScreen === "scenario"}
                onClick={setActiveScreen}
              />
              <NavItem 
                id="impact" 
                label="NMEO-OP Alignment Tracker" 
                active={activeScreen === "impact"}
                onClick={setActiveScreen}
              />
              <NavItem 
                id="payout" 
                label="Farmers Payout Estimator" 
                active={activeScreen === "payout"}
                onClick={setActiveScreen}
              />
              <NavItem 
                id="data" 
                label="Data Resources" 
                active={activeScreen === "data"}
                onClick={setActiveScreen}
              />
            </div>
          </nav>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-[#0072bc] rounded-lg mt-2 shadow-lg">
              <div className="flex flex-col divide-y divide-[#005b94]">
                <MobileNavItem 
                  id="overview" 
                  label="Policy Situation Room" 
                  active={activeScreen === "overview"}
                  onClick={(id) => {
                    setActiveScreen(id);
                    setMobileMenuOpen(false);
                  }}
                />
                <MobileNavItem 
                  id="scenario" 
                  label="Tariff Strategy Builder" 
                  active={activeScreen === "scenario"}
                  onClick={(id) => {
                    setActiveScreen(id);
                    setMobileMenuOpen(false);
                  }}
                />
                <MobileNavItem 
                  id="impact" 
                  label="NMEO-OP Alignment Tracker" 
                  active={activeScreen === "impact"}
                  onClick={(id) => {
                    setActiveScreen(id);
                    setMobileMenuOpen(false);
                  }}
                />
                <MobileNavItem 
                  id="data" 
                  label="Data Resources" 
                  active={activeScreen === "data"}
                  onClick={(id) => {
                    setActiveScreen(id);
                    setMobileMenuOpen(false);
                  }}
                />
                <MobileNavItem 
                  id="payout" 
                  label="Farmers Payout Estimator" 
                  active={activeScreen === "payout"}
                  onClick={(id) => {
                    setActiveScreen(id);
                    setMobileMenuOpen(false);
                  }}
                />
                {/* Admin Link for Admin Users */}
                {user?.role === 'admin' && (
                  <MobileNavItem 
                    id="admin" 
                    label="Admin Dashboard" 
                    active={false}
                    onClick={() => {
                      window.location.href = '/admin';
                      setMobileMenuOpen(false);
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* NATIONAL FLAG STRIP & SCHEMES - Mobile Responsive */}
      <div className="relative bg-gradient-to-r from-[#FF9933] via-white to-[#138808] py-1 sm:py-2">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#FF9933] rounded-full border border-black"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full border border-black"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#138808] rounded-full border border-black"></div>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-1">National Portal of India</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Flagship Initiatives:</span>
              <div className="flex gap-1 overflow-x-auto pb-1">
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Digital India
                </div>
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Make in India
                </div>
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Atmanirbhar
                </div>
                <div className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Swachh Bharat
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA - Mobile Responsive */}
      <main id="main-content" className="flex-1 py-4 sm:py-6 bg-gradient-to-b from-gray-50 to-gray-100 pb-16 lg:pb-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Active Screen Content */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {screens[activeScreen]}
          </div>
          
          {/* Portal Introduction Card - Mobile Responsive */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-4 sm:mb-6 overflow-hidden mt-5">
            <div className="bg-gradient-to-r from-[#003366] via-[#0072bc] to-[#1e5c2a] text-white p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Policy Decision Support System</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    Crude Palm Oil Tariff Impact Navigation
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/30 self-start">
                  <div className="text-[10px] sm:text-xs font-medium">Secure Session</div>
                  <div className="text-[9px] sm:text-xs opacity-80 capitalize">Role: {user?.role}</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-5 bg-gradient-to-r from-blue-50 via-white to-green-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-gray-700">
                  <span className="font-semibold text-[#003366]">Purpose:</span> Real-time analysis of customs duty impacts on farmer incomes and consumer prices.
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold text-[#003366]">Framework:</span> Follows NMEO-OP policy framework and Ministry guidelines.
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold text-[#003366]">Data Sources:</span> UN Comtrade, MCX, NMEO-OP, DGCI.
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-2 sm:p-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full animate-pulse mt-0.5"></div>
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold text-amber-800">Disclaimer:</span>
                  <span className="text-amber-700 ml-1 sm:ml-2">
                    This tool supports policy decisions but does not replace official approval processes.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* COMPREHENSIVE GOVERNMENT FOOTER - Mobile Responsive */}
      <footer className="bg-[#003366] text-white border-t-4 border-[#FF9933] mt-16 lg:mt-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* About Section */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">About NMEO-OP</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-1 sm:gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Mission Objectives
                </a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-1 sm:gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Implementation
                </a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-1 sm:gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Progress Reports
                </a></li>
              </ul>
            </div>

            {/* Ministry Links */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Ministry Links</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">About Ministry</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Schemes</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Citizen Charter</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="hidden sm:block">
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Policy Documents</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Statistics</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Data Downloads</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="hidden md:block">
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Help Desk</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Feedback</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="hidden lg:block">
              <h4 className="font-bold text-[#FF9933] mb-2 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright & Information */}
          <div className="pt-4 sm:pt-6 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center flex-wrap gap-2 sm:gap-4 justify-center text-[10px] sm:text-xs">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Website Policies</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Help</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors hidden sm:inline">Accessibility</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors hidden sm:inline">Site Map</a>
              </div>
            </div>
            
            <div className="text-[10px] sm:text-xs text-gray-400 space-y-1">
              <p>Content Owned by Ministry of Agriculture & Farmers Welfare, Government of India</p>
              <p className="hidden sm:block">
                © 2025 Government of India. All Rights Reserved.
                <span className="mx-2">|</span>
                Best viewed in Chrome 80+, Firefox 75+
              </p>
              <p className="mt-1 sm:mt-2">
                <span className="font-medium text-gray-300">Last Updated:</span> 
                {' '}{new Date().toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric'
                })}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-2 hidden sm:block">
                Designed and Developed by National Informatics Centre, Government of India
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium transition-all duration-200 flex items-center justify-center ${
        active 
          ? "bg-gradient-to-r from-[#005b94] to-[#004578] text-white shadow-inner border-t-2 border-[#FF9933]" 
          : "text-white/90 hover:text-white hover:bg-[#0066a6]"
      }`}
    >
      {label}
    </button>
  );
}

function MobileNavItem({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center ${
        active 
          ? "bg-gradient-to-r from-[#005b94] to-[#004578] text-white" 
          : "text-white hover:bg-[#0066a6]"
      }`}
    >
      {label}
    </button>
  );
}

function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <a href="/" className="text-[#003366] hover:underline">Return to Dashboard</a>
      </div>
    </div>
  );
}

export default App;