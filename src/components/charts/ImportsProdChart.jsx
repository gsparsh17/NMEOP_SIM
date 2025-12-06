// components/charts/ImportsProdChart.jsx
import React from 'react';
import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  ReferenceLine
} from "recharts";
import { importsProdConsData } from "../../data/staticData";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => {
            // Format values based on the dataKey
            let formattedValue;
            let color;
            
            switch (entry.dataKey) {
              case 'imports':
                formattedValue = `${entry.value.toLocaleString()} MT`;
                color = '#1e5c2a'; // Green for imports
                break;
              case 'production':
                formattedValue = `${entry.value.toLocaleString()} MT`;
                color = '#f59e0b'; // Amber for production
                break;
              case 'consumption':
                formattedValue = `${entry.value.toLocaleString()} MT`;
                color = '#1e40af'; // Blue for consumption
                break;
              default:
                formattedValue = entry.value.toLocaleString();
                color = entry.color;
            }
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700">{entry.name}:</span>
                </div>
                <span className="font-medium text-gray-900">{formattedValue}</span>
              </div>
            );
          })}
          
          {/* Add dependency ratio calculation */}
          {payload.length >= 3 && (
            <div className="pt-2 border-t mt-2">
              <div className="text-xs text-gray-600">
                Import Dependency: {((payload.find(p => p.dataKey === 'imports').value / 
                  payload.find(p => p.dataKey === 'consumption').value) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function ImportsProdChart({ data = importsProdConsData }) {
  // Calculate average for reference lines
  const calculateAverages = () => {
    if (!data || data.length === 0) return { avgImports: 0, avgProduction: 0, avgConsumption: 0 };
    
    const totalImports = data.reduce((sum, item) => sum + (item.imports || 0), 0);
    const totalProduction = data.reduce((sum, item) => sum + (item.production || 0), 0);
    const totalConsumption = data.reduce((sum, item) => sum + (item.consumption || 0), 0);
    
    return {
      avgImports: totalImports / data.length,
      avgProduction: totalProduction / data.length,
      avgConsumption: totalConsumption / data.length
    };
  };
  
  const averages = calculateAverages();
  
  // Format Y-axis tick values
  const formatYAxis = (value) => {
    if (value >= 10000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="h-80 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">India's Edible Oil Supply Chain (2015-2024)</h4>
        <div className="text-xs text-gray-600">
          Data in Metric Tons (MT)
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            
            <XAxis 
              dataKey="year" 
              stroke="#64748b"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
              tickFormatter={formatYAxis}
              domain={[0, 'auto']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              height={48}
              iconSize={10}
              wrapperStyle={{ paddingTop: 6 }}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
            
            {/* Reference lines for averages */}
            <ReferenceLine 
              y={averages.avgImports} 
              stroke="#1e5c2a" 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
              // label={{
              //   value: `Avg Imports: ${formatYAxis(averages.avgImports)} MT`,
              //   position: 'right',
              //   fill: '#1e5c2a',
              //   fontSize: 10,
              //   opacity: 0.7
              // }}
            />
            
            <ReferenceLine 
              y={averages.avgConsumption} 
              stroke="#1e40af" 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
              // label={{
              //   value: `Avg Consumption: ${formatYAxis(averages.avgConsumption)} MT`,
              //   position: 'right',
              //   fill: '#1e40af',
              //   fontSize: 10,
              //   opacity: 0.7
              // }}
            />
            
            <ReferenceLine 
              y={averages.avgProduction} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
              // label={{
              //   value: `Avg Production: ${formatYAxis(averages.avgProduction)} MT`,
              //   position: 'right',
              //   fill: '#f59e0b',
              //   fontSize: 10,
              //   opacity: 0.7
              // }}
            />
            
            {/* Imports - Bar chart for better visibility */}
            <Bar 
              dataKey="imports" 
              name="Imports (MT)" 
              fill="#1e5c2a" 
              fillOpacity={0.85}
              radius={[2, 2, 0, 0]}
              barSize={14}
            />
            
            {/* Consumption - Bar chart (grouped) */}
            <Bar
              dataKey="consumption"
              name="Consumption (MT)"
              fill="#1e40af"
              fillOpacity={0.85}
              radius={[2, 2, 0, 0]}
              barSize={14}
            />
            
            {/* Production - Bar chart (grouped) */}
            <Bar
              dataKey="production"
              name="Domestic Production (MT)"
              fill="#f59e0b"
              fillOpacity={0.85}
              radius={[2, 2, 0, 0]}
              barSize={14}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-green-800">Average Imports</div>
              <div className="text-xs text-green-600 mt-1">
                {data.length} years data
              </div>
            </div>
            <div className="text-green-700 font-bold">
              {formatYAxis(averages.avgImports)} MT
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-amber-800">Average Production</div>
              <div className="text-xs text-amber-600 mt-1">
                {data.length} years data
              </div>
            </div>
            <div className="text-amber-700 font-bold">
              {formatYAxis(averages.avgProduction)} MT
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-blue-800">Average Consumption</div>
              <div className="text-xs text-blue-600 mt-1">
                {data.length} years data
              </div>
            </div>
            <div className="text-blue-700 font-bold">
              {formatYAxis(averages.avgConsumption)} MT
            </div>
          </div>
        </div>
      </div>
      
      {/* Dependency Ratio */}
      <div className="text-xs text-gray-600 mt-2">
        Import Dependency: {((averages.avgImports / averages.avgConsumption) * 100).toFixed(1)}% 
        (Avg imports meet {((averages.avgImports / averages.avgConsumption) * 100).toFixed(1)}% of consumption)
      </div>
    </div>
  );
}