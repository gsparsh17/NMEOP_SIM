// components/charts/HistoricalExpansionChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function HistoricalExpansionChart({ selectedState }) {
  // Get historical data for selected state
  const getHistoricalData = () => {
    if (!selectedState || selectedState === "All-India") {
      // National historical data
      return [
        { year: "2014-15", target: 14000, achievement: 9259 },
        { year: "2015-16", target: 12500, achievement: 5284 },
        { year: "2016-17", target: 12500, achievement: 6002 },
        { year: "2017-18", target: 11500, achievement: 6157 },
        { year: "2018-19", target: 12000, achievement: 6508 },
        { year: "2019-20", target: 8000, achievement: 6642 },
        { year: "2020-21", target: 10000, achievement: 8801 }
      ];
    }
    
    // Get state-specific historical data from PDF tables
    const stateHistoricalData = {
      "Andhra Pradesh": [
        { year: "2014-15", target: 14000, achievement: 9259 },
        { year: "2015-16", target: 12500, achievement: 5284 },
        { year: "2016-17", target: 12500, achievement: 6002 },
        { year: "2017-18", target: 11500, achievement: 6157 },
        { year: "2018-19", target: 12000, achievement: 6508 },
        { year: "2019-20", target: 8000, achievement: 6642 },
        { year: "2020-21", target: 10000, achievement: 8801 }
      ],
      "Telangana": [
        { year: "2014-15", target: 2000, achievement: 972 },
        { year: "2015-16", target: 2000, achievement: 434 },
        { year: "2016-17", target: 3000, achievement: 673 },
        { year: "2017-18", target: 2000, achievement: 1413 },
        { year: "2018-19", target: 1930, achievement: 870 },
        { year: "2019-20", target: 2400, achievement: 2133 },
        { year: "2020-21", target: 2500, achievement: 1860 }
      ],
      // Add other states as needed...
    };
    
    return stateHistoricalData[selectedState] || [];
  };

  const historicalData = getHistoricalData();

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              label={{ 
                value: 'Area (ha)', 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12 
              }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'target') return [`${value.toLocaleString()} ha`, 'Annual Target'];
                if (name === 'achievement') return [`${value.toLocaleString()} ha`, 'Achievement'];
                return value;
              }}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Annual Target" 
              stroke="#93c5fd" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="achievement" 
              name="Actual Achievement" 
              stroke="#3b82f6" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      {historicalData.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs text-blue-700 font-medium">Avg Achievement Rate</div>
            <div className="text-lg font-bold text-blue-800">
              {((historicalData.reduce((sum, d) => sum + d.achievement, 0) / 
                 historicalData.reduce((sum, d) => sum + d.target, 0)) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
            <div className="text-xs text-green-700 font-medium">Total Area Added</div>
            <div className="text-lg font-bold text-green-800">
              {historicalData.reduce((sum, d) => sum + d.achievement, 0).toLocaleString()} ha
            </div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded border border-amber-200">
            <div className="text-xs text-amber-700 font-medium">Best Year</div>
            <div className="text-lg font-bold text-amber-800">
              {Math.max(...historicalData.map(d => d.achievement)).toLocaleString()} ha
            </div>
          </div>
        </div>
      )}
    </div>
  );
}