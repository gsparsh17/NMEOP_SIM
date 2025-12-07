import React, { useState, useMemo } from "react";
import {
  STATES,
  YEARS,
  MONTHS,
  OIL_YEARS,
  stateWiseData,
  telanganaPriceData,
  getPriceData,
  getProductionData,
  vpFpVgpData,
  areaProductionData,
  nmeoOpProgress,
  clusterStatus,
  farmerRisk,
  missionAlignmentData,
  ffbPriceTrend,
  cpoPriceTrend,
  nmeoOPDetailedData
} from "../data/staticData";
import VPFPVGPChart from "../components/charts/VPFPVGPChart";
import AreaProductionChart from "../components/charts/AreaProductionChart";
import PriceTrendChart from "../components/charts/PriceTrendChart";
import NMEOProgressChart from "../components/charts/NMEOProgressChart";
import StateTargetsTable from "../components/charts/StateTargetsTable";
import HistoricalExpansionChart from "../components/charts/HistoricalExpansionChart";
import StabilityCard from "../components/cards/StabilityCard";

export default function ImpactDashboard() {
  const [stateFilter, setStateFilter] = useState("All-India");
  const [yearTypeFilter, setYearTypeFilter] = useState("financialYear");
  const [yearFilter, setYearFilter] = useState("2024-25");
  const [monthFilter, setMonthFilter] = useState(MONTHS[11]);
  const [region, setRegion] = useState("National");
  const [achievementTarget, setAchievementTarget] = useState("1000");
  const [achievementState, setAchievementState] = useState("Gujarat");
  const [achievementResult, setAchievementResult] = useState(null);
  const [loadingAchievement, setLoadingAchievement] = useState(false);
  const [achievementError, setAchievementError] = useState(null);

  // Get filtered data based on current filters
  const filteredData = useMemo(() => {
    const selectedYears = yearFilter === "All Years" ? 
      (yearTypeFilter === "financialYear" ? ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"] : 
       ["Nov-Oct 2019-20", "Nov-Oct 2020-21", "Nov-Oct 2021-22", "Nov-Oct 2022-23", "Nov-Oct 2023-24"]) 
      : [yearFilter];
    
    const selectedMonths = [monthFilter];

    return {
      priceData: getPriceData(stateFilter, yearTypeFilter, selectedYears, selectedMonths),
      productionData: getProductionData(stateFilter, selectedYears),
      stateInfo: stateWiseData[stateFilter] || stateWiseData["All-India"]
    };
  }, [stateFilter, yearTypeFilter, yearFilter, monthFilter]);

  // Compute average FFB / CPO for the selected year from Telangana price data
  const yearPriceSummary = useMemo(() => {
    if (!yearFilter || yearFilter === "All Years") return null;
    const yearType = yearTypeFilter; // e.g. 'financialYear' or 'oilYear'
    const dataArr = telanganaPriceData[yearType] || [];
    const yearObj = dataArr.find(y => y.year === yearFilter);
    if (!yearObj) return null;
    const monthsData = yearObj.data || [];
    const avg = (arr, key) => {
      const vals = arr.map(d => d[key]).filter(v => typeof v === 'number');
      if (!vals.length) return null;
      return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
    };
    return {
      avgFFB: avg(monthsData, 'ffb'),
      avgCPO: avg(monthsData, 'cpo'),
      monthsCount: monthsData.length
    };
  }, [yearFilter, yearTypeFilter]);

  // Compute selected price point (month-specific or year-average) from telanganaPriceData
  const selectedPricePoint = useMemo(() => {
    if (!yearFilter || yearFilter === "All Years") return null;
    const dataArr = telanganaPriceData[yearTypeFilter] || [];
    const yearObj = dataArr.find(y => y.year === yearFilter);
    if (!yearObj) return null;
    const monthsData = yearObj.data || [];
    const avg = (arr, key) => {
      const vals = arr.map(d => d[key]).filter(v => typeof v === 'number');
      if (!vals.length) return null;
      return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
    };

    if (monthFilter) {
      const monthObj = monthsData.find(m => m.month === monthFilter);
      if (monthObj) return { ffb: monthObj.ffb, cpo: monthObj.cpo, label: `${monthFilter} ${yearFilter}` };
    }

    return { ffb: avg(monthsData, 'ffb'), cpo: avg(monthsData, 'cpo'), label: `${yearFilter} (avg)` };
  }, [yearFilter, monthFilter, yearTypeFilter]);

  // Compute price cards data (respecting filters). Prefer selectedPricePoint (telangana proxy),
  // otherwise aggregate from filteredData.priceData so Year="All Years" still shows values.
  const priceCards = useMemo(() => {
    if (selectedPricePoint) return selectedPricePoint;
    if (!filteredData || !filteredData.priceData) return null;
    const entries = filteredData.priceData.flatMap(yd => (
      (yd.data || []).filter(m => m.month === monthFilter)
        .map(m => ({ ffb: m.ffb, cpo: m.cpo }))
    ));
    if (!entries.length) return null;
    const avg = (arr, key) => {
      const vals = arr.map(d => d[key]).filter(v => typeof v === 'number');
      if (!vals.length) return null;
      return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
    };
    return { ffb: avg(entries, 'ffb'), cpo: avg(entries, 'cpo'), label: yearFilter === 'All Years' ? 'Selected' : `${yearFilter} (avg)` };
  }, [filteredData, selectedPricePoint, monthFilter, yearFilter]);

  // Get year options based on year type
  const yearOptions = yearTypeFilter === "financialYear" 
    ? ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26"]
    : ["Nov-Oct 2019-20", "Nov-Oct 2020-21", "Nov-Oct 2021-22", "Nov-Oct 2022-23", "Nov-Oct 2023-24", "Nov-Oct 2024-25"];

  // Get NMEO-OP progress data for the selected state
  const nmeoProgressData = useMemo(() => {
    if (stateFilter === "All-India") {
      return {
        currentArea: nmeoOPDetailedData.nationalTargets.area.current,
        target2025: nmeoOPDetailedData.nationalTargets.area.target2025,
        progressPercentage: nmeoOPDetailedData.nationalTargets.area.progressPercentage,
        productionCurrent: nmeoOPDetailedData.nationalTargets.production.current,
        productionTarget: nmeoOPDetailedData.nationalTargets.production.target2025
      };
    } else {
      const stateData = nmeoOPDetailedData.stateExpansionTargets[stateFilter];
      if (!stateData) return null;
      return {
        currentArea: stateData.currentArea / 1000, // Convert to '000 ha
        target2025: (stateData.currentArea + stateData.total) / 1000,
        progressPercentage: (stateData.currentArea / stateData.potentialArea) * 100,
        productionCurrent: null, // Not available in PDF
        productionTarget: null
      };
    }
  }, [stateFilter]);

  // Achievement Prediction API Call
  const fetchAchievementPrediction = async () => {
    if (!achievementTarget || !achievementState) {
      setAchievementError("Please enter target and select state");
      return;
    }

    setLoadingAchievement(true);
    setAchievementError(null);
    
    try {
      const response = await fetch("http://localhost:5000/predict-achievement", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          target: parseInt(achievementTarget),
          state: achievementState
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`API Request Failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Achievement Prediction Response:", data);
      setAchievementResult(data);
    } catch (err) {
      console.error("Achievement Prediction Error:", err);
      setAchievementError("Failed to fetch prediction. Please check connection.");
    } finally {
      setLoadingAchievement(false);
    }
  };

  // Calculate efficiency metrics
  const calculateEfficiency = (rate) => {
    if (rate >= 0.9) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (rate >= 0.7) return { label: "Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (rate >= 0.5) return { label: "Moderate", color: "text-amber-600", bg: "bg-amber-100" };
    if (rate >= 0.3) return { label: "Low", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "Poor", color: "text-red-600", bg: "bg-red-100" };
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header - Blue Header */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">NMEO-OP Alignment Tracker</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>OFFICIAL MONITORING</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Monitor how tariff decisions impact NMEO-OP mission objectives and farmer sustainability
              </p>
              
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                <img 
                  src="/assets/ut.png" 
                  alt="Ministry Logo" 
                  className="w-6 h-6"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Mission Performance Dashboard</span>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="text-gray-600">Ministry of Agriculture</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Quick Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">National Target 2025-26</div>
                  <div className="text-sm text-gray-600">Oil Palm Area</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-700">
                    10.00 lakh ha
                  </div>
                  <div className="text-xs text-gray-500">From 3.70 lakh ha (2021)</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">Target: Additional 6.5 lakh ha under NMEO-OP</div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">CPO Production Target</div>
                  <div className="text-sm text-gray-600">By 2025-26</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">
                    11.20 lakh tonnes
                  </div>
                  <div className="text-xs text-gray-500">From 2.72 lakh tonnes (2021)</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">Target: 4x increase in domestic CPO production</div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Current Import Dependency</div>
                  <div className="text-sm text-gray-600">Palm Oil Imports</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-700">
                    97%
                  </div>
                  <div className="text-xs text-gray-500">₹80,000 crore/year</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">NMEO-OP aims to reduce import dependency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters - Blue Header */}
      

      {/* Achievement Prediction API Section - Blue Header */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">AI-Powered Achievement Predictor</h3>
                <p className="text-sm opacity-90">
                  Predict NMEO-OP mission achievement based on state historical rates
                </p>
              </div>
            </div>
            <div className="text-xs px-2 py-1 bg-white/20 rounded">
              MACHINE LEARNING MODEL
            </div>
          </div>
        </div> */}
        
        {/* <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
            {/* Input Panel */}
            {/* <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h4 className="font-bold text-gray-800 mb-4">Prediction Parameters</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target (Area in hectares)
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                        value={achievementTarget}
                        onChange={(e) => setAchievementTarget(e.target.value)}
                        placeholder="Enter target (e.g., 1000)"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Expected area expansion target for the year
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/UT
                      </label>
                      <select
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                        value={achievementState}
                        onChange={(e) => setAchievementState(e.target.value)}
                      >
                        <option value="">Select State</option>
                        {STATES.filter(state => state !== "All-India").map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-500 mt-1">
                        Select state for historical performance analysis
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchAchievementPrediction}
                      disabled={loadingAchievement || !achievementTarget || !achievementState}
                      className="px-6 py-3 bg-[#003366] text-white rounded-lg font-medium hover:bg-[#164523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingAchievement ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Running Prediction...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Predict Achievement
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (filteredData.stateInfo.totalExpansionTarget) {
                          setAchievementTarget(filteredData.stateInfo.totalExpansionTarget.toString());
                          setAchievementState(stateFilter !== "All-India" ? stateFilter : "Gujarat");
                        }
                      }}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      Use Current State Target
                    </button>
                  </div>
                  
                  {achievementError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      ⚠️ {achievementError}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-2">How it works:</h5>
                  <ul className="text-sm text-gray-600 space-y-1 ml-5 list-disc">
                    <li>Uses historical state-wise achievement rates (2014-2020 data)</li>
                    <li>Applies ML model to predict likely achievement percentage</li>
                    <li>Considers state-specific implementation capacity</li>
                    <li>Helps in realistic target setting and resource allocation</li>
                  </ul>
                </div>
              </div>
            </div> */}
            
            {/* Results Panel */}
            {/* <div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-5 h-full">
                <h4 className="font-bold text-blue-900 mb-4">Prediction Results</h4>
                
                {achievementResult ? (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Predicted Achievement</div>
                      <div className="text-3xl font-bold text-blue-700">
                        {achievementResult.predicted_achievement.toLocaleString()} ha
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        From target of {achievementResult.target.toLocaleString()} ha
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">State Achievement Rate</span>
                          <span className="text-lg font-bold text-green-600">
                            {(achievementResult.rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-500 transition-all duration-300"
                            style={{ width: `${Math.min(achievementResult.rate * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Historical achievement rate for {achievementResult.state}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${calculateEfficiency(achievementResult.rate).bg} ${calculateEfficiency(achievementResult.rate).color} border-current`}>
                        <div className="font-medium mb-1">Efficiency Rating</div>
                        <div className="text-sm">
                          {calculateEfficiency(achievementResult.rate).label} • {((achievementResult.predicted_achievement / achievementResult.target) * 100).toFixed(1)}% target achievement
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                        <div className="font-medium mb-2">AI Insights:</div>
                        <div className="space-y-1">
                          {achievementResult.rate >= 0.9 ? (
                            <>
                              <div className="flex items-center gap-2 text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>State has excellent track record</span>
                              </div>
                              <div>Likely to exceed target with current support</div>
                            </>
                          ) : achievementResult.rate >= 0.7 ? (
                            <>
                              <div className="flex items-center gap-2 text-blue-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Good historical performance</span>
                              </div>
                              <div>Target is realistic with proper implementation</div>
                            </>
                          ) : achievementResult.rate >= 0.5 ? (
                            <>
                              <div className="flex items-center gap-2 text-amber-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Moderate achievement rate</span>
                              </div>
                              <div>May need additional support to reach target</div>
                            </>
                          ) : achievementResult.rate >= 0.3 ? (
                            <>
                              <div className="flex items-center gap-2 text-orange-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>Low achievement rate</span>
                              </div>
                              <div>Consider reviewing target or increasing support</div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-red-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Poor historical performance</span>
                              </div>
                              <div>Significant intervention needed to achieve target</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setAchievementTarget("");
                          setAchievementResult(null);
                          setAchievementError(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Clear Results
                      </button> */}
                      {/* <button className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm">
                        Export Prediction
                      </button> */}
                    {/* </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-700 mb-2">No Prediction Yet</h4>
                    <p className="text-sm text-gray-600">
                      Enter target and select state, then click "Predict Achievement" to see results
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        
        <div className="p-6">
          <div className="flex flex-wrap gap-6 items-end justify-center">
            <FilterSelect
              label="State/UT"
              value={stateFilter}
              onChange={setStateFilter}
              options={STATES}
            />
            <FilterSelect
              label="Year"
              value={yearFilter}
              onChange={setYearFilter}
              options={yearOptions}
            />
          </div>
        </div>
      </div>

      {/* Mission Status Overview - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">NMEO-OP Mission Status - {stateFilter}</h3>
            </div>
            <div className="text-sm">2025-26 Target Tracking</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MissionProgress 
              title="Area Expansion"
              current={stateFilter === "All-India" 
                ? nmeoOPDetailedData.nationalTargets.area.current 
                : (filteredData.stateInfo.areaCovered / 1000).toFixed(2)}
              target={stateFilter === "All-India" 
                ? nmeoOPDetailedData.nationalTargets.area.target2025 
                : ((filteredData.stateInfo.areaCovered + filteredData.stateInfo.totalExpansionTarget) / 1000).toFixed(2)}
              unit="lakh ha"
              status={stateFilter === "All-India" ? "on-track" : 
                     filteredData.stateInfo.coveragePercentage > 50 ? "on-track" :
                     filteredData.stateInfo.coveragePercentage > 30 ? "improving" :
                     filteredData.stateInfo.coveragePercentage > 10 ? "stable" : "needs-attention"}
              description={stateFilter === "All-India" 
                ? "National target: 10 lakh ha by 2025-26" 
                : `${filteredData.stateInfo.coveragePercentage}% of potential area covered`}
            />
            <MissionProgress 
              title="Production Growth"
              current={nmeoOPDetailedData.nationalTargets.production.current}
              target={nmeoOPDetailedData.nationalTargets.production.target2025}
              unit="lakh tonnes"
              status={stateFilter === "All-India" ? "improving" : "stable"}
              description={stateFilter === "All-India" 
                ? "Target: 11.20 lakh tonnes CPO by 2025-26" 
                : "State production data being compiled"}
            />
          </div>
        </div>
      </div>

       

      {/* State Overview Card - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                State Overview - {stateFilter}
              </h3>
              <p className="text-sm opacity-90">
                NMEO-OP Implementation Status
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{filteredData.stateInfo.coveragePercentage}%</div>
              <div className="text-sm opacity-90">Area Coverage</div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{filteredData.stateInfo.coveragePercentage}%</div>
                <div className="text-sm text-blue-600 mt-1">Potential Area Covered</div>
                <div className="text-xs text-gray-500 mt-1">
                  {filteredData.stateInfo.areaCovered?.toLocaleString()} / {filteredData.stateInfo.potentialArea?.toLocaleString()} ha
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {yearPriceSummary && yearPriceSummary.avgFFB ? `₹${yearPriceSummary.avgFFB.toLocaleString()}` : (filteredData.stateInfo.currentFFBPrice ? `₹${filteredData.stateInfo.currentFFBPrice}` : '—')}
                </div>
                <div className="text-sm text-green-600 mt-1">Avg FFB (₹/MT)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {filteredData.stateInfo.OER ? `OER: ${filteredData.stateInfo.OER}%` : 'OER: —'}
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">
                  {filteredData.stateInfo.totalExpansionTarget?.toLocaleString() || '—'}
                </div>
                <div className="text-sm text-orange-600 mt-1">NMEO-OP Target (ha)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stateFilter !== "All-India" && nmeoOPDetailedData.stateExpansionTargets[stateFilter] 
                    ? `${(nmeoOPDetailedData.stateExpansionTargets[stateFilter].total / 1000).toFixed(1)}K ha (5-yr)`
                    : "5-year expansion target"}
                </div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">
                  {yearPriceSummary && yearPriceSummary.avgCPO ? `₹${yearPriceSummary.avgCPO.toLocaleString()}` : (filteredData.stateInfo.currentCPOPrice ? `₹${filteredData.stateInfo.currentCPOPrice}` : '—')}
                </div>
                <div className="text-sm text-yellow-600 mt-1">Avg CPO (₹/MT)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {filteredData.stateInfo.currentCPOPrice ? 'Latest available' : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* NMEO-OP Detailed Progress Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">NMEO-OP Mission Progress</h3>
                <p className="text-sm opacity-90">
                  {stateFilter === "All-India" 
                    ? "National Targets: 10 lakh ha by 2025-26 | 11.20 lakh tonnes CPO" 
                    : `${stateFilter} 5-Year Target: ${filteredData.stateInfo.totalExpansionTarget?.toLocaleString()} ha`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">
                {stateFilter === "All-India" 
                  ? `${nmeoOPDetailedData.nationalTargets.area.progressPercentage.toFixed(1)}%`
                  : `${filteredData.stateInfo.coveragePercentage?.toFixed(1)}%`
                }
              </div>
              <div className="text-sm opacity-90">
                {stateFilter === "All-India" ? "2025 Target Progress" : "Area Coverage"}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <NMEOProgressChart 
            selectedState={stateFilter}
            stateData={filteredData.stateInfo}
          />
        </div>
      </div>

      {/* State-wise Targets and Historical Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        {/* State Targets Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h4 className="font-bold">
              {stateFilter === "All-India" ? "State-wise NMEO-OP Targets" : `${stateFilter} NMEO-OP Targets`}
            </h4>
            <p className="text-sm opacity-90">5-year area expansion targets (2021-22 to 2025-26)</p>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-4">
              Detailed breakdown of NMEO-OP expansion targets by state. Targets are based on potential area identified by the 2020 Re-assessment Committee.
            </p>
            <StateTargetsTable selectedState={stateFilter} />
          </div>
        </div>

      </div>

      {/* Key Charts - Blue Header for first chart, Plain for second */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Price Trends Section - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold">FFB & CPO Price Trends</h4>
              <p className="text-sm opacity-90">Monthly price movement analysis</p>
            </div>
            <div className="text-sm opacity-90">
              {stateFilter} • {yearTypeFilter}
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Monthly price movement of Fresh Fruit Bunches and Crude Palm Oil.
          </p>
          <PriceTrendChart ffbData={ffbPriceTrend} cpoData={cpoPriceTrend} selectedState={stateFilter}/>
        </div>
      </div>


                 {/* Historical Expansion Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h4 className="font-bold">Historical Area Expansion</h4>
            <p className="text-sm opacity-90">Annual targets vs achievements (2014-15 to 2020-21)</p>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-4">
              Historical performance of area expansion under previous schemes (NMOOP/NFSM-OP). Shows achievement rates and annual progress.
            </p>
            <HistoricalExpansionChart selectedState={stateFilter} />
          </div>
        </div>

      </div>

      

      {/* State Production Data (if available) */}
      {stateFilter !== "All-India" && filteredData.stateInfo.productionData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h4 className="font-bold">{stateFilter} Production History</h4>
            <p className="text-sm opacity-90">FFB and CPO production data (2014-15 to 2020-21)</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-right">FFB Production (MT)</th>
                    <th className="px-4 py-2 text-right">CPO Production (MT)</th>
                    <th className="px-4 py-2 text-right">Area Expansion Target (ha)</th>
                    <th className="px-4 py-2 text-right">Area Expansion Achieved (ha)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(filteredData.stateInfo.productionData).map(([year, data]) => (
                    <tr key={year} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{year}</td>
                      <td className="px-4 py-2 text-right">
                        {data.ffb ? data.ffb.toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {data.cpo ? data.cpo.toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {data.areaTarget ? data.areaTarget : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {data.areaAchieved ? data.areaAchieved : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Policy Implications - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <h4 className="font-bold">Policy Implications</h4>
            <div className="ml-auto bg-white/20 px-2 py-1 rounded text-xs">
              OFFICIAL GUIDANCE
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">When Area Coverage is below 30%:</div>
              <ul className="text-blue-800 space-y-1 ml-5 list-disc">
                <li>Increase awareness campaigns about NMEO-OP benefits</li>
                <li>Strengthen extension services and farmer training</li>
                <li>Provide additional incentives for new adopters</li>
                <li>Develop processing infrastructure in underserved areas</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-900 mb-2">When Price Support is needed:</div>
              <ul className="text-green-800 space-y-1 ml-5 list-disc">
                <li>Activate Viability Gap Payment (VGP) mechanism</li>
                <li>Review import duty structure to protect domestic prices</li>
                <li>Ensure timely subsidy payments to farmers</li>
                <li>Monitor global CPO prices and adjust support accordingly</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="font-medium text-amber-900 mb-2">NMEO-OP Key Success Factors:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-bold text-amber-700">Price Assurance</div>
                <div className="text-amber-800">Viability Price (VP) = 14.61% of 5-yr avg CPO price</div>
              </div>
              <div>
                <div className="font-bold text-amber-700">Farmer Support</div>
                <div className="text-amber-800">₹20,000-29,000/ha planting material subsidy</div>
              </div>
              <div>
                <div className="font-bold text-amber-700">Infrastructure</div>
                <div className="text-amber-800">Processing mills & custom harvesting support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionProgress({ title, current, target, unit, status, description }) {
  const percentage = target ? ((parseFloat(current) / parseFloat(target)) * 100) : 0;
  
  const statusColor = status === "on-track" ? "text-green-600" : 
                     status === "improving" ? "text-blue-600" : 
                     status === "stable" ? "text-amber-600" : "text-red-600";
  
  const statusBg = status === "on-track" ? "bg-green-100" : 
                   status === "improving" ? "bg-blue-100" : 
                   status === "stable" ? "bg-amber-100" : "bg-red-100";
  
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-sm font-bold text-gray-700 mb-3">{title}</div>
      <div className="relative inline-block mb-3">
        <div className="w-20 h-20 rounded-full border-8 border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">{current}</div>
            <div className="text-xs text-gray-500">{unit}</div>
          </div>
        </div>
        <div 
          className={`absolute top-0 left-0 w-20 h-20 rounded-full border-8 ${statusColor} border-t-8 border-r-8 border-b-8 border-l-8 -rotate-45`}
          style={{ 
            clipPath: `inset(0 ${100 - Math.min(percentage, 100)}% 0 0)`,
            borderColor: status === "on-track" ? "#10b981" : 
                        status === "improving" ? "#3b82f6" : 
                        status === "stable" ? "#f59e0b" : "#ef4444"
          }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 mb-2">{description}</div>
      {target && target !== "—" && (
        <div className="text-xs text-gray-500 mb-2">Target: {target} {unit}</div>
      )}
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor} ${statusBg}`}>
        {status === "on-track" ? "ON TRACK" : 
         status === "improving" ? "IMPROVING" : 
         status === "stable" ? "STABLE" : "NEEDS ATTENTION"}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="min-w-[180px]">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <select
          className="w-full rounded-2xl border border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    </div>
  );
}