// components/charts/TargetProgressChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function TargetProgressChart({ data }) {
  // Calculate achievement percentages
  const chartData = Object.entries(data).map(([year, targets]) => ({
    year,
    target: targets.total,
    achieved: targets.achieved || Math.round(targets.total * 0.8), // Example data
    percentage: ((targets.achieved || Math.round(targets.total * 0.8)) / targets.total) * 100
  }));

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
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
                if (name === 'target') return [`${value.toLocaleString()} ha`, 'Target'];
                if (name === 'achieved') return [`${value.toLocaleString()} ha`, 'Achieved'];
                return value;
              }}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="target" 
              name="Annual Target" 
              fill="#93c5fd" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="achieved" 
              name="Achieved" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.percentage >= 100 ? '#10b981' : 
                        entry.percentage >= 80 ? '#3b82f6' : 
                        entry.percentage >= 60 ? '#f59e0b' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-4 gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="text-center p-2 bg-gray-50 rounded border border-gray-200">
            <div className="text-xs text-gray-600 font-medium">{item.year}</div>
            <div className={`text-lg font-bold ${
              item.percentage >= 100 ? 'text-green-600' : 
              item.percentage >= 80 ? 'text-blue-600' : 
              item.percentage >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {item.percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">
              {item.achieved.toLocaleString()} / {item.target.toLocaleString()} ha
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}