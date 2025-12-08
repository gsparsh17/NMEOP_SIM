import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function DataPreviewChart({ data, type = "line" }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-sm text-[#003366]">
            Updates: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === "area" ? (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="updates" 
            stroke="#003366" 
            fill="url(#colorUpdates)" 
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#003366" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </AreaChart>
      ) : (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="updates" 
            stroke="#003366" 
            strokeWidth={2}
            dot={{ stroke: '#003366', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}