// components/charts/StateTargetsTable.jsx
import React from "react";
import { nmeoOPDetailedData } from "../../data/staticData";

export default function StateTargetsTable({ selectedState }) {
  const allStates = Object.keys(nmeoOPDetailedData.stateExpansionTargets);
  const statesToShow = selectedState === "All-India" ? allStates : [selectedState];
  
  const formatNumber = (num) => {
    if (!num && num !== 0) return "-";
    return num.toLocaleString();
  };

  const calculateCoveragePercentage = (state) => {
    const data = nmeoOPDetailedData.stateExpansionTargets[state];
    if (!data) return 0;
    return ((data.currentArea / data.potentialArea) * 100).toFixed(1);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              State
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Potential Area (ha)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Area (ha)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Coverage %
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              5-Year Target (ha)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              2021-22 Target
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              2025-26 Target
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {statesToShow.map((state) => {
            const data = nmeoOPDetailedData.stateExpansionTargets[state];
            if (!data) return null;
            
            const coveragePercentage = calculateCoveragePercentage(state);
            const progressColor = coveragePercentage >= 50 ? "bg-green-100 text-green-800" :
                                 coveragePercentage >= 30 ? "bg-yellow-100 text-yellow-800" :
                                 coveragePercentage >= 10 ? "bg-orange-100 text-orange-800" :
                                 "bg-red-100 text-red-800";
            
            return (
              <tr key={state} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {state}
                  {state === selectedState && selectedState !== "All-India" && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">(Selected)</span>
                  )}
                </td>
                <td className="px-4 py-3">{formatNumber(data.potentialArea)}</td>
                <td className="px-4 py-3">{formatNumber(data.currentArea)}</td>
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${progressColor}`}>
                    {coveragePercentage}%
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-blue-700">{formatNumber(data.total)}</td>
                <td className="px-4 py-3">{formatNumber(data["2021-22"])}</td>
                <td className="px-4 py-3">{formatNumber(data["2025-26"])}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${coveragePercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">
                      {coveragePercentage}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Summary for All-India view */}
      {selectedState === "All-India" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-800">
                {Object.values(nmeoOPDetailedData.stateExpansionTargets)
                  .reduce((sum, state) => sum + state.potentialArea, 0)
                  .toLocaleString()}
              </div>
              <div className="text-blue-600">Total Potential Area</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-800">
                {Object.values(nmeoOPDetailedData.stateExpansionTargets)
                  .reduce((sum, state) => sum + state.currentArea, 0)
                  .toLocaleString()}
              </div>
              <div className="text-blue-600">Total Current Area</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-800">
                {Object.values(nmeoOPDetailedData.stateExpansionTargets)
                  .reduce((sum, state) => sum + state.total, 0)
                  .toLocaleString()}
              </div>
              <div className="text-blue-600">5-Year Expansion Target</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-800">
                {nmeoOPDetailedData.nationalTargets.area.progressPercentage.toFixed(1)}%
              </div>
              <div className="text-blue-600">2025 Target Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}