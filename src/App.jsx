import React, { useState } from "react";
import Overview from "./pages/Overview";
import ScenarioBuilder from "./pages/ScenerioBuilder";
import ImpactDashboard from "./pages/ImpactDashboard";
import Diagnostics from "./pages/Diagnostics";

export default function App() {
  const [activeScreen, setActiveScreen] = useState("overview");

  const screens = {
    overview: <Overview />,
    scenario: <ScenarioBuilder />,
    impact: <ImpactDashboard />,
    diagnostics: <Diagnostics />,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOP GOVERNMENT STRIP - Bilingual */}
      <div className="bg-[#003366] text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#FF9933] transition-colors">भारत सरकार</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors">GOVERNMENT OF INDIA</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors">कृषि एवं किसान कल्याण मंत्रालय</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors">Ministry of Agriculture & Farmers Welfare</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#main-content" className="hover:text-[#FF9933] transition-colors">Skip to Main Content</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors">Sitemap</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#FF9933] transition-colors">Contact</a>
          </div>
        </div>
        
      </div>
      {/* Accessibility Bar */}
          <div className="bg-[#f8f9fa] py-2 px-4 text-right text-xs border-b border-gray-100">
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-600">Accessibility Options:</span>
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">A-</button>
              <button className="px-3 py-1 bg-[#003366] text-white rounded hover:bg-[#002244] transition-colors">A</button>
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">A+</button>
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors ml-2">Screen Reader</button>
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">High Contrast</button>
              <button className="px-3 py-1 bg-[#FF9933] hover:bg-[#e6892a] text-white rounded ml-2 transition-colors">English</button>
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">हिंदी</button>
            </div>
          </div>

      {/* MAIN HEADER WITH ACTUAL LOGOS */}
      <header className="bg-gradient-to-r from-blue-50 to-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-4">
          

          {/* Main Header Content */}
          <div className="flex items-center justify-between py-4">
            {/* Left Side: State Emblem & Portal Info */}
            <div className="flex items-center gap-6">
              {/* State Emblem Logo */}
              <div className="relative">
                <img 
                  src="/assets/ut.png" 
                  alt="State Emblem of India" 
                  className="w-20 h-20 object-contain drop-shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#FF9933] text-white text-[8px] px-1 py-0.5 rounded">
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
                    Ministry of Agriculture & Farmers Welfare · Government of India
                  </p>
                  <span className="bg-[#138808] text-white text-xs px-2 py-1 rounded">v2.1.5</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tariff Impact Navigation System for Crude Palm Oil Policy Making
                </div>
              </div>
            </div>

            {/* Right Side: Government Logos */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-3 mb-3">
                {/* Logo Strip */}
                <div className="">
                  <img 
                    src="/assets/image0012A74.png" 
                    alt="150 Years of Service" 
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="">
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
                <div className="">
                  <img 
                    src="/assets/g20-logo-png_seeklogo-469210.png" 
                    alt="G20 Presidency" 
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="">
                  <img 
                    src="/assets/awg-Photoroom.png" 
                    alt="Agriculture Working Group" 
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <div className="text-gray-600">Oil Palm Year:</div>
                    <div className="font-semibold text-[#003366]">November 2024 - October 2025</div>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div className="text-sm">
                    <div className="text-gray-600">Last Updated:</div>
                    <div className="font-semibold text-[#003366]">
                      {new Date().toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="bg-[#0072bc] rounded-t-lg overflow-hidden shadow-md">
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
                label="Mission Alignment Tracker" 
                active={activeScreen === "impact"}
                onClick={setActiveScreen}
              />
              <NavItem 
                id="diagnostics" 
                label="Data Control Room" 
                active={activeScreen === "diagnostics"}
                onClick={setActiveScreen}
              />
            </div>
          </nav>
        </div>
      </header>

      {/* NATIONAL FLAG STRIP & SCHEMES */}
      <div className="relative bg-gradient-to-r from-[#FF9933] via-white to-[#138808] py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FF9933] rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full border"></div>
                <div className="w-3 h-3 bg-[#138808] rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700 ml-2">National Portal of India</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Flagship Initiatives:</span>
              <div className="flex gap-2">
                <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                  Digital India
                </div>
                <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                  Make in India
                </div>
                <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                  Atmanirbhar Bharat
                </div>
                <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-[#003366] border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                  Swachh Bharat
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="flex-1 py-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          {/* Portal Introduction Card */}
          {/* <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-[#003366] via-[#0072bc] to-[#1e5c2a] text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Policy Decision Support System for Crude Palm Oil</h2>
                  <p className="text-sm opacity-90 mt-1">
                    Tariff Impact Navigation System under NMEO-OP Mission · For Official Use Only
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                  <div className="text-xs font-medium">Secure Session</div>
                  <div className="text-xs opacity-80">Authenticated</div>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-gradient-to-r from-blue-50 via-white to-green-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-[#003366]">Purpose:</span> Real-time analysis of customs duty impacts on farmer incomes, 
                  government subsidy burden, and consumer prices.
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-[#003366]">Framework:</span> All simulations follow NMEO-OP policy framework and 
                  Ministry of Agriculture guidelines.
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-[#003366]">Data Sources:</span> UN Comtrade, MCX, NMEO-OP Reports, RBI, CACP.
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                <div className="text-sm">
                  <span className="font-semibold text-amber-800">Disclaimer:</span>
                  <span className="text-amber-700 ml-2">
                    This tool supports policy decisions but does not replace official approval processes. 
                    All recommendations are advisory in nature.
                  </span>
                </div>
              </div>
            </div>
          </div> */}
          
          {/* Active Screen Content */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {screens[activeScreen]}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden mt-5">
            <div className="bg-gradient-to-r from-[#003366] via-[#0072bc] to-[#1e5c2a] text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Policy Decision Support System for Crude Palm Oil</h2>
                  <p className="text-sm opacity-90 mt-1">
                    Tariff Impact Navigation System under NMEO-OP Mission · For Official Use Only
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                  <div className="text-xs font-medium">Secure Session</div>
                  <div className="text-xs opacity-80">Authenticated</div>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-gradient-to-r from-blue-50 via-white to-green-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-[#003366]">Purpose:</span> Real-time analysis of customs duty impacts on farmer incomes, 
                  government subsidy burden, and consumer prices.
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-[#003366]">Framework:</span> All simulations follow NMEO-OP policy framework and 
                  Ministry of Agriculture guidelines.
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-[#003366]">Data Sources:</span> UN Comtrade, MCX, NMEO-OP Reports, RBI, CACP.
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                <div className="text-sm">
                  <span className="font-semibold text-amber-800">Disclaimer:</span>
                  <span className="text-amber-700 ml-2">
                    This tool supports policy decisions but does not replace official approval processes. 
                    All recommendations are advisory in nature.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      

      {/* COMPREHENSIVE GOVERNMENT FOOTER */}
      <footer className="bg-[#003366] text-white border-t-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-4 text-sm uppercase tracking-wider">About NMEO-OP</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Mission Objectives
                </a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Implementation Strategy
                </a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Progress Reports
                </a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                  Success Stories
                </a></li>
              </ul>
            </div>

            {/* Ministry Links */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-4 text-sm uppercase tracking-wider">Ministry Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">About Ministry</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Schemes & Programs</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Acts & Rules</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Citizen Charter</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Annual Reports</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Policy Documents</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Research Papers</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Statistics</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Data Downloads</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Help Desk</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Contact Directory</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Feedback</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Grievance Redressal</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-[#FF9933] mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Disclaimer</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Copyright Policy</a></li>
                <li><a href="#" className="hover:text-[#FF9933] transition-colors">Hyperlinking Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Official Partner Logos */}
          {/* <div className="py-6 border-t border-gray-700 border-b">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-300 mb-4">In collaboration with:</div>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 p-2 shadow-md">
                    <div className="text-xs font-bold text-[#003366]">NIC</div>
                  </div>
                  <div className="text-xs text-gray-300">National Informatics Centre</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#138808] rounded-lg flex items-center justify-center mx-auto mb-2 p-2 shadow-md">
                    <div className="text-xs font-bold text-white">DI</div>
                  </div>
                  <div className="text-xs text-gray-300">Digital India</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#FF9933] rounded-lg flex items-center justify-center mx-auto mb-2 p-2 shadow-md">
                    <div className="text-xs font-bold text-white">MII</div>
                  </div>
                  <div className="text-xs text-gray-300">Make in India</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0072bc] rounded-lg flex items-center justify-center mx-auto mb-2 p-2 shadow-md">
                    <div className="text-xs font-bold text-white">GOI</div>
                  </div>
                  <div className="text-xs text-gray-300">Government of India</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#1e5c2a] rounded-lg flex items-center justify-center mx-auto mb-2 p-2 shadow-md">
                    <div className="text-xs font-bold text-white">MOA</div>
                  </div>
                  <div className="text-xs text-gray-300">Ministry of Agriculture</div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Copyright & Information */}
          <div className="pt-6 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-4 text-xs">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Website Policies</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Help</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Accessibility Statement</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Site Map</a>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <p>Content Owned, Maintained and Updated by Ministry of Agriculture & Farmers Welfare, Government of India</p>
              <p>
                © 2025 Government of India. All Rights Reserved. 
                <span className="mx-2">|</span>
                This site is best viewed in Chrome 80+, Firefox 75+, Safari 5.1+ with 1366 x 768 Resolution
              </p>
              <p className="mt-2">
                <span className="font-medium text-gray-300">Last Reviewed and Updated:</span> 
                {' '}{new Date().toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} IST
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Designed and Developed by National Informatics Centre, 
                Ministry of Electronics & Information Technology, Government of India
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ id, label, active, onClick, icon }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
        active 
          ? "bg-gradient-to-r from-[#005b94] to-[#004578] text-white shadow-inner border-t-2 border-[#FF9933]" 
          : "text-white/90 hover:text-white hover:bg-[#0066a6]"
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      {label}
    </button>
  );
}