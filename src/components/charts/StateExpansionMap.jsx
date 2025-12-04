// components/charts/StateExpansionMap.jsx
import React from "react";
import { stateWiseData } from "../data/staticData";

export default function StateExpansionMap({ selectedState, onStateClick }) {
  const states = [
    { id: "AP", name: "Andhra Pradesh", x: 350, y: 250 },
    { id: "TS", name: "Telangana", x: 300, y: 230 },
    { id: "TN", name: "Tamil Nadu", x: 280, y: 350 },
    { id: "OD", name: "Odisha", x: 420, y: 220 },
    { id: "KA", name: "Karnataka", x: 280, y: 280 },
    { id: "KL", name: "Kerala", x: 250, y: 320 },
    { id: "GJ", name: "Gujarat", x: 200, y: 200 },
    { id: "CG", name: "Chhattisgarh", x: 380, y: 240 },
    { id: "GA", name: "Goa", x: 250, y: 300 }
  ];

  const getStateColor = (coveragePercentage) => {
    if (coveragePercentage >= 50) return "bg-green-500";
    if (coveragePercentage >= 30) return "bg-yellow-500";
    if (coveragePercentage >= 10) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStateSize = (areaCovered) => {
    const maxArea = 185000; // Andhra Pradesh has highest coverage
    const minSize = 30;
    const maxSize = 80;
    return minSize + (areaCovered / maxArea) * (maxSize - minSize);
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Simplified India Map Outline */}
        <svg width="500" height="400" viewBox="0 0 500 400" className="opacity-20">
          <path d="M300,200 Q350,180 400,200 Q450,220 480,250 Q500,300 450,350 Q400,380 350,350 Q300,320 250,300 Q200,280 150,300 Q100,320 100,250 Q120,200 180,180 Q220,150 280,160 Z" 
                fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
        </svg>
      </div>

      {states.map(state => {
        const stateData = stateWiseData[state.name];
        if (!stateData) return null;
        
        const size = getStateSize(stateData.areaCovered);
        const color = getStateColor(stateData.coveragePercentage);
        const isSelected = selectedState === state.name;
        
        return (
          <div
            key={state.id}
            className={`absolute cursor-pointer transition-all duration-300 ${
              isSelected ? 'z-20 scale-110' : 'z-10 hover:scale-105'
            }`}
            style={{ left: `${state.x}px`, top: `${state.y}px` }}
            onClick={() => onStateClick(state.name)}
            title={`${state.name}: ${stateData.areaCovered.toLocaleString()} ha covered (${stateData.coveragePercentage}%)`}
          >
            <div className="relative">
              <div 
                className={`rounded-full ${color} border-2 ${
                  isSelected ? 'border-blue-600 shadow-lg' : 'border-white'
                } transition-all duration-300`}
                style={{ width: `${size}px`, height: `${size}px` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {stateData.coveragePercentage}%
                  </span>
                </div>
              </div>
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium whitespace-nowrap ${
                isSelected ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {state.name.split(' ')[0]}
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-2">Coverage Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">≥ 50% (High)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-gray-600">30-49% (Medium)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-xs text-gray-600">10-29% (Low)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">＜ 10% (Very Low)</span>
        </div>
      </div>
    </div>
  );
}