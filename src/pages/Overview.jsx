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
import KpiCard from "../components/cards/KpiCard";

export default function Overview() {
  const [selectedState, setSelectedState] = useState("All-India");
  const [timeRange, setTimeRange] = useState("2024-25");
  const [scenario, setScenario] = useState("Baseline");
  const [liveData, setLiveData] = useState(null);
  const [agriculturalAlerts, setAgriculturalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);

  // Get current state data
  const currentStateData = stateWiseData[selectedState] || stateWiseData["All-India"];

  useEffect(() => {
    loadLiveData();
    checkAPIs();
  }, []);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      const [marketData, alertsData] = await Promise.all([
        getLiveMarketData(),
        getAgriculturalWeatherAlerts()
      ]);
      setLiveData(marketData);
      setAgriculturalAlerts(alertsData);
    } catch (error) {
      console.error('Error loading live data:', error);
      // Set fallback data
      setLiveData({
        globalCPO: { values: [], meta: {} },
        domesticCPO: { current: 115715 },
        usdToInr: '83.45',
        lastUpdated: new Date().toISOString(),
        status: 'error'
      });
      // Load fallback weather data
      const fallbackAlerts = await getAgriculturalWeatherAlerts();
      setAgriculturalAlerts(fallbackAlerts);
    }
    setLoading(false);
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

  return (
    <div className="p-6">
      {/* Page Header - Keep unchanged as requested */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Policy Situation Room</h2>
                
                {/* Official Badge */}
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>DASHBOARD</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Live monitoring of India's edible oil security with real-time weather and market alerts
              </p>
              
              {/* Ministry Stamp */}
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
            
            {/* API Status - Official Style */}
            {apiStatus && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 min-w-[300px]">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-2">
                  System Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Global Data:</span>
                    <span className={`text-sm font-medium ${apiStatus.twelveData.available ? 'text-green-600' : 'text-amber-600'}`}>
                      {apiStatus.twelveData.available ? '🟢 Connected' : '🟡 Mock Data'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weather API:</span>
                    <span className={`text-sm font-medium ${apiStatus.openWeather.available ? 'text-green-600' : 'text-amber-600'}`}>
                      {apiStatus.openWeather.available ? '🟢 Connected' : '🟡 Mock Data'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Environment:</span>
                    <span className="text-sm font-medium text-blue-600">{apiStatus.environment}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
     
      {/* Agricultural Weather Alerts - Blue Header */}
      {criticalAlerts.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <h3 className="font-bold text-sm">AGRICULTURAL WEATHER ALERTS</h3>
              <div className="ml-auto bg-white/20 px-2 py-1 rounded text-xs">
                {criticalAlerts.length} ACTIVE
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {criticalAlerts.map((alert, index) => (
                <div key={index} className={`bg-white rounded-lg p-3 border ${
                  alert.alertLevel === 'high' ? 'border-red-200' : 'border-orange-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{alert.state}</div>
                      <div className="text-xs text-gray-500">{alert.capital}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      alert.alertLevel === 'high' ? 'bg-red-100 text-red-800 border border-red-200' : 
                      'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}>
                      {alert.alertLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="font-medium">{alert.impact}</div>
                    <div className="text-gray-500">{alert.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex flex-wrap gap-4 items-center p-5">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">State/UT</label>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
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
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Scenario Mode</label>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                {SCENARIOS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="ml-auto">
            <button 
              onClick={loadLiveData}
              disabled={loading}
              className="bg-[#003366] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#164523] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
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
      </div>

      {/* State Overview Banner - With Blue Header */}
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
              <div className="text-2xl font-bold">₹{getCurrentFFBPrice()?.toLocaleString()}/MT</div>
              <div className="text-sm opacity-90">Current FFB Price</div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              <div className="text-xs text-gray-600 font-medium mb-1">Processing Mills</div>
              <div className="text-lg font-bold text-gray-800">
                {currentStateData.processingMills || 0} units
              </div>
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

      {/* Alert Strips - Clean Style with Left Borders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-l-4 border-red-500 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-gray-800 text-sm">GLOBAL MARKET ALERT</span>
              <div className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                CRITICAL
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              CPO prices +{liveMarket.globalChangePct}% this month. Consider temporary duty reduction to protect consumers.
            </p>
            {liveData && (
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span>Live USD/INR: {liveData.usdToInr}</span>
                <span>•</span>
                <span>Last updated: {new Date(liveData.lastUpdated).toLocaleTimeString()}</span>
                {liveData.status === 'error' && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">Fallback Data</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-l-4 border-amber-500 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="font-bold text-gray-800 text-sm">FARMER INCOME UPDATE</span>
              <div className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                MONITORING
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Current FFB Price: ₹{getCurrentFFBPrice()?.toLocaleString()}/MT • 
              CPO: ₹{getCurrentCPOPrice()?.toLocaleString()}/MT
            </p>
            <p className="text-gray-600 text-xs mt-2">
              {selectedState === "Telangana" 
                ? "October 2025 price fixed by government directive" 
                : "Price stable with positive farmer retention trends"}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Grid - Clean Professional Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Import Dependence"
          value={`${supplyGapSummary.importShare}%`}
          subtitle="Share of edible oil demand met by imports"
          trend="up"
          trendValue="+2.4%"
          tooltip="Higher dependence increases vulnerability to global price shocks"
          icon="🌍"
          color="blue"
          severity="high"
        />
        <KpiCard
          title="Current FFB Price"
          value={`₹${getCurrentFFBPrice()?.toLocaleString()}/MT`}
          subtitle={`${selectedState} • ${selectedState === "Telangana" ? "Oct 2025 Fixed" : "Latest Available"}`}
          trend="stable"
          trendValue="+0.8%"
          tooltip="Fresh Fruit Bunches price for farmers"
          icon="🌴"
          color="green"
          severity="low"
        />
        <KpiCard
          title="Area Coverage"
          value={`${currentStateData.coveragePercentage}%`}
          subtitle={`${currentStateData.areaCovered?.toLocaleString()} ha of ${currentStateData.potentialArea?.toLocaleString()} ha`}
          trend="improving"
          trendValue="+5.2%"
          tooltip="Percentage of potential area under oil palm cultivation"
          icon="📈"
          color="green"
          severity="medium"
        />
        <KpiCard
          title="Farmer Retention"
          value={`${(nmeoOpProgress.farmerRetentionScore * 100).toFixed(0)}%`}
          subtitle="Confidence in oil palm cultivation"
          trend="improving"
          trendValue="+3.1%"
          tooltip="Higher retention indicates sustainable farmer incomes"
          icon="👨‍🌾"
          color="green"
          severity="low"
        />
      </div>

       {/* NMEO-OP Progress with State Context */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">NMEO-OP Mission Progress</h3>
          <div className="text-sm text-gray-600">
            {selectedState} Contribution
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressBar
            label="Area Expansion"
            current={nmeoOpProgress.areaCurrent}
            target={nmeoOpProgress.areaTarget2030}
            unit="Million ha"
            stateContribution={selectedState !== "All-India" ? currentStateData.areaCovered / 10000 : null}
          />
          <ProgressBar
            label="FFB Production"
            current={nmeoOpProgress.productionCurrent}
            target={nmeoOpProgress.productionTarget2030}
            unit="Million tonnes"
          />
          <div className="text-center p-6 rounded-lg border border-gray-200">
            <div className="text-4xl font-bold text-[#1e5c2a] mb-2">
              {(nmeoOpProgress.farmerRetentionScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm font-medium text-gray-800 mb-1">Farmer Retention Score</div>
            <div className="text-xs text-gray-500 mb-4">Confidence to continue with oil palm</div>
            {selectedState !== "All-India" && currentStateData.currentFFBPrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">{selectedState} FFB Price</div>
                <div className="text-lg font-bold text-green-700">
                  ₹{currentStateData.currentFFBPrice.toLocaleString()}/MT
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
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

        <ChartCard 
          title="Policy Action Matrix" 
          explanation="Critical indicators requiring government attention and potential intervention."
        >
          <ActionMatrix actions={policyActions} selectedState={selectedState} />
        </ChartCard>
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

      {/* Weather Dashboard - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">FFB Growing Regions Weather</h3>
            <div className="text-sm opacity-90">
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agriculturalAlerts.map((weather, index) => (
              <WeatherCard key={index} weather={weather} />
            ))}
          </div>
        </div>
      </div>

      {/* Global Market Data - Blue Header */}
      {liveData && liveData.globalCPO && liveData.globalCPO.values.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Global Market Data</h3>
              <div className="text-sm opacity-90">Live Market Intelligence</div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold text-[#003366] mb-2">
                  ${liveData.globalCPO.values[liveData.globalCPO.values.length - 1]?.close}
                </div>
                <div className="text-sm font-medium text-gray-800">Current CPO Price</div>
                <div className="text-xs text-gray-500 mt-1">Bursa Malaysia Futures</div>
                <div className="text-xs text-blue-600 font-medium mt-2">
                  {liveMarket.globalChangePct > 0 ? '+' : ''}{liveMarket.globalChangePct}% this month
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold text-[#1e5c2a] mb-2">
                  ₹{getCurrentCPOPrice()?.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-800">Domestic CPO Price</div>
                <div className="text-xs text-gray-500 mt-1">{selectedState} Market</div>
                <div className="text-xs text-green-600 font-medium mt-2">
                  Government monitored price
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold text-[#b45309] mb-2">
                  {liveData.usdToInr}
                </div>
                <div className="text-sm font-medium text-gray-800">USD/INR Rate</div>
                <div className="text-xs text-gray-500 mt-1">Forex Market</div>
                <div className="text-xs text-amber-600 font-medium mt-2">
                  RBI reference rate
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Comparison - Dark Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#003366] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Scenario Comparison — Policy Outcomes</h3>
              <p className="text-sm opacity-90">
                Compare different tariff strategies and their impact on key national objectives
              </p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded text-sm">
              OFFICIAL ANALYSIS
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left font-bold text-gray-700 border-b border-gray-300">Policy Metric</th>
                  <th className="px-4 py-4 text-right font-bold text-gray-700 border-b border-gray-300">Baseline</th>
                  <th className="px-4 py-4 text-right font-bold text-gray-700 border-b border-gray-300">Scenario A</th>
                  <th className="px-4 py-4 text-right font-bold text-gray-700 border-b border-gray-300">Scenario B</th>
                  <th className="px-4 py-4 text-right font-bold text-[#1e5c2a] border-b border-gray-300">Optimal</th>
                </tr>
              </thead>
              <tbody>
                {scenarioComparisonRows.map((row) => (
                  <tr key={row.metric} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-4 py-3 text-gray-800 font-medium">{row.metric}</td>
                    <td className="px-4 py-3 text-right border-l border-gray-200">{row.baseline}</td>
                    <td className="px-4 py-3 text-right border-l border-gray-200">{row.scenarioA}</td>
                    <td className="px-4 py-3 text-right border-l border-gray-200">{row.scenarioB}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#1e5c2a] border-l border-gray-200">
                      {row.optimal}
                      <div className="text-xs text-green-600 mt-1">Recommended</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components with Clean Professional Style
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <select
          className="w-full rounded-lg border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
          ▼
        </div>
      </div>
    </div>
  );
}

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

function WeatherCard({ weather }) {
  const getWeatherIcon = (conditions) => {
    switch(conditions) {
      case 'Rain': return '🌧️';
      case 'Clouds': return '☁️';
      case 'Clear': return '☀️';
      case 'Thunderstorm': return '⛈️';
      default: return '🌤️';
    }
  };

  const getAlertColor = (alertLevel) => {
    switch(alertLevel) {
      case 'high': return 'border-red-200';
      case 'medium': return 'border-orange-200';
      default: return 'border-green-200';
    }
  };

  const getAlertText = (alertLevel) => {
    switch(alertLevel) {
      case 'high': return 'High Alert';
      case 'medium': return 'Medium Alert';
      default: return 'Normal';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getAlertColor(weather.alertLevel)}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-bold text-gray-800 text-sm">{weather.state}</div>
          <div className="text-xs text-gray-500">{weather.capital}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl">{getWeatherIcon(weather.conditions)}</div>
          <div className={`text-xs mt-1 px-2 py-1 rounded font-medium ${
            weather.alertLevel === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
            weather.alertLevel === 'medium' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
            'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {getAlertText(weather.alertLevel)}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div className="text-xs text-gray-600">Temperature</div>
            <div className="font-bold text-gray-800">{weather.temperature}°C</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div className="text-xs text-gray-600">Humidity</div>
            <div className="font-bold text-gray-800">{weather.humidity}%</div>
          </div>
        </div>
        {weather.alertLevel !== 'low' && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border text-xs">
            <div className="font-medium text-gray-700 mb-1">{weather.impact}</div>
            <div className="text-gray-500">{weather.recommendation}</div>
          </div>
        )}
      </div>
    </div>
  );
}