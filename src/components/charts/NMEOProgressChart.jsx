// components/charts/NMEOProgressChart.jsx
import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { nmeoOPDetailedData } from "../../data/staticData";

export default function NMEOProgressChart({ selectedState, stateData }) {
  // Generate data for the chart based on selected state
  const generateChartData = () => {
    if (selectedState === "All-India") {
      // National progress data
      return [
        { year: "2021", area: 3.70, production: 2.72, targetArea: 4.00, targetProduction: 3.50 },
        { year: "2022", area: 4.20, production: 3.10, targetArea: 5.00, targetProduction: 4.50 },
        { year: "2023", area: 4.80, production: 3.80, targetArea: 6.00, targetProduction: 5.50 },
        { year: "2024", area: 5.60, production: 4.80, targetArea: 7.00, targetProduction: 6.80 },
        { year: "2025", area: 6.50, production: 6.00, targetArea: 8.00, targetProduction: 8.50 },
        { year: "2026", area: 7.50, production: 7.50, targetArea: 10.00, targetProduction: 11.20 }
      ];
    } else {
      // State-specific data
      const stateTargets = nmeoOPDetailedData.stateExpansionTargets[selectedState];
      if (!stateTargets) return [];
      
      return [
        { 
          year: "2021", 
          area: stateTargets.currentArea / 1000, // Convert to '000 ha
          production: 0.1, // Placeholder
          targetArea: stateTargets["2021-22"] / 1000
        },
        { 
          year: "2022", 
          area: (stateTargets.currentArea + stateTargets["2021-22"]) / 1000,
          production: 0.2,
          targetArea: stateTargets["2022-23"] / 1000
        },
        { 
          year: "2023", 
          area: (stateTargets.currentArea + stateTargets["2021-22"] + stateTargets["2022-23"]) / 1000,
          production: 0.4,
          targetArea: stateTargets["2023-24"] / 1000
        },
        { 
          year: "2024", 
          area: (stateTargets.currentArea + stateTargets["2021-22"] + stateTargets["2022-23"] + stateTargets["2023-24"]) / 1000,
          production: 0.7,
          targetArea: stateTargets["2024-25"] / 1000
        },
        { 
          year: "2025", 
          area: (stateTargets.currentArea + stateTargets.total) / 1000,
          production: 1.2,
          targetArea: stateTargets["2025-26"] / 1000
        }
      ];
    }
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      {/* Combined Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="#3b82f6"
              fontSize={12}
              label={{ 
                value: 'Area (000 ha)', 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12 
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#10b981"
              fontSize={12}
              label={{ 
                value: 'Production (lakh tonnes)', 
                angle: 90, 
                position: 'insideRight',
                fontSize: 12 
              }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'area') return [`${value.toFixed(2)}K ha`, 'Area Under Oil Palm'];
                if (name === 'production') return [`${value.toFixed(2)} lakh tonnes`, 'CPO Production'];
                if (name === 'targetArea') return [`${value.toFixed(2)}K ha`, 'Annual Target'];
                return value;
              }}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="area" 
              name="Area Under Cultivation" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="production" 
              name="CPO Production" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="targetArea" 
              name="Annual Area Target" 
              stroke="#3b82f6" 
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-blue-700">Area Expansion Progress</span>
            <span className="font-bold">
              {selectedState === "All-India" 
                ? `${nmeoOPDetailedData.nationalTargets.area.current.toFixed(2)} / 10.00 lakh ha`
                : `${(stateData?.areaCovered / 1000).toFixed(2)}K / ${(nmeoOPDetailedData.stateExpansionTargets[selectedState]?.potentialArea / 1000).toFixed(2)}K ha`
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${selectedState === "All-India" 
                  ? nmeoOPDetailedData.nationalTargets.area.progressPercentage 
                  : stateData?.coveragePercentage || 0}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 text-right">
            {selectedState === "All-India" 
              ? `${nmeoOPDetailedData.nationalTargets.area.progressPercentage.toFixed(1)}% of 2025 target`
              : `${stateData?.coveragePercentage?.toFixed(1) || 0}% of potential area`
            }
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-green-700">Production Growth</span>
            <span className="font-bold">
              {selectedState === "All-India" 
                ? `${nmeoOPDetailedData.nationalTargets.production.current.toFixed(2)} / 11.20 lakh tonnes`
                : `—`
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${selectedState === "All-India" 
                  ? nmeoOPDetailedData.nationalTargets.production.progressPercentage 
                  : 0}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 text-right">
            {selectedState === "All-India" 
              ? `${nmeoOPDetailedData.nationalTargets.production.progressPercentage.toFixed(1)}% of 2025 target`
              : "State production data not available"
            }
          </div>
        </div>
      </div>

      {/* NMEO-OP Financial Summary */}
      {selectedState !== "All-India" && nmeoOPDetailedData.financialAllocations[selectedState] && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm font-medium text-amber-800 mb-2">NMEO-OP Financial Allocation (2021-22)</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-amber-700">₹ {nmeoOPDetailedData.financialAllocations[selectedState]["2021-22"].central.toLocaleString()} lakh</div>
              <div className="text-amber-600">Central Share</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-700">₹ {nmeoOPDetailedData.financialAllocations[selectedState]["2021-22"].state.toLocaleString()} lakh</div>
              <div className="text-amber-600">State Share</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-700">{nmeoOPDetailedData.financialAllocations[selectedState]["2021-22"].areaTarget.toLocaleString()} ha</div>
              <div className="text-amber-600">Area Target</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}