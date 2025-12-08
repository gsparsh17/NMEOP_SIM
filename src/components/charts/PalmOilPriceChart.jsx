// components/charts/PalmOilPriceChart.jsx - Alternative Version
import React, { useState } from 'react';
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

const PalmOilPriceChart = ({ graphData, exchangeRate = 21.92 }) => {
  const [currency, setCurrency] = useState('myr'); // 'myr' or 'inr'

  if (!graphData || graphData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No graph data available</div>
          <div className="text-sm text-gray-500">Fetch palm oil data to display chart</div>
        </div>
      </div>
    );
  }

  // Format data for recharts
  const formatData = () => {
    return graphData.map(item => ({
      date: item.date,
      timestamp: item.timestamp,
      monthYear: formatMonthYear(item.date),
      value_myr: item.value_myr,
      value_inr: item.value_inr,
      change_percent: item.change_percent || '',
      exchange_rate: item.exchange_rate || exchangeRate
    }));
  };

  const formatMonthYear = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const data = formatData();
  
  // Calculate statistics based on selected currency
  const currentPrices = currency === 'myr' 
    ? data.map(d => d.value_myr).filter(val => val !== undefined)
    : data.map(d => d.value_inr).filter(val => val !== undefined);
  
  const avgPrice = currentPrices.length > 0 ? 
    currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length : 0;
  
  const highestPrice = Math.max(...currentPrices);
  const lowestPrice = Math.min(...currentPrices);

  // Format price for display based on selected currency
  const formatPrice = (value) => {
    if (currency === 'myr') {
      return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
  };

  // Get data key based on selected currency
  const dataKey = currency === 'myr' ? 'value_myr' : 'value_inr';
  const lineColor = currency === 'myr' ? '#3b82f6' : '#10b981';
  const lineName = currency === 'myr' ? 'Palm Oil Price (MYR/T)' : 'Palm Oil Price (INR/T)';

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{data.monthYear}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: lineColor }}
                />
                <span className="text-sm text-gray-700">
                  {currency === 'myr' ? 'MYR Price:' : 'INR Price:'}
                </span>
              </div>
              <span className="font-medium" style={{ color: lineColor }}>
                {formatPrice(data[dataKey])}
              </span>
            </div>
            
            {/* Show converted price if viewing in other currency */}
            {currency === 'myr' && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-600">INR Equivalent:</span>
                <span className="text-xs font-medium text-green-700">
                  ₹{data.value_inr.toLocaleString()}
                </span>
              </div>
            )}
            {currency === 'inr' && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-600">MYR Original:</span>
                <span className="text-xs font-medium text-blue-700">
                  MYR {data.value_myr.toLocaleString()}
                </span>
              </div>
            )}
            
            {data.change_percent && (
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-600">
                  Month Change: {data.change_percent}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Currency Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-800">Price Trend</h4>
          <p className="text-sm text-gray-600">View prices in different currencies</p>
        </div>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setCurrency('myr')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currency === 'myr'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            MYR
          </button>
          <button
            onClick={() => setCurrency('inr')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currency === 'inr'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            INR
          </button>
        </div>
      </div>
      
      {/* Chart */}
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
              dataKey="monthYear" 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={Math.ceil(data.length / 12)}
              fontSize={10}
              tick={{ fill: '#6b7280' }}
            />
            
            <YAxis 
              tickFormatter={formatPrice}
              fontSize={12}
              tick={{ fill: '#6b7280' }}
              domain={['auto', 'auto']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={() => (
                <span className="text-sm text-gray-700">{lineName}</span>
              )}
            />
            
            {/* Reference line for average */}
            <ReferenceLine 
              y={avgPrice} 
              stroke={lineColor} 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
              label={{
                value: `Avg: ${formatPrice(avgPrice)}`,
                position: 'right',
                fill: lineColor,
                fontSize: 10,
                opacity: 0.7
              }}
            />
            
            {/* Price Line */}
            <Line 
              type="monotone" 
              dataKey={dataKey}
              name={lineName}
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: lineColor }}
              activeDot={{ 
                r: 5, 
                stroke: lineColor, 
                strokeWidth: 2, 
                fill: '#ffffff'
              }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${
          currency === 'myr' 
            ? 'bg-blue-50 border-blue-100' 
            : 'bg-green-50 border-green-100'
        }`}>
          <div className={`text-sm font-medium mb-1 ${
            currency === 'myr' ? 'text-blue-700' : 'text-green-700'
          }`}>
            Price Range ({currency.toUpperCase()})
          </div>
          <div className={`text-lg font-bold ${
            currency === 'myr' ? 'text-blue-900' : 'text-green-900'
          }`}>
            {formatPrice(lowestPrice)} - {formatPrice(highestPrice)}
          </div>
          <div className={`text-xs mt-1 ${
            currency === 'myr' ? 'text-blue-600' : 'text-green-600'
          }`}>
            Average: {formatPrice(avgPrice)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-1">Data Points</div>
          <div className="text-lg font-bold text-gray-900">
            {data.length} months
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {formatMonthYear(data[0]?.date)} to {formatMonthYear(data[data.length - 1]?.date)}
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-sm text-purple-700 font-medium mb-1">Exchange Rate</div>
          <div className="text-lg font-bold text-purple-900">
            1 MYR = ₹21.92
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Fixed conversion rate
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-1">Current View</div>
          <div className={`text-lg font-bold ${
            currency === 'myr' ? 'text-blue-600' : 'text-green-600'
          }`}>
            {currency === 'myr' ? 'MYR (Malaysia)' : 'INR (India)'}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Click buttons above to switch
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalmOilPriceChart;