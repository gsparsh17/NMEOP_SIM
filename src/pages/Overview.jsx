// Overview.jsx
import React, { useState, useEffect } from "react";
import {
  STATES,
  YEARS,
  SCENARIOS,
  importsProdConsData,
  importShareByCountry,
  scenarioComparisonRows,
  liveMarket,
  farmerRisk,
  supplyGapSummary,
  nmeoOpProgress,
  ffbPriceTrend,
  cpoPriceTrend,
  policyActions,
  stateWiseData,
  telanganaPriceData,
  getPriceData,
  getProductionData,
} from "../data/staticData";
import { getLiveMarketData, getAgriculturalWeatherAlerts, checkAPIStatus } from "../services/apiService";
import ImportsProdChart from "../components/charts/ImportsProdChart";
import ImportShareDonut from "../components/charts/ImportShareDonut";
import PriceTrendChart from "../components/charts/PriceTrendChart";
import PalmOilPriceChart from "../components/charts/PalmOilPriceChart"; // Import the new component
import KpiCard from "../components/cards/KpiCard";

// Update your fetch function to call the new endpoint
const fetchPalmOilCommodityData = async () => {
  try {
    console.log("Fetching palm oil data from API...");
    const response = await fetch('http://localhost:5000/scrape/palm-oil/all');
    
    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      // Return fallback data
      return {
        status: "success",
        data: {
          daily_price: {
            price_myr: 4156.0,
            price_inr: 4156.0 * 21.77,
            change_myr: -4.0,
            change_percent: "-0.10%",
            currency: "MYR/T",
            exchange_rate: 21.77,
            unit: "metric ton",
            scraped_at: new Date().toISOString(),
            source: "https://tradingeconomics.com/commodity/palm-oil",
            source_currency: "MYR",
            target_currency: "INR",
            note: "Fallback data"
          },
          graph_data: [],
          summary_stats: {},
          timestamp: new Date().toISOString(),
          exchange_rate: 21.77
        },
        note: "Using fallback data due to API error"
      };
    }
    
    const data = await response.json();
    console.log("Palm oil data fetched successfully:", data);
    return data;
  } catch (error) {
    console.error('Error fetching palm oil data:', error);
    // Return fallback data
    return {
      status: "success",
      data: {
        daily_price: {
          price_myr: 4156.0,
          price_inr: 4156.0 * 21.77,
          change_myr: -4.0,
          change_percent: "-0.10%",
          currency: "MYR/T",
          exchange_rate: 21.77,
          unit: "metric ton",
          scraped_at: new Date().toISOString(),
          source: "https://tradingeconomics.com/commodity/palm-oil",
          source_currency: "MYR",
          target_currency: "INR",
          note: "Fallback data - network error"
        },
        graph_data: [],
        summary_stats: {},
        timestamp: new Date().toISOString(),
        exchange_rate: 21.77
      },
      note: "Using fallback data due to network error"
    };
  }
};

// Helper function to format INR currency
const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format MYR currency
const formatMYR = (amount) => {
  if (amount === undefined || amount === null) return 'MYR 0';
  
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format USD currency
const formatUSD = (amount) => {
  if (!amount) return '$ 0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format date
const formatMonthYear = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    month: 'long', 
    year: 'numeric' 
  });
};

// Helper function to format short date
const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'short'
  });
};

// Calculate percentage change
const getPercentageChange = (current, previous) => {
  if (!previous || previous === 0 || !current) return 0;
  return ((current - previous) / previous) * 100;
};

// Format percentage change
const formatPercentageChange = (percent) => {
  if (percent > 0) return `+${percent.toFixed(2)}%`;
  if (percent < 0) return `${percent.toFixed(2)}%`;
  return '0.00%';
};

// Get change statement
const getChangeStatement = (percent) => {
  if (percent > 5) return 'Significant Increase';
  if (percent > 2) return 'Moderate Increase';
  if (percent > 0) return 'Slight Increase';
  if (percent < -5) return 'Significant Decrease';
  if (percent < -2) return 'Moderate Decrease';
  if (percent < 0) return 'Slight Decrease';
  return 'Stable';
};

// Get alert level based on percentage change
const getAlertLevel = (percent) => {
  if (percent > 5) {
    return {
      level: 'CRITICAL',
      color: 'border-red-500',
      dotColor: 'bg-red-500',
      badgeColor: 'bg-red-100 text-red-800',
      pulse: true
    };
  } else if (percent > 2) {
    return {
      level: 'HIGH',
      color: 'border-orange-500',
      dotColor: 'bg-orange-500',
      badgeColor: 'bg-orange-100 text-orange-800',
      pulse: false
    };
  } else if (percent > 0) {
    return {
      level: 'MODERATE',
      color: 'border-amber-500',
      dotColor: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800',
      pulse: false
    };
  } else if (percent < -2) {
    return {
      level: 'OPPORTUNITY',
      color: 'border-green-500',
      dotColor: 'bg-green-500',
      badgeColor: 'bg-green-100 text-green-800',
      pulse: false
    };
  } else {
    return {
      level: 'STABLE',
      color: 'border-blue-500',
      dotColor: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800',
      pulse: false
    };
  }
};

// Generate market statement based on price change
const generateMarketStatement = (percentChange, currentPriceMYR, currentPriceINR) => {
  const formatPrice = (price, currency = 'MYR') => {
    if (!price) return 'N/A';
    
    switch (currency) {
      case 'INR':
        return formatINR(price);
      case 'MYR':
        return formatMYR(price);
      case 'USD':
      default:
        return formatUSD(price);
    }
  };
  
  const formattedCurrentPrice = formatPrice(currentPriceMYR, 'MYR');
  const formattedINRPrice = formatPrice(currentPriceINR, 'INR');
  const changeFormatted = formatPercentageChange(percentChange);
  
  if (percentChange > 5) {
    return `Global CPO prices surged ${changeFormatted} this month to ${formattedCurrentPrice} (${formattedINRPrice} in INR). Consider temporary duty adjustments to protect domestic consumers and review strategic reserve replenishment timing.`;
  } else if (percentChange > 2) {
    return `CPO prices increased ${changeFormatted} to ${formattedCurrentPrice}. Monitor import costs and review subsidy requirements for vulnerable consumer segments.`;
  } else if (percentChange > 0) {
    return `CPO prices edged up ${changeFormatted} to ${formattedCurrentPrice}. Market remains within stable range, continue monitoring global supply conditions.`;
  } else if (percentChange < -5) {
    return `CPO prices declined ${changeFormatted} to ${formattedCurrentPrice}. Opportunity to build strategic reserves at lower costs. Review import substitution strategy.`;
  } else if (percentChange < -2) {
    return `CPO prices decreased ${changeFormatted} to ${formattedCurrentPrice}. Favorable conditions for import cost reduction and consumer price relief.`;
  } else if (percentChange < 0) {
    return `CPO prices softened ${changeFormatted} to ${formattedCurrentPrice}. Mild downward pressure on import bills, maintain current policy settings.`;
  } else {
    return `CPO prices stable at ${formattedCurrentPrice}. Market equilibrium maintained, current policy settings appear appropriate.`;
  }
};

export default function Overview() {
  const [selectedState, setSelectedState] = useState("All-India");
  const [timeRange, setTimeRange] = useState("2024-25");
  const [scenario, setScenario] = useState("Baseline");
  const [liveData, setLiveData] = useState(null);
  const [agriculturalAlerts, setAgriculturalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);
  const [palmOilData, setPalmOilData] = useState(null);
  const [palmOilLoading, setPalmOilLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [showMonthlyTable, setShowMonthlyTable] = useState(false);

  // Get current state data
  const currentStateData = stateWiseData[selectedState] || stateWiseData["All-India"];

  useEffect(() => {
    checkAPIs();
    loadPalmOilData();
  }, []);

  const loadPalmOilData = async () => {
    setPalmOilLoading(true);
    try {
      const data = await fetchPalmOilCommodityData();
      if (data && data.status === 'success') {
        setPalmOilData(data.data);
        if (data.data.graph_data) {
          setGraphData(data.data.graph_data);
        }
      }
    } catch (error) {
      console.error('Error loading palm oil data:', error);
    }
    setPalmOilLoading(false);
  };

  const checkAPIs = () => {
    const status = checkAPIStatus();
    setApiStatus(status);
  };

  // Filter for critical agricultural alerts
  const criticalAlerts = agriculturalAlerts.filter(alert => 
    alert.alertLevel === 'high' || alert.alertLevel === 'medium'
  );

  // Get current FFB price based on selected state
  const getCurrentFFBPrice = () => {
    if (selectedState === "Telangana") {
      return 19681; // October 2025 price
    }
    return currentStateData.currentFFBPrice || liveMarket.currentFFBPrice;
  };

  // Get current CPO price based on selected state
  const getCurrentCPOPrice = () => {
    if (selectedState === "Telangana") {
      return 115715; // October 2025 price
    }
    return currentStateData.currentCPOPrice || liveMarket.currentCPOPrice;
  };

  // Format price for display - updated to handle different currencies
  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'N/A';
    
    switch (currency) {
      case 'INR':
        return formatINR(price);
      case 'MYR':
        return formatMYR(price);
      case 'USD':
      default:
        return formatUSD(price);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render monthly data table
  const renderMonthlyTable = () => {
    if (!graphData || graphData.length === 0) return null;

    const reversedData = [...graphData].reverse();

    return (
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (MYR)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (INR)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month Change
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reversedData.map((monthData, index, array) => {
              const prevMonth = array[index + 1];
              const monthChange = prevMonth ? monthData.value_myr - prevMonth.value_myr : 0;
              const changePercent = prevMonth ? 
                ((monthData.value_myr - prevMonth.value_myr) / prevMonth.value_myr * 100) : 
                0;
              
              return (
                <tr key={monthData.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(monthData.date).toLocaleDateString('en-IN', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(monthData.date).toLocaleDateString('en-IN', { 
                        day: '2-digit',
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-800">
                      {formatPrice(monthData.value_myr, 'MYR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {formatPrice(monthData.value_inr, 'INR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      @ ₹{monthData.exchange_rate}/MYR
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      monthChange > 0 ? 'text-red-600' : 
                      monthChange < 0 ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {monthChange > 0 ? '+' : ''}{formatPrice(monthChange, 'MYR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      changePercent > 0 ? 'bg-red-100 text-red-800' :
                      changePercent < 0 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {changePercent > 0 ? '↗' : changePercent < 0 ? '↘' : '→'}
                      <span className="ml-1">
                        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Summary footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-gray-600">
              Showing {graphData.length} months of data • Exchange rate: 1 MYR = ₹{graphData[0]?.exchange_rate || 21.77}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Highest:</span>
                <span className="ml-2 font-medium text-red-600">
                  {formatPrice(Math.max(...graphData.map(m => m.value_myr)), 'MYR')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Lowest:</span>
                <span className="ml-2 font-medium text-green-600">
                  {formatPrice(Math.min(...graphData.map(m => m.value_myr)), 'MYR')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Average:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {formatPrice(
                    graphData.reduce((sum, m) => sum + m.value_myr, 0) / graphData.length, 
                    'MYR'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Policy Situation Room</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>DASHBOARD</span>
                </div>
              </div>
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Live monitoring of India's edible oil security with market alerts
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                <img 
                  src="/assets/ut.png" 
                  alt="Ministry Logo" 
                  className="w-6 h-6"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Ministry of Agriculture & Farmers Welfare</span>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="text-gray-600">Government of India</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Palm Oil Commodity Data Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">LIVE PALM OIL COMMODITY DATA</h3>
                <p className="text-sm opacity-90">Global Market Intelligence • Trading Economics • MYR to INR Conversion</p>
              </div>
            </div>
            <button
              onClick={loadPalmOilData}
              disabled={palmOilLoading}
              className="bg-white text-[#00509e] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {palmOilLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {palmOilLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-[#00509e] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-600">Fetching live palm oil commodity data...</p>
              </div>
            </div>
          ) : palmOilData ? (
            <>
              {/* Currency Price Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Malaysian Ringgit (MYR) Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">CURRENT PRICE (MYR)</div>
                      <div className="text-3xl font-bold text-blue-800 mt-1">
                        {formatPrice(palmOilData.daily_price?.price_myr, 'MYR')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Per Metric Ton</div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
                      <div className="text-sm font-bold">MYR</div>
                      <div className="text-xs">Malaysia</div>
                    </div>
                  </div>
                  {palmOilData.daily_price?.change_myr !== undefined && (
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      palmOilData.daily_price.change_myr > 0 
                        ? 'bg-green-100 text-green-800' 
                        : palmOilData.daily_price.change_myr < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {palmOilData.daily_price.change_myr > 0 ? '+' : ''}{palmOilData.daily_price.change_myr} MYR
                      {palmOilData.daily_price?.change_percent && (
                        <span className="ml-2">({palmOilData.daily_price.change_percent})</span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Bursa Malaysia Derivatives
                  </div>
                </div>

                {/* Indian Rupee (INR) Card */}
                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">CONVERTED PRICE (INR)</div>
                      <div className="text-3xl font-bold text-green-800 mt-1">
                        {formatPrice(palmOilData.daily_price?.price_inr, 'INR')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Per Metric Ton</div>
                    </div>
                    <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                      <div className="text-sm font-bold">INR</div>
                      <div className="text-xs">India</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Exchange Rate:</span>
                      <span className="font-medium">1 MYR = ₹{palmOilData.daily_price?.exchange_rate || 21.77}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Based on current forex rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Graph Data Section */}
              {palmOilData?.graph_data && palmOilData.graph_data.length > 0 && (
                <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">1-Year Price Trend (MYR & INR)</h4>
                      <p className="text-sm text-gray-600">Historical price movement with currency conversion</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Data points:</div>
                      <div className="text-lg font-bold text-[#003366]">{palmOilData.graph_data.length}</div>
                    </div>
                  </div>
                  
                  {/* Use the new chart component */}
                  <PalmOilPriceChart 
                    graphData={palmOilData.graph_data}
                    exchangeRate={palmOilData.daily_price?.exchange_rate || 21.77}
                  />
                  
                  {/* Monthly data table dropdown */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowMonthlyTable(!showMonthlyTable)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-medium text-gray-800">View Monthly Data Table</span>
                        <span className="text-xs text-gray-500 ml-2">({palmOilData.graph_data.length} months)</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-600 transition-transform ${showMonthlyTable ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showMonthlyTable && (
                      <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {renderMonthlyTable()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Source Info */}
              <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Data Source Information</div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Source:</span>
                        <a 
                          href={palmOilData.daily_price?.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Trading Economics - Palm Oil Commodity
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Currency:</span>
                        <span>Malaysian Ringgit (MYR) per metric ton</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Conversion:</span>
                        <span>1 MYR = ₹{palmOilData.daily_price?.exchange_rate || 21.77} (Fixed Rate)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 mb-1">Last Updated</div>
                    <div className="text-sm text-gray-600">{formatTimestamp(palmOilData.timestamp)}</div>
                    {palmOilData.daily_price?.note && (
                      <div className="text-xs text-amber-600 mt-1">{palmOilData.daily_price.note}</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Palm Oil Data Available</h4>
              <p className="text-gray-600 mb-4">Click the refresh button to fetch live commodity data</p>
              <button
                onClick={loadPalmOilData}
                className="bg-[#1e5c2a] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#164523] transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Fetch Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Strips */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">GLOBAL MARKET DATA STRIP</h3>
                <p className="text-sm opacity-90">Monthly Price Trends & Percentage Changes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90">Data from Trading Economics</div>
              <div className="text-xs opacity-75">Updated: {palmOilData?.timestamp ? formatTimestamp(palmOilData.timestamp) : 'N/A'}</div>
            </div>
          </div>
        </div>

        {palmOilLoading ? (
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e5c2a]"></div>
              <span className="ml-3 text-gray-600">Loading market data...</span>
            </div>
          </div>
        ) : palmOilData?.graph_data?.length > 0 ? (
          <div className="p-6">
            {/* Current Month Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 font-medium mb-1">CURRENT MONTH</div>
                <div className="text-lg font-bold text-[#003366]">
                  {formatMonthYear(palmOilData.graph_data[palmOilData.graph_data.length - 1]?.date)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Latest: {formatPrice(palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr, 'MYR')}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-gray-600 font-medium mb-1">PREVIOUS MONTH</div>
                <div className="text-lg font-bold text-green-700">
                  {formatMonthYear(palmOilData.graph_data[palmOilData.graph_data.length - 2]?.date)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Price: {formatPrice(palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr, 'MYR')}
                </div>
              </div>
              
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-xs text-gray-600 font-medium mb-1">MONTH-ON-MONTH CHANGE</div>
                <div className={`text-xl font-bold ${
                  getPercentageChange(
                    palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                    palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                  ) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatPercentageChange(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getChangeStatement(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Market Alert Statement */}
            <div className={`border-l-4 ${
              getAlertLevel(
                getPercentageChange(
                  palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                  palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                )
              ).color
            } p-4 bg-gray-50 rounded-r-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  getAlertLevel(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  ).pulse ? 'animate-pulse' : ''
                } ${
                  getAlertLevel(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  ).dotColor
                }`}></div>
                <span className="font-bold text-gray-800 text-sm">GLOBAL MARKET ALERT</span>
                <div className={`ml-auto ${
                  getAlertLevel(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  ).badgeColor
                } text-xs px-2 py-1 rounded-full font-medium`}>
                  {getAlertLevel(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  ).level}
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                {generateMarketStatement(
                  getPercentageChange(
                    palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                    palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                  ),
                  palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                  palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_inr
                )}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span>Exchange Rate: 1 MYR = ₹{palmOilData.daily_price?.exchange_rate || 21.77}</span>
                <span>•</span>
                <span>Data points: {palmOilData.graph_data.length} months</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">No monthly graph data available</p>
            <button
              onClick={loadPalmOilData}
              className="mt-3 bg-[#1e5c2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#164523] transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex flex-wrap gap-4 items-center p-5">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">State/UT</label>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}>
                {STATES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Oil Palm Year</label>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                {YEARS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* State Overview Banner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                {selectedState} - Oil Palm Overview
              </h3>
              <p className="text-sm opacity-90">
                National Mission on Edible Oils • Ministry of Agriculture
              </p>
            </div>
            <div className="mt-3 md:mt-0 text-right">
              <div className="text-2xl font-bold">₹ 19,681/MT</div>
              <div className="text-sm opacity-90">Current FFB Price</div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Potential Area</div>
              <div className="text-lg font-bold text-gray-800">
                {currentStateData.potentialArea?.toLocaleString()} ha
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Area Covered</div>
              <div className="text-lg font-bold text-gray-800">
                {currentStateData.areaCovered?.toLocaleString()} ha
              </div>
              <div className="text-xs text-green-600 mt-1">{currentStateData.coveragePercentage}% coverage</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Expansion Target</div>
              <div className="text-lg font-bold text-gray-800">
                {currentStateData.totalExpansionTarget?.toLocaleString()} ha
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Production Data */}
      {selectedState !== "All-India" && currentStateData.productionData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedState} Production History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Year</th>
                  <th className="px-4 py-2 text-right">FFB Production (MT)</th>
                  <th className="px-4 py-2 text-right">CPO Production (MT)</th>
                  <th className="px-4 py-2 text-right">Extraction Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(currentStateData.productionData).map(([year, data]) => (
                  <tr key={year} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{year}</td>
                    <td className="px-4 py-2 text-right">
                      {data.ffb ? data.ffb.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {data.cpo ? data.cpo.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {data.ffb && data.cpo ? ((data.cpo / data.ffb) * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Supply-Demand Balance" 
          explanation="Shows how domestic production, imports, and consumption interact. Policy goal: reduce import dependency while ensuring adequate supply."
        >
          <ImportsProdChart data={importsProdConsData} />
        </ChartCard>

        <ChartCard 
          title="FFB & CPO Price Trends" 
          explanation="Monthly price movement of Fresh Fruit Bunches and Crude Palm Oil in Telangana region."
        >
          <PriceTrendChart ffbData={ffbPriceTrend} cpoData={cpoPriceTrend} selectedState={selectedState} />
        </ChartCard>
      </div>

    </div>
  );
}

// Helper Components
function ProgressBar({ label, current, target, unit, stateContribution, status }) {
  const percentage = (current / target) * 100;
  const getStatusColor = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusText = (percent) => {
    if (percent >= 80) return 'On Track';
    if (percent >= 60) return 'Moderate';
    return 'Behind';
  };

  const getStatusTextColor = (percent) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="p-5 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="font-bold text-gray-800 text-sm">{label}</div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusTextColor(percentage)} bg-white border`}>
          {getStatusText(percentage)}
        </div>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Progress:</span>
        <span className="font-bold text-gray-800">{current} / {target} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">
          {percentage.toFixed(0)}% of 2030 target
        </span>
        {stateContribution && status && status !== "All-India" && (
          <span className="text-green-600 font-medium">
            • {status}: {stateContribution.toFixed(1)}k ha
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, explanation, children, badge, badgeColor }) {
  const badgeClasses = {
    red: 'bg-red-100 text-red-800 border-red-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
        {badge && (
          <span className={`text-xs font-bold px-2 py-1 rounded border ${badgeClasses[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">{explanation}</p>
      {children}
    </div>
  );
}

function ActionMatrix({ actions, selectedState }) {
  const getStateSpecificActions = () => {
    return actions.map(action => {
      if (action.category === "Farmers" && selectedState !== "All-India") {
        return {
          ...action,
          indicator: `${selectedState} FFB Price: ₹${stateWiseData[selectedState]?.currentFFBPrice?.toLocaleString() || 'N/A'}/MT`
        };
      }
      return action;
    });
  };

  return (
    <div className="space-y-3">
      {getStateSpecificActions().map((action, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              action.risk.includes('🟢') ? 'bg-green-500' : 
              action.risk.includes('⚠️') ? 'bg-amber-500' : 'bg-red-500'
            }`}></div>
            <div>
              <div className="font-medium text-gray-800 text-sm">{action.category}</div>
              <div className="text-xs text-gray-600">{action.indicator}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold ${
              action.risk.includes('🟢') ? 'text-green-600' : 
              action.risk.includes('⚠️') ? 'text-amber-600' : 'text-red-600'
            }`}>
              {action.risk.replace('🟢', 'LOW').replace('⚠️', 'MEDIUM').replace('🔴', 'HIGH')}
            </div>
            <div className="text-xs text-gray-600 font-medium">{action.action}</div>
          </div>
        </div>
      ))}
    </div>
  );
}