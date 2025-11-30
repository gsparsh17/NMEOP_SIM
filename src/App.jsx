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
    <div className="min-h-screen bg-white flex flex-col">
      {/* GOVERNMENT HEADER */}
      <header className="bg-white border-b-4 border-[#1e5c2a] pb-2 fixed w-full z-50 shadow-md shadow-black/50">
        <div className="mx-auto">
          {/* National Emblem Strip */}
          <div className="bg-[#1e5c2a] text-white py-1 px-4 text-xs">
            🇮🇳 Government of India · Ministry of Agriculture & Farmers Welfare
          </div>
          
          {/* Main Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1e5c2a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                NMEO
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  National Mission on Edible Oils - Oil Palm
                </h1>
                <p className="text-sm text-gray-600">
                  Policy Decision Support System
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500">Oil Year</div>
              <div className="font-semibold text-gray-800">Nov 2024 - Oct 2025</div>
            </div>
          </div>

          {/* TOP NAVIGATION */}
          <nav className="border-t border-gray-200">
            <div className="flex space-x-8 px-4 mx-auto justify-center">
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

      {/* MAIN CONTENT */}
      <main className="flex-1 py-48">
        {screens[activeScreen]}
      </main>

      {/* GOVERNMENT FOOTER */}
      <footer className="bg-[#1e5c2a] text-white py-4 border-t-4 border-[#ff9933]">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>National Mission on Edible Oils - Oil Palm (NMEO-OP) · Ministry of Agriculture & Farmers Welfare</p>
          <p className="text-xs opacity-80 mt-1">
            This decision support system helps optimize customs duty policies to balance farmer income protection and consumer affordability
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
        active 
          ? "border-[#ff9933] text-[#1e5c2a] font-semibold" 
          : "border-transparent text-gray-600 hover:text-[#1e5c2a] hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}