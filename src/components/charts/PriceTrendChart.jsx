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
  ReferenceLine
} from 'recharts';

const PriceTrendChart = ({ ffbData, cpoData, selectedState = "Telangana" }) => {
  // Process data to handle different time formats
  const processData = () => {
    if (!ffbData || !cpoData) return [];
    
    // Handle both formats: {period: "Aug 2023", price: 13026} and {month: "Apr", price: 10032, year: "2020-21"}
    return ffbData.map((ffbItem, index) => {
      const cpoItem = cpoData[index];
      
      // Extract month and year
      let label, month, year;
      
      if (ffbItem.period) {
        // Format: {period: "Aug 2023", price: 13026}
        const [monthStr, yearStr] = ffbItem.period.split(' ');
        label = ffbItem.period;
        month = monthStr;
        year = yearStr;
      } else if (ffbItem.month) {
        // Format: {month: "Apr", price: 10032, year: "2020-21"}
        label = `${ffbItem.month} ${ffbItem.year || ''}`;
        month = ffbItem.month;
        year = ffbItem.year;
      }
      
      return {
        label,
        month,
        year,
        ffb: ffbItem.price || ffbItem.ffb || 0,
        cpo: cpoItem?.price || cpoItem?.cpo || 0,
        date: new Date(ffbItem.date || ffbItem.period || ffbItem.month)
      };
    });
  };

  const data = processData();
  
  // Calculate average prices for reference lines
  const avgFFB = data.length > 0 ? 
    data.reduce((sum, item) => sum + item.ffb, 0) / data.length : 0;
  const avgCPO = data.length > 0 ? 
    data.reduce((sum, item) => sum + item.cpo, 0) / data.length : 0;

  // Calculate current month prices
  const currentFFB = data.length > 0 ? data[data.length - 1].ffb : 0;
  const currentCPO = data.length > 0 ? data[data.length - 1].cpo : 0;

  // Format price for display
  const formatPrice = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => {
            const priceDiff = index === 0 ? 
              (entry.value - avgFFB) : 
              (entry.value - avgCPO);
            const diffPercentage = index === 0 ? 
              ((priceDiff / avgFFB) * 100).toFixed(1) :
              ((priceDiff / avgCPO) * 100).toFixed(1);
            
            return (
              <div key={index} className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700">{entry.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    ₹{entry.value.toLocaleString()}
                  </span>
                  <span className={`text-xs ml-2 ${priceDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({priceDiff >= 0 ? '+' : ''}{priceDiff.toLocaleString()}, {priceDiff >= 0 ? '+' : ''}{diffPercentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-600">
          Current: FFB ₹{currentFFB.toLocaleString()}, CPO ₹{currentCPO.toLocaleString()}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e2e8f0" 
              vertical={false}
            />
            
            <XAxis 
              dataKey="label" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={Math.ceil(data.length / 12)} // Show 12 labels max
              fontSize={10}
              tick={{ fill: '#6b7280' }}
            />
            
            <YAxis 
              tickFormatter={formatPrice}
              fontSize={12}
              tick={{ fill: '#6b7280' }}
              domain={['auto', 'auto']}
            />
            
            {/* Average reference lines */}
            <ReferenceLine 
              y={avgFFB} 
              stroke="#1e5c2a" 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
              label={{
                value: `Avg FFB: ${formatPrice(avgFFB)}`,
                position: 'right',
                fill: '#1e5c2a',
                fontSize: 10,
                opacity: 0.7
              }}
            />
            
            <ReferenceLine 
              y={avgCPO} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
              label={{
                value: `Avg CPO: ${formatPrice(avgCPO)}`,
                position: 'right',
                fill: '#f59e0b',
                fontSize: 10,
                opacity: 0.7
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
            
            {/* FFB Price Line */}
            <Line 
              type="monotone" 
              dataKey="ffb" 
              name={`FFB Price (₹/MT)`}
              stroke="#1e5c2a" 
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2, fill: '#1e5c2a' }}
              activeDot={{ 
                r: 6, 
                stroke: '#1e5c2a', 
                strokeWidth: 2, 
                fill: '#ffffff'
              }}
              connectNulls={true}
            />
            
            {/* CPO Price Line */}
            <Line 
              type="monotone" 
              dataKey="cpo" 
              name={`CPO Price (₹/MT)`}
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2, fill: '#f59e0b' }}
              activeDot={{ 
                r: 6, 
                stroke: '#f59e0b', 
                strokeWidth: 2, 
                fill: '#ffffff'
              }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-green-800">FFB Price Range</div>
              <div className="text-xs text-green-600 mt-1">
                {data.length > 0 && (
                  <>
                    High: ₹{Math.max(...data.map(d => d.ffb)).toLocaleString()} · 
                    Low: ₹{Math.min(...data.map(d => d.ffb)).toLocaleString()}
                  </>
                )}
              </div>
            </div>
            <div className="text-green-700 font-bold">
              {formatPrice(avgFFB)}
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-amber-800">CPO Price Range</div>
              <div className="text-xs text-amber-600 mt-1">
                {data.length > 0 && (
                  <>
                    High: ₹{Math.max(...data.map(d => d.cpo)).toLocaleString()} · 
                    Low: ₹{Math.min(...data.map(d => d.cpo)).toLocaleString()}
                  </>
                )}
              </div>
            </div>
            <div className="text-amber-700 font-bold">
              {formatPrice(avgCPO)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTrendChart;