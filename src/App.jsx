// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import ScenarioBuilder from "./pages/ScenerioBuilder";
import ImpactDashboard from "./pages/ImpactDashboard";
import Diagnostics from "./pages/Diagnostics";
import FarmerPayoutCalculator from "./pages/FarmerPayoutCalculator";

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeScreen, setActiveScreen] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  const screens = {
    overview: <Overview />,
    scenario: <ScenarioBuilder />,
    impact: <ImpactDashboard />,
    data: <Diagnostics />,
    payout: <FarmerPayoutCalculator />
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const userSession = localStorage.getItem('policy_user');
      const authStatus = localStorage.getItem('isAuthenticated');
      
      if (userSession && authStatus === 'true') {
        try {
          const session = JSON.parse(userSession);
          const sessionTime = new Date(session.loginTime);
          const currentTime = new Date();
          const hoursDiff = Math.abs(currentTime - sessionTime) / 36e5;
          
          if (hoursDiff < 8) { 
            setUser(session);
            setIsAuthenticated(true);
            const timeoutHours = 8 - hoursDiff;
            const timeoutMs = timeoutHours * 60 * 60 * 1000;
            
            if (sessionTimeout) clearTimeout(sessionTimeout);
            const timeout = setTimeout(() => {
              handleLogout();
            }, timeoutMs);
            
            setSessionTimeout(timeout);
          } else {
            handleLogout();
          }
        } catch (error) {
          handleLogout();
        }
      }
    };
    
    checkAuth();
    return () => {
      if (sessionTimeout) clearTimeout(sessionTimeout);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    if (sessionTimeout) clearTimeout(sessionTimeout);
    const timeout = setTimeout(() => {
      handleLogout();
    }, 8 * 60 * 60 * 1000);
    setSessionTimeout(timeout);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('policy_user');
    localStorage.removeItem('isAuthenticated');
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    // Optional: Log logout to server
    console.log('User logged out');
  };

  // Auto-refresh session on user activity
  useEffect(() => {
    const handleUserActivity = () => {
      if (user) {
        const updatedUser = {
          ...user,
          lastActivity: new Date().toISOString()
        };
        localStorage.setItem('policy_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    
    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
    };
  }, [user]);

  if (!isAuthenticated && window.location.pathname === '/') {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
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
              <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap hidden sm:inline">Sitemap</a>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <a href="#" className="hover:text-[#FF9933] transition-colors whitespace-nowrap hidden sm:inline">Contact</a>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <button
                onClick={handleLogout}
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

              {/* Right Side: Government Logos */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3 mb-3">
                  {/* Logo Strip */}
                  <div className="hidden xl:block">
                    <img 
                      src="/assets/image0012A74.png" 
                      alt="150 Years of Service" 
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <div className="hidden xl:block">
                    <img 
                      src="/assets/modi-Photoroom.png" 
                      alt="Honorable Prime Minister" 
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <div className="">
                    <img 
                      src="/assets/615olGBufWL-Photoroom.png" 
                      alt="Swachh Bharat Mission" 
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <div className="hidden lg:block">
                    <img 
                      src="/assets/g20-logo-png_seeklogo-469210.png" 
                      alt="G20 Presidency" 
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="text-sm">
                      <div className="text-gray-600">Logged in as:</div>
                      <div className="font-semibold text-[#003366]">{user?.role}</div>
                      <div className="text-xs text-gray-500">
                        {user?.department} • {new Date(user?.loginTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
                    <div className="text-sm hidden md:block">
                      <div className="text-gray-600">Oil Palm Year:</div>
                      <div className="font-semibold text-[#003366]">Nov 2025 - Oct 2026</div>
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
                <span className="text-xs text-gray-500">Last Updated: </span>
                <span className="text-xs font-semibold text-[#003366]">
                  {new Date().toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short'
                  })}
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
                  {/* Mobile Logout */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout ({user?.username})
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Navigation Bar (Bottom) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0072bc] shadow-lg z-40 border-t border-[#005b94]">
              <div className="flex">
                <MobileBottomNavItem 
                  id="overview" 
                  label="Overview" 
                  active={activeScreen === "overview"}
                  onClick={setActiveScreen}
                />
                <MobileBottomNavItem 
                  id="scenario" 
                  label="Builder" 
                  active={activeScreen === "scenario"}
                  onClick={setActiveScreen}
                />
                <MobileBottomNavItem 
                  id="impact" 
                  label="Tracker" 
                  active={activeScreen === "impact"}
                  onClick={setActiveScreen}
                />
                <MobileBottomNavItem 
                  id="data" 
                  label="Data Resources" 
                  active={activeScreen === "data"}
                  onClick={setActiveScreen}
                />
                <MobileBottomNavItem 
                  id="payout" 
                  label="Payout" 
                  active={activeScreen === "payout"}
                  onClick={setActiveScreen}
                />
              </div>
            </nav>
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
                    <div className="text-[9px] sm:text-xs opacity-80">User: {user?.username}</div>
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
    </Router>
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

function MobileBottomNavItem({ id, label, active, onClick, icon }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex-1 px-2 py-3 text-center transition-all duration-200 ${
        active 
          ? "bg-gradient-to-t from-[#005b94] to-[#004578] text-white" 
          : "text-white/90 hover:text-white hover:bg-[#0066a6]"
      }`}
    >
      <div className="text-lg">{icon}</div>
      <div className="text-[10px] mt-0.5">{label}</div>
    </button>
  );
}