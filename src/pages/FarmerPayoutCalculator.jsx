import React, { useState, useEffect, useMemo } from "react";

export default function FarmerPayoutCalculator() {
  // --- State Management ---
  const [monthName, setMonthName] = useState("November");
  const [year, setYear] = useState(2025);
  const [spotPrice, setSpotPrice] = useState("");
  const [vpBaseCpo, setVpBaseCpo] = useState("");
  const [wpiFactor, setWpiFactor] = useState(1.15);
  
  const [usePredictedSpot, setUsePredictedSpot] = useState(true);
  const [useHistoricalVp, setUseHistoricalVp] = useState(true);
  
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // --- Constants ---
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const YEARS = [2023, 2024, 2025, 2026, 2027];
  const DEFAULT_WPI_FACTORS = [1.10, 1.15, 1.20, 1.25];

  // --- API Integration ---
  const fetchFarmerPayout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        month_name: monthName,
        year: parseInt(year)
      };
      
      // Add optional parameters based on user choices
      if (!usePredictedSpot && spotPrice) {
        requestBody.spot_price = parseFloat(spotPrice);
      }
      
      if (!useHistoricalVp && vpBaseCpo) {
        requestBody.vp_base_cpo = parseFloat(vpBaseCpo);
      }
      
      if (wpiFactor !== 1.15) {
        requestBody.wpi_factor = parseFloat(wpiFactor);
      }
      
      const response = await fetch("http://localhost:5000/farmer-payout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody),
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`API Request Failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Save to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        ...data,
        inputs: { monthName, year, spotPrice, vpBaseCpo, wpiFactor }
      };
      
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      setApiResult(data);
      console.log(data)
      
    } catch (err) {
      console.error("Farmer Payout Error:", err);
      setError(`Failed to calculate farmer payout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on initial load
  useEffect(() => {
    fetchFarmerPayout();
  }, []);

  // --- Derived Calculations ---
  const isVgpActive = useMemo(() => {
    if (!apiResult?.payout_breakdown) return false;
    return apiResult.payout_breakdown.VGP_Govt > 0;
  }, [apiResult]);

  const vgpPercentage = useMemo(() => {
    if (!apiResult?.payout_breakdown) return 0;
    const { VP_Target, VGP_Govt } = apiResult.payout_breakdown;
    return VP_Target > 0 ? (VGP_Govt / VP_Target * 100).toFixed(1) : 0;
  }, [apiResult]);

  const farmerSupportLevel = useMemo(() => {
    if (!apiResult?.payout_breakdown) return "Unknown";
    const { FP_Industry, VGP_Govt, Total_Farmer_Price } = apiResult.payout_breakdown;
    
    const industryShare = (FP_Industry / Total_Farmer_Price * 100);
    const govtShare = (VGP_Govt / Total_Farmer_Price * 100);
    
    if (govtShare > 30) return "High Government Support";
    if (govtShare > 15) return "Moderate Government Support";
    if (govtShare > 0) return "Low Government Support";
    return "Market Driven";
  }, [apiResult]);

  const financialImplications = useMemo(() => {
    if (!apiResult?.payout_breakdown) return null;
    
    const { FP_Industry, VGP_Govt } = apiResult.payout_breakdown;
    
    // Assumptions for calculation
    const nationalProduction = 9.5; // Million MT CPO equivalent
    const ffbProduction = nationalProduction;
    
    return {
      industryPayout: (FP_Industry * ffbProduction).toFixed(2), // Billion INR
      govtPayout: (VGP_Govt * ffbProduction ).toFixed(2), // Billion INR
      totalPayout: ((FP_Industry + VGP_Govt) * ffbProduction).toFixed(2) // Billion INR
    };
  }, [apiResult]);

  // --- Recommendation Logic ---
  const recommendations = useMemo(() => {
    if (!apiResult?.payout_breakdown) return [];
    
    const recs = [];
    const { Status, VGP_Govt, FP_Industry, VP_Target } = apiResult.payout_breakdown;
    
    recs.push(`Current Status: ${Status}`);
    
    if (VGP_Govt > 0) {
      recs.push(`VGP Required: ₹${VGP_Govt.toFixed(2)} per MT FFB`);
      recs.push(`Government needs to support farmers with ${vgpPercentage}% of target price`);
      
      if (VGP_Govt > 500) {
        recs.push("⚠️ High VGP indicates market prices are significantly below viability targets");
      }
    } else {
      recs.push("✅ Market prices are above viability targets");
      recs.push("No government support needed at current price levels");
    }
    
    // Seasonal recommendations
    const peakMonths = ["August", "September", "October"];
    const leanMonths = ["January", "February", "March"];
    
    if (peakMonths.includes(monthName)) {
      recs.push(`Peak season (${monthName}): Higher production may require enhanced VGP monitoring`);
    } else if (leanMonths.includes(monthName)) {
      recs.push(`Lean season (${monthName}): Lower production, watch for price volatility`);
    }
    
    // WPI factor recommendations
    if (wpiFactor > 1.2) {
      recs.push("High WPI factor: Consider inflation impact on long-term viability");
    }
    
    return recs;
  }, [apiResult, monthName, vgpPercentage, wpiFactor]);

  // --- Reset Functions ---
  const resetToDefaults = () => {
    setMonthName("November");
    setYear(2025);
    setSpotPrice("");
    setVpBaseCpo("");
    setWpiFactor(1.15);
    setUsePredictedSpot(true);
    setUseHistoricalVp(true);
    setApiResult(null);
    setError(null);
  };

  const loadExample = () => {
    setMonthName("September");
    setYear(2024);
    setSpotPrice("85");
    setVpBaseCpo("92");
    setWpiFactor(1.18);
    setUsePredictedSpot(false);
    setUseHistoricalVp(false);
  };

  // --- Render ---
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Farmer Payout Calculator</h1>
              <p className="mt-2 text-green-100">
                Calculate Viability Gap Payments (VGP) for oil palm farmers based on market prices
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-sm font-medium">Formula Price = Spot Price × 14.61%</div>
                <div className="text-sm mt-1">VGP = VP Target − Formula Price</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Controls */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
              <h2 className="text-xl font-bold">Input Parameters</h2>
              <p className="text-green-100 text-sm">Configure calculation parameters</p>
            </div>
            
            <div className="p-6">
              {/* Time Parameters */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Time Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                      value={monthName}
                      onChange={(e) => setMonthName(e.target.value)}
                    >
                      {MONTHS.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-green-500"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {YEARS.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Spot Price Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">CPO Spot Price</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Use AI Prediction</span>
                    <button
                      onClick={() => setUsePredictedSpot(!usePredictedSpot)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        usePredictedSpot ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          usePredictedSpot ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {!usePredictedSpot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPO Spot Price (₹/MT)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-green-500"
                      value={spotPrice}
                      onChange={(e) => setSpotPrice(e.target.value)}
                      placeholder="Enter spot price..."
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Current international CPO price per metric ton
                    </div>
                  </div>
                )}
                
                {usePredictedSpot && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">
                      Using AI-Predicted Spot Price
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Price will be predicted based on month and year
                    </div>
                  </div>
                )}
              </div>

              {/* VP Base CPO Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">VP Base CPO</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Use Historical Average</span>
                    <button
                      onClick={() => setUseHistoricalVp(!useHistoricalVp)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useHistoricalVp ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useHistoricalVp ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {!useHistoricalVp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VP Base CPO (₹/MT)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-green-500"
                      value={vpBaseCpo}
                      onChange={(e) => setVpBaseCpo(e.target.value)}
                      placeholder="Enter VP base price..."
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      5-year average CPO price for viability calculation
                    </div>
                  </div>
                )}
                
                {useHistoricalVp && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm font-medium text-amber-800">
                      Using Historical 5-Year Average
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      Based on last 60 months of CPO price data
                    </div>
                  </div>
                )}
              </div>

              {/* WPI Factor */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">WPI Inflation Factor</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WPI Factor (1.0 = No Inflation)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-green-500"
                    value={wpiFactor}
                    onChange={(e) => setWpiFactor(e.target.value)}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Adjusts VP for wholesale price inflation
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DEFAULT_WPI_FACTORS.map(factor => (
                    <button
                      key={factor}
                      onClick={() => setWpiFactor(factor)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        wpiFactor === factor
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={fetchFarmerPayout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Calculating...
                    </div>
                  ) : (
                    "Calculate Farmer Payout"
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={loadExample}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Load Example
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="w-full border border-red-300 text-red-700 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* API Status Panel */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
              <h2 className="text-xl font-bold">API Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Connection Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    apiResult ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {apiResult ? "Connected" : "Not Connected"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Data Source</span>
                  <span className="text-sm font-medium text-blue-600">
                    {apiResult?.spot_source || "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">VP Source</span>
                  <span className="text-sm font-medium text-amber-600">
                    {apiResult?.vp_source || "N/A"}
                  </span>
                </div>
                
                {apiResult && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Calculation Details:</div>
                    <div className="text-xs space-y-1">
                      <div>Month: {apiResult.month_index} ({monthName})</div>
                      <div>Year: {apiResult.year}</div>
                      <div>WPI Factor: {apiResult.wpi_factor}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-full lg:w-2/3">
          {/* Main Results Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Farmer Payout Results</h2>
                  <p className="text-green-100 text-sm">
                    {monthName} {year} • WPI Factor: {wpiFactor}
                  </p>
                </div>
                {apiResult?.payout_breakdown && (
                  <div className="mt-2 md:mt-0">
                    <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                      isVgpActive 
                        ? "bg-amber-500 text-white" 
                        : "bg-green-500 text-white"
                    }`}>
                      {isVgpActive ? "VGP REQUIRED" : "MARKET DRIVEN"}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {!apiResult ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">No Calculation Results</h3>
                  <p className="text-gray-500 mt-1">
                    Configure parameters and click "Calculate Farmer Payout"
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Price Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Spot CPO Price</div>
                      <div className="text-2xl font-bold text-blue-700">
                        ₹{apiResult.spot_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Source: {apiResult.spot_source}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">VP Base CPO</div>
                      <div className="text-2xl font-bold text-amber-700">
                        ₹{apiResult.vp_base_cpo.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Source: {apiResult.vp_source}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Final VP CPO</div>
                      <div className="text-2xl font-bold text-green-700">
                        ₹{apiResult.vp_cpo_final.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        WPI Adjusted (×{apiResult.wpi_factor})
                      </div>
                    </div>
                  </div>

                  {/* Payout Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Payout Breakdown (per MT FFB)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Formula Price (Industry Pays) */}
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-blue-800">Formula Price</div>
                            <div className="text-xs text-blue-600">Industry Pays</div>
                          </div>
                          <div className="text-2xl font-bold text-blue-700">
                            ₹{apiResult.payout_breakdown.FP_Industry.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <div>• Based on 14.61% of CPO spot price</div>
                          <div>• 75.25% on 10.15% of Weighted average price of
palm nuts</div>
                          {/* <div>• Paid by processing industry</div> */}
                        </div>
                      </div>

                      {/* VGP (Government Pays) */}
                      <div className={`rounded-xl p-5 border ${
                        isVgpActive 
                          ? "bg-amber-50 border-amber-200" 
                          : "bg-green-50 border-green-200"
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className={`text-sm font-medium ${
                              isVgpActive ? "text-amber-800" : "text-green-800"
                            }`}>
                              Viability Gap Payment
                            </div>
                            <div className={`text-xs ${
                              isVgpActive ? "text-amber-600" : "text-green-600"
                            }`}>
                              Government Pays
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${
                            isVgpActive ? "text-amber-700" : "text-green-700"
                          }`}>
                            ₹{apiResult.payout_breakdown.VGP_Govt.toFixed(2)}
                          </div>
                        </div>
                        <div className={`text-xs space-y-1 ${
                          isVgpActive ? "text-amber-700" : "text-green-700"
                        }`}>
                          <div>• VP Target − Formula Price</div>
                          <div>• Ensures minimum viable price</div>
                          <div>• Government subsidy when needed</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Farmer Receives */}
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-green-800">Total Farmer Receives</div>
                          <div className="text-sm text-green-600">Per Metric Ton of FFB</div>
                        </div>
                        <div className="text-3xl font-bold text-green-700">
                          ₹{apiResult.payout_breakdown.Total_Farmer_Price.toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600">Industry Share</div>
                          <div className="text-lg font-bold text-blue-700">
                            {apiResult.payout_breakdown.FP_Industry > 0 
                              ? ((apiResult.payout_breakdown.FP_Industry / apiResult.payout_breakdown.Total_Farmer_Price) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600">Govt Share</div>
                          <div className="text-lg font-bold text-amber-700">
                            {apiResult.payout_breakdown.VGP_Govt > 0 
                              ? ((apiResult.payout_breakdown.VGP_Govt / apiResult.payout_breakdown.Total_Farmer_Price) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600">Support Level</div>
                          <div className={`text-sm font-bold ${isVgpActive ? "text-amber-700" : "text-green-700"}`}>
                            {farmerSupportLevel}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
{apiResult?.payout_breakdown && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Price Calculation Breakdown</h3>
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">S. No.</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Details</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Amount (in ₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {/* Row 1: Net CPO Price */}
          <tr className="hover:bg-gray-50">
            <td className="py-3 px-4 text-sm text-gray-600">1</td>
            <td className="py-3 px-4 text-sm text-gray-800">
              Net CPO price per MT for the month of {monthName}, {year}
            </td>
            <td className="py-3 px-4 text-sm font-medium text-gray-900">
              {apiResult.spot_price.toFixed(2)}
            </td>
          </tr>
          
          {/* Row 2: 14.61% of Net CPO Price */}
          <tr className="hover:bg-gray-50">
            <td className="py-3 px-4 text-sm text-gray-600">2</td>
            <td className="py-3 px-4 text-sm text-gray-800">
              14.61% of Net CPO price
            </td>
            <td className="py-3 px-4 text-sm font-medium text-gray-900">
              {apiResult.payout_breakdown.FP_Industry ? (apiResult.spot_price * 0.1461).toFixed(2) : '0.00'}
            </td>
          </tr>
          
          {/* Row 3: Weighted Average Price of Palm Nuts */}
          {apiResult.payout_breakdown["Weighted Average price of palm nuts per MT"] && (
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-600">3</td>
              <td className="py-3 px-4 text-sm text-gray-800">
                Weighted average price of palm nuts per MT
              </td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                {apiResult.payout_breakdown["Weighted Average price of palm nuts per MT"].toFixed(2)}
              </td>
            </tr>
          )}
          
          {/* Row 4: 10.15% of Weighted Average Price */}
          {apiResult.payout_breakdown["10.15 percent of Weighted average price of palm nuts"] && (
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-600">4</td>
              <td className="py-3 px-4 text-sm text-gray-800">
                10.15% of Weighted average price of palm nuts
              </td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                {apiResult.payout_breakdown["10.15 percent of Weighted average price of palm nuts"].toFixed(2)}
              </td>
            </tr>
          )}
          
          {/* Row 5: 75.25% on 10.15% */}
          {apiResult.payout_breakdown["75.25 percent on 10.15 percent of Weighted average price of palm nuts"] && (
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-600">5</td>
              <td className="py-3 px-4 text-sm text-gray-800">
                75.25% on 10.15% of Weighted average price of palm nuts
              </td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                {apiResult.payout_breakdown["75.25 percent on 10.15 percent of Weighted average price of palm nuts"].toFixed(2)}
              </td>
            </tr>
          )}
          
          {/* Row 6: Total Formula Price Calculation */}
          <tr className="bg-blue-50">
            <td className="py-3 px-4 text-sm font-medium text-blue-800">6</td>
            <td className="py-3 px-4 text-sm font-medium text-blue-800">
              Formula Price (Industry Pays)
            </td>
            <td className="py-3 px-4 text-sm font-bold text-blue-900">
              ₹{apiResult.payout_breakdown.FP_Industry.toFixed(2)}
            </td>
          </tr>
          
          {/* Row 7: VP Target Price */}
          <tr className="bg-green-50">
            <td className="py-3 px-4 text-sm font-medium text-green-800">7</td>
            <td className="py-3 px-4 text-sm font-medium text-green-800">
              VP Target Price (per MT FFB)
            </td>
            <td className="py-3 px-4 text-sm font-bold text-green-900">
              ₹{apiResult.payout_breakdown.VP_Target.toFixed(2)}
            </td>
          </tr>
          
          {/* Row 8: Viability Gap Payment */}
          <tr className={`${apiResult.payout_breakdown.VGP_Govt > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
            <td className={`py-3 px-4 text-sm font-medium ${apiResult.payout_breakdown.VGP_Govt > 0 ? 'text-amber-800' : 'text-gray-800'}`}>
              8
            </td>
            <td className={`py-3 px-4 text-sm font-medium ${apiResult.payout_breakdown.VGP_Govt > 0 ? 'text-amber-800' : 'text-gray-800'}`}>
              Viability Gap Payment (VGP) Required
            </td>
            <td className={`py-3 px-4 text-sm font-bold ${apiResult.payout_breakdown.VGP_Govt > 0 ? 'text-amber-900' : 'text-gray-900'}`}>
              ₹{apiResult.payout_breakdown.VGP_Govt.toFixed(2)}
            </td>
          </tr>
          
          {/* Row 9: Total Farmer Receives */}
          <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200">
            <td className="py-4 px-4 text-lg font-bold text-green-900"></td>
            <td className="py-4 px-4 text-lg font-bold text-green-900">
              Total Farmer Receives (per MT FFB)
            </td>
            <td className="py-4 px-4 text-2xl font-bold text-green-900">
              ₹{apiResult.payout_breakdown.Total_Farmer_Price.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    {/* Summary Card */}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="text-sm text-blue-600 mb-1">Formula Calculation</div>
        <div className="text-lg font-bold text-blue-800">
          14.61% of CPO + 75.25% of (10.15% of Palm Nuts)
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="text-sm text-green-600 mb-1">VP Target Formula</div>
        <div className="text-lg font-bold text-green-800">
          14.61% of (VP Base CPO × WPI Factor)
        </div>
      </div>
      
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="text-sm text-amber-600 mb-1">VGP Formula</div>
        <div className="text-lg font-bold text-amber-800">
          VP Target − Formula Price
        </div>
      </div>
    </div>
  </div>
)}

                  {/* Additional Calculations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Conversion Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {apiResult.payout_breakdown["Weighted Average price of palm nuts per MT"] && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-sm text-gray-600">Palm Nuts per MT</div>
                          <div className="text-lg font-bold text-gray-800">
                            ₹{apiResult.payout_breakdown["Weighted Average price of palm nuts per MT"].toFixed(2)}
                          </div>
                        </div>
                      )}
                      
                      {apiResult.payout_breakdown["10.15 percent of Weighted average price of palm nuts"] && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-sm text-gray-600">10.15% of Nuts Price per MT</div>
                          <div className="text-lg font-bold text-gray-800">
                            ₹{apiResult.payout_breakdown["10.15 percent of Weighted average price of palm nuts"].toFixed(2)}
                          </div>
                        </div>
                      )}
                      
                      {apiResult.payout_breakdown["75.25 percent on 10.15 percent of Weighted average price of palm nuts"] && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-sm text-gray-600">75.25% Conversion of 10.15% of Nuts Price per MT</div>
                          <div className="text-lg font-bold text-gray-800">
                            ₹{apiResult.payout_breakdown["75.25 percent on 10.15 percent of Weighted average price of palm nuts"].toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Implications */}
                  {/* {financialImplications && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">National Financial Implications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                          <div className="text-sm text-blue-600 mb-2">Industry Payout</div>
                          <div className="text-2xl font-bold text-blue-700">
                            ₹{financialImplications.industryPayout}M
                          </div>
                          <div className="text-xs text-blue-600 mt-1">Annual industry payment to farmers</div>
                        </div>
                        
                        <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
                          <div className="text-sm text-amber-600 mb-2">Government VGP</div>
                          <div className="text-2xl font-bold text-amber-700">
                            ₹{financialImplications.govtPayout}M
                          </div>
                          <div className="text-xs text-amber-600 mt-1">Annual government subsidy</div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                          <div className="text-sm text-green-600 mb-2">Total Farmer Income</div>
                          <div className="text-2xl font-bold text-green-700">
                            ₹{financialImplications.totalPayout}M
                          </div>
                          <div className="text-xs text-green-600 mt-1">Total annual farmer payments</div>
                        </div>
                      </div>
                    </div>
                  )} */}

                  {/* Recommendations */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <span className="text-xl">💡</span> Policy Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <span className="text-blue-900">{rec}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {isVgpActive && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="font-medium text-amber-800 mb-2">⚠️ VGP Required Action:</div>
                        <div className="text-sm text-amber-700">
                          Government needs to allocate ₹{financialImplications?.govtPayout || "0"}B for VGP payments 
                          to ensure farmer viability at current market prices.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calculation History */}
          {/* {history.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white p-4">
                <h2 className="text-xl font-bold">Calculation History</h2>
                <p className="text-purple-100 text-sm">Last 10 calculations</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {history.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                      onClick={() => {
                        setApiResult(entry);
                        setMonthName(entry.inputs.monthName);
                        setYear(entry.inputs.year);
                        setSpotPrice(entry.inputs.spotPrice);
                        setVpBaseCpo(entry.inputs.vpBaseCpo);
                        setWpiFactor(entry.inputs.wpiFactor);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">
                            {entry.inputs.monthName} {entry.inputs.year}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Spot: ₹{entry.spot_price.toFixed(2)} • VP: ₹{entry.vp_cpo_final.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.payout_breakdown.VGP_Govt > 0 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {entry.payout_breakdown.VGP_Govt > 0 ? "VGP" : "Market"}
                          </div>
                          <div className="text-lg font-bold text-purple-700">
                            ₹{entry.payout_breakdown.Total_Farmer_Price.toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {entry.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}