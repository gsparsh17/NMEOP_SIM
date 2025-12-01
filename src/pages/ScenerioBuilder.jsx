import React, { useState, useMemo, useEffect } from "react";
import PricesTab from "../components/charts/PriceCharts";
import ImportsFXCharts from "../components/charts/ImportsFXCharts";
import FiscalImpactChart from "../components/charts/FiscalImpactChart";
import TabPill from "../components/cards/TabPill";
import { 
  liveMarket, 
  ffbPriceTrend, 
  cpoPriceTrend,
  bearingPotential,
  stateWiseData,
  telanganaPriceData,
  getPriceData,
  nmeoOpProgress
} from "../data/staticData";

export default function ScenarioBuilder() {
  const [duty, setDuty] = useState(5);
  const [cess, setCess] = useState(7.5);
  const [fx, setFx] = useState(83.5);
  const [globalShock, setGlobalShock] = useState("No Shock");
  const [weatherRisk, setWeatherRisk] = useState("Normal");
  const [clusterStatus, setClusterStatus] = useState("Expanding Well");
  const [fxShock, setFxShock] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");
  const [seasonalMonth, setSeasonalMonth] = useState("October");
  const [plantationAge, setPlantationAge] = useState(7);
  const [selectedState, setSelectedState] = useState("Telangana");

  // Get current state data
  const currentStateData = stateWiseData[selectedState] || stateWiseData["Telangana"];

  // Calculate current yield based on plantation age
  const currentYield = useMemo(() => {
    const ageData = bearingPotential.find(age => age.age === plantationAge);
    return ageData ? ageData.yield : 18.0; // Default to max yield
  }, [plantationAge]);

  // Enhanced FFB Price seasonality analysis from comprehensive data
  const seasonalPattern = useMemo(() => {
    const monthlyPrices = {};
    
    // Use Telangana financial year data for comprehensive analysis
    const telanganaData = telanganaPriceData.financialYear;
    
    telanganaData.forEach(yearData => {
      yearData.data.forEach(monthData => {
        if (!monthlyPrices[monthData.month]) {
          monthlyPrices[monthData.month] = [];
        }
        monthlyPrices[monthData.month].push(monthData.ffb);
      });
    });

    // Calculate average prices by month
    const avgPrices = {};
    Object.keys(monthlyPrices).forEach(month => {
      const prices = monthlyPrices[month];
      avgPrices[month] = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    });

    return avgPrices;
  }, []);

  // Get current seasonal price based on selected month
  const currentSeasonalPrice = useMemo(() => {
    return seasonalPattern[seasonalMonth] || 18000; // Default fallback
  }, [seasonalMonth, seasonalPattern]);

  // Enhanced season analysis with historical context
  const seasonAnalysis = useMemo(() => {
    const prices = Object.values(seasonalPattern);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const peakMonth = Object.keys(seasonalPattern).find(month => 
      seasonalPattern[month] === maxPrice
    );
    const leanMonth = Object.keys(seasonalPattern).find(month => 
      seasonalPattern[month] === minPrice
    );

    // Calculate price volatility
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);

    return {
      peakMonth,
      leanMonth,
      maxPrice,
      minPrice,
      avgPrice,
      volatility,
      priceVariation: ((maxPrice - minPrice) / minPrice * 100).toFixed(1),
      seasonalIndex: ((currentSeasonalPrice - minPrice) / (maxPrice - minPrice) * 100).toFixed(0)
    };
  }, [seasonalPattern, currentSeasonalPrice]);

  // State-specific recommendations
  const stateSpecificContext = useMemo(() => {
    const context = {
      strengths: [],
      challenges: [],
      recommendations: []
    };

    if (selectedState === "Andhra Pradesh") {
      context.strengths.push("Largest oil palm area in India (1.85 lakh ha)");
      context.strengths.push("19 processing mills with 240 MT/hr capacity");
      context.strengths.push("35% potential area coverage");
      context.challenges.push("Need to achieve remaining 65% of potential area");
      context.recommendations.push("Focus on area expansion in high-potential districts");
    } else if (selectedState === "Telangana") {
      context.strengths.push("High OER ratio (18.04%)");
      context.strengths.push("Strong processing capacity (60 MT/hr)");
      context.strengths.push("Best performing district: Bhadradri Kothagudem");
      context.challenges.push("Low potential area coverage (4.9%)");
      context.recommendations.push("Aggressive area expansion to utilize 436,325 ha potential");
    } else if (selectedState === "Karnataka") {
      context.strengths.push("65% potential area coverage achieved");
      context.strengths.push("4 processing mills with 21 MT/hr capacity");
      context.strengths.push("Strong farmer retention");
      context.recommendations.push("Focus on yield improvement in existing areas");
    }

    return context;
  }, [selectedState]);

  const recommendation = useMemo(() => {
    let lines = [];

    // State-specific context
    lines.push(`Analysis for ${selectedState}:`);
    if (stateSpecificContext.strengths.length > 0) {
      lines.push(`Strengths: ${stateSpecificContext.strengths.join(', ')}`);
    }

    // Global price context
    if (liveMarket.status === "Shock" || globalShock === "Severe Increase") {
      lines.push(
        "Global prices are under stress. Very high duties could sharply raise consumer prices."
      );
    } else if (liveMarket.status === "Volatile") {
      lines.push(
        "Markets are volatile. Duty changes should be gradual and closely monitored."
      );
    } else {
      lines.push(
        "Global prices are stable. Govt has more flexibility to fine-tune duty for farmer support."
      );
    }

    // Weather / domestic supply context
    if (weatherRisk === "Heat Stress" || weatherRisk === "Drought Risk") {
      lines.push(
        "Upcoming weather conditions could reduce domestic production. Keeping duty moderate can prevent shortages."
      );
    } else {
      lines.push(
        "Weather forecast is normal. Duty can be used more aggressively to protect farmer incomes during peak production."
      );
    }

    // Seasonal considerations
    if (seasonalMonth === seasonAnalysis.peakMonth) {
      lines.push(
        `Currently in peak production season (${seasonalMonth}). Higher duties can protect farmers from import competition during high supply.`
      );
    } else if (seasonalMonth === seasonAnalysis.leanMonth) {
      lines.push(
        `Currently in lean production season (${seasonalMonth}). Consider lower duties to ensure adequate supply and control consumer prices.`
      );
    } else {
      lines.push(
        `Current seasonal index: ${seasonAnalysis.seasonalIndex}% (0% = lean, 100% = peak)`
      );
    }

    // Plantation age considerations
    if (plantationAge <= 5) {
      lines.push(
        `Young plantations (${plantationAge} years) have lower yields (${currentYield} MT/ha). Supportive policies needed for farmer viability during establishment phase.`
      );
    } else if (plantationAge >= 8) {
      lines.push(
        `Mature plantations (${plantationAge} years) at peak yield (${currentYield} MT/ha). Focus on maintaining productivity and quality.`
      );
    }

    // Duty level interpretation
    if (duty >= 15) {
      lines.push(
        "Current duty level is high. This strongly protects domestic farmers but may increase retail prices and encourage switching to other oils."
      );
    } else if (duty <= 5) {
      lines.push(
        "Duty is low. This helps consumers and refiners but may reduce the benefit of NMEO-OP for farmers if FP falls below VP."
      );
    } else {
      lines.push(
        "Duty is in a moderate band. This is typically used to balance farmer support and consumer protection."
      );
    }

    if (fxShock) {
      lines.push(
        "Rupee weakness (higher ₹/USD) already makes imports costlier. Even without duty changes, FX outflow is a concern."
      );
    }

    if (clusterStatus === "Slowing") {
      lines.push(
        "Cluster expansion is slowing. A supportive duty plus timely VGP payments can reassure farmers to stay with oil palm."
      );
    }

    // Add state-specific recommendations
    stateSpecificContext.recommendations.forEach(rec => {
      lines.push(rec);
    });

    return lines;
  }, [duty, globalShock, weatherRisk, fxShock, clusterStatus, seasonalMonth, seasonAnalysis, plantationAge, currentYield, selectedState, stateSpecificContext]);

  // Enhanced simulation results with state-specific data
  const simulationResults = useMemo(() => {
    const baseImportCost = 130; // $/ton base CPO price
    const domesticProduction = currentYield * (currentStateData.areaCovered / 10000) * 0.22; // FFB to CPO conversion
    const importVolume = 9.5 - domesticProduction; // Million tons
    
    // Duty impact calculations
    const totalTariff = duty + cess;
    const landedCost = baseImportCost * (1 + totalTariff/100) * fx;
    const farmerPriceImpact = duty * 150; // ₹ per % duty
    const fiscalCost = Math.max(0, (18000 - (currentSeasonalPrice + farmerPriceImpact)) * 0.1); // VGP estimate
    
    // State-specific self-sufficiency
    const stateSelfSufficiency = ((domesticProduction / 9.5) * 100).toFixed(1);
    const nationalSelfSufficiency = ((nmeoOpProgress.productionCurrent / 19.3) * 100).toFixed(1); // Based on 2023 consumption
    
    return {
      importVolume: Math.max(0, importVolume).toFixed(2),
      landedCost: landedCost.toFixed(0),
      farmerPrice: Math.round(currentSeasonalPrice + farmerPriceImpact),
      fiscalCost: fiscalCost.toFixed(0),
      selfSufficiency: stateSelfSufficiency,
      nationalSelfSufficiency: nationalSelfSufficiency,
      stateProduction: domesticProduction.toFixed(2),
      oer: currentStateData.OER || 16.0
    };
  }, [duty, cess, fx, currentYield, currentSeasonalPrice, currentStateData]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header - Blue Header */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Tariff Strategy Builder</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>OFFICIAL TOOL</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Simulate different customs duty scenarios incorporating FFB production seasonality, plantation maturity, and state-specific conditions
              </p>
              
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                <img 
                  src="/assets/ut.png" 
                  alt="Ministry Logo" 
                  className="w-6 h-6"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Customs & Tariff Simulation</span>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="text-gray-600">Ministry of Agriculture</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Enhanced Controls Panel - Plain Header */}
        <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h3 className="text-lg font-bold">Policy Parameters</h3>
            <p className="text-sm mt-1">Configure simulation scenarios</p>
          </div>
          
          <div className="p-6">
            {/* State Selection */}
            <SelectInput
              label="State Analysis"
              state={selectedState}
              setState={setSelectedState}
              options={Object.keys(stateWiseData).filter(state => state !== "All-India")}
            />

            <ControlSlider
              label="Basic Customs Duty"
              value={duty}
              min={0}
              max={25}
              setValue={setDuty}
              explanation="Higher duty protects farmers but increases consumer prices"
            />

            <ControlInput
              label="Additional Cesses"
              value={cess}
              setValue={setCess}
              explanation="Sector-specific levies and charges"
            />

            <ControlInput
              label="Exchange Rate (₹ per USD)"
              value={fx}
              setValue={setFx}
              explanation="Weaker rupee increases import costs"
            />

            <SelectInput
              label="Production Season"
              state={seasonalMonth}
              setState={setSeasonalMonth}
              options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]}
            />

            <SelectInput
              label="Plantation Age (Years)"
              state={plantationAge}
              setState={setPlantationAge}
              options={[4, 5, 6, 7, 8, 9, 10]}
            />

            <SelectInput
              label="Global Market Condition"
              state={globalShock}
              setState={setGlobalShock}
              options={["No Shock", "Mild Increase", "Moderate Increase", "Severe Increase"]}
            />

            <SelectInput
              label="Weather / Production Risk"
              state={weatherRisk}
              setState={setWeatherRisk}
              options={["Normal", "Heat Stress", "Drought Risk"]}
            />

            <SelectInput
              label="Cluster Expansion Status"
              state={clusterStatus}
              setState={setClusterStatus}
              options={["Expanding Well", "Moderate", "Slowing"]}
            />

            <ToggleSwitch
              label="Rupee Depreciation Risk"
              value={fxShock}
              setValue={setFxShock}
            />

            {/* Enhanced Seasonal Information Panel */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-800 text-sm mb-2">
                {selectedState} - Seasonal Context
              </h4>
              <div className="text-xs text-amber-700 space-y-1">
                <div>Current Month: <strong>{seasonalMonth}</strong></div>
                <div>Expected FFB Price: <strong>₹{currentSeasonalPrice.toLocaleString()}/MT</strong></div>
                <div>Plantation Yield: <strong>{currentYield} MT/Ha</strong></div>
                <div>Seasonal Index: <strong>{seasonAnalysis.seasonalIndex}%</strong></div>
                <div>Price Volatility: <strong>₹{Math.round(seasonAnalysis.volatility).toLocaleString()}</strong></div>
                <div className="flex justify-between">
                  <span>Peak: {seasonAnalysis.peakMonth}</span>
                  <span>Lean: {seasonAnalysis.leanMonth}</span>
                </div>
              </div>
            </div>

            {/* State Capacity Panel */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">State Capacity</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>Area Covered: <strong>{currentStateData.areaCovered?.toLocaleString()} ha</strong></div>
                <div>Potential Area: <strong>{currentStateData.potentialArea?.toLocaleString()} ha</strong></div>
                <div>Coverage: <strong>{currentStateData.coveragePercentage}%</strong></div>
                {currentStateData.processingMills && (
                  <div>Processing Mills: <strong>{currentStateData.processingMills}</strong></div>
                )}
                {currentStateData.OER && (
                  <div>OER: <strong>{currentStateData.OER}%</strong></div>
                )}
              </div>
            </div>

            <div className="space-y-3 mt-6 pt-4 border-t border-gray-200">
              <button className="w-full bg-[#003366] text-white py-2.5 rounded-lg font-medium hover:bg-[#164523] transition-colors">
                Run Simulation
              </button>
              <button className="w-full border border-gray-300 p-1 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Save Scenario
              </button>
              <button className="w-full border border-dashed border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Compare with Baseline
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Results Panel - Blue Header */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedState} Simulation Results
                </h3>
                <p className="text-sm opacity-90">
                  Duty {duty}% · Cess {cess}% · FX {fx} ₹/USD · {seasonalMonth} · {plantationAge} yrs
                </p>
              </div>
              <div className="mt-3 md:mt-0">
                <div className="text-right">
                  <div className="text-2xl font-bold">{simulationResults.selfSufficiency}%</div>
                  <div className="text-sm opacity-90">State Self-Sufficiency</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <TabPill
                    label="Prices & Farmers"
                    active={activeTab === "prices"}
                    onClick={() => setActiveTab("prices")}
                  />
                  <TabPill
                    label="Imports & Forex"
                    active={activeTab === "imports"}
                    onClick={() => setActiveTab("imports")}
                  />
                  <TabPill
                    label="Fiscal Impact"
                    active={activeTab === "fiscal"}
                    onClick={() => setActiveTab("fiscal")}
                  />
                  <TabPill
                    label="Seasonal Analysis"
                    active={activeTab === "seasonal"}
                    onClick={() => setActiveTab("seasonal")}
                  />
                  <TabPill
                    label="State Capacity"
                    active={activeTab === "capacity"}
                    onClick={() => setActiveTab("capacity")}
                  />
                </div>
              </div>

              <div className="flex-1 mb-6">
                {activeTab === "prices" && <PricesTab simulationData={simulationResults} selectedState={selectedState} />}
                {activeTab === "imports" && <ImportsFXCharts simulationData={simulationResults} />}
                {activeTab === "fiscal" && <FiscalImpactChart simulationData={simulationResults} />}
                {activeTab === "seasonal" && <SeasonalAnalysis 
                  seasonalPattern={seasonalPattern}
                  currentMonth={seasonalMonth}
                  seasonAnalysis={seasonAnalysis}
                  bearingPotential={bearingPotential}
                  currentAge={plantationAge}
                />}
                {activeTab === "capacity" && <StateCapacityAnalysis 
                  stateData={currentStateData}
                  selectedState={selectedState}
                  simulationData={simulationResults}
                />}
              </div>

              {/* Enhanced Quick Results Summary - Plain Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-800">Simulation Results Summary</h4>
                  <p className="text-sm text-gray-600">Key metrics from current scenario</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">{simulationResults.selfSufficiency}%</div>
                      <div className="text-xs text-gray-600">State Self-Sufficiency</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">₹{simulationResults.farmerPrice.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Farmer Price</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">{simulationResults.importVolume}M MT</div>
                      <div className="text-xs text-gray-600">Imports</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">₹{simulationResults.fiscalCost}Cr</div>
                      <div className="text-xs text-gray-600">VGP Cost</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Policy Recommendation - Blue Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <h3 className="text-lg font-bold">{selectedState} Policy Recommendation</h3>
                    <div className="ml-auto bg-white/20 px-2 py-1 rounded text-xs">
                      OFFICIAL ANALYSIS
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3 text-sm text-gray-700">
                    {recommendation.map((line, idx) => (
                      <p key={idx}>• {line}</p>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-900 mb-1">Suggested Action for {selectedState}</div>
                    <div className="text-sm text-blue-800">
                      {duty >= 15 ? "Consider reducing duty to balance consumer impact while maintaining farmer support through targeted VGP." :
                       duty <= 5 ? "Consider increasing duty to better protect domestic farmers, especially during peak production season." :
                       "Maintain current duty level with close monitoring of global prices and domestic production trends."}
                      {currentStateData.coveragePercentage < 50 && " Focus on area expansion to utilize untapped potential."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Seasonal Analysis Component - with headers
function SeasonalAnalysis({ seasonalPattern, currentMonth, seasonAnalysis, bearingPotential, currentAge }) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  return (
    <div className="space-y-6">
      {/* Price Seasonality Chart - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <h4 className="font-bold">FFB Price Seasonality Pattern</h4>
          <p className="text-sm opacity-90">Telangana Historical Data Analysis</p>
        </div>
        <div className="p-6">
          <div className="h-64">
            <div className="flex items-end justify-between h-48 gap-1">
              {months.map(month => (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t ${
                      month === currentMonth 
                        ? 'bg-[#1e5c2a]' 
                        : month === seasonAnalysis.peakMonth 
                          ? 'bg-green-500' 
                          : month === seasonAnalysis.leanMonth 
                            ? 'bg-amber-500' 
                            : 'bg-blue-500'
                    }`}
                    style={{ 
                      height: `${((seasonalPattern[month] || 15000) - 12000) / 8000 * 100}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {month.slice(0, 3)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Lean: {seasonAnalysis.leanMonth} (₹{seasonAnalysis.minPrice?.toLocaleString()})</span>
              <span>Current: {currentMonth} (₹{seasonalPattern[currentMonth]?.toLocaleString()})</span>
              <span>Peak: {seasonAnalysis.peakMonth} (₹{seasonAnalysis.maxPrice?.toLocaleString()})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plantation Yield by Age - Plain Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h4 className="font-bold text-gray-800">Plantation Yield by Age</h4>
          <p className="text-sm text-gray-600">Yield progression over plantation lifecycle</p>
        </div>
        <div className="p-6">
          <div className="h-48">
            <div className="flex items-end justify-between h-32 gap-2">
              {bearingPotential.map(age => (
                <div key={age.age} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t ${
                      age.age === currentAge ? 'bg-[#1e5c2a]' : 'bg-green-400'
                    }`}
                    style={{ 
                      height: `${(age.yield / 18) * 100}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1">Year {age.age}</div>
                  <div className="text-xs font-medium">{age.yield} MT</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Strategy Guide - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <h4 className="font-bold">Seasonal Strategy Guide</h4>
          <p className="text-sm opacity-90">Policy recommendations by season</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">Peak Season ({seasonAnalysis.peakMonth})</div>
              <ul className="text-green-700 text-xs mt-2 space-y-1">
                <li>• Higher domestic production</li>
                <li>• Consider protective duties</li>
                <li>• Monitor farmer prices</li>
                <li>• Build buffer stocks</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="font-medium text-amber-800">Lean Season ({seasonAnalysis.leanMonth})</div>
              <ul className="text-amber-700 text-xs mt-2 space-y-1">
                <li>• Lower domestic production</li>
                <li>• Consider lower duties</li>
                <li>• Ensure supply adequacy</li>
                <li>• Control consumer prices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// State Capacity Analysis Component - with alternating headers
function StateCapacityAnalysis({ stateData, selectedState, simulationData }) {
  return (
    <div className="space-y-6">
      {/* First row: Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold">{selectedState} - Area Coverage Progress</h4>
              <p className="text-sm opacity-90">NMEO-OP Mission Targets</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{stateData.coveragePercentage}%</div>
              <div className="text-xs opacity-90">Coverage Achieved</div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Area Covered</span>
                <span className="font-medium">{stateData.areaCovered?.toLocaleString()} ha</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${stateData.coveragePercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stateData.coveragePercentage}% of {stateData.potentialArea?.toLocaleString()} ha potential
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second row: Plain Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h4 className="font-bold text-gray-800">Processing Capacity</h4>
          <p className="text-sm text-gray-600">Infrastructure & Extraction Efficiency</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600">Processing Mills</span>
                <span className="font-bold text-gray-800">{stateData.processingMills || 0}</span>
              </div>
              {stateData.crushingCapacity && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Crushing Capacity</span>
                  <span className="font-bold text-gray-800">{stateData.crushingCapacity} MT/hr</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {stateData.OER && (
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{stateData.OER}%</div>
                  <div className="text-xs text-blue-600 mt-1">Oil Extraction Rate</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Third row: Blue Header */}
      {stateData.areaExpansionTargets && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h4 className="font-bold">NMEO-OP Expansion Targets</h4>
            <p className="text-sm opacity-90">Annual targets (2021-22 to 2025-26)</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-2">
              {stateData.areaExpansionTargets.map((target, index) => (
                <div key={index} className="text-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-xs text-gray-600">202{1+index}-2{2+index}</div>
                  <div className="font-bold text-green-700 mt-1">{target.toLocaleString()} ha</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">
              Total Target: <span className="font-bold">{stateData.totalExpansionTarget?.toLocaleString()} ha</span>
            </div>
          </div>
        </div>
      )}

      {/* Fourth row: Plain Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h4 className="font-bold text-gray-800">Production Potential</h4>
          <p className="text-sm text-gray-600">Current capacity & future outlook</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xl font-bold text-blue-700">{simulationData.stateProduction}M MT</div>
              <div className="text-sm text-blue-600">Current FFB Production</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-xl font-bold text-green-700">{simulationData.selfSufficiency}%</div>
              <div className="text-sm text-green-600">State Self-Sufficiency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper Components (with consistent styling) */
function ControlSlider({ label, value, setValue, min, max, explanation }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-[#1e5c2a]">{value}%</span>
      </div>
      <input
        type="range"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(+e.target.value)}
      />
      {explanation && (
        <div className="text-xs text-gray-500 mt-1">{explanation}</div>
      )}
    </div>
  );
}

function ControlInput({ label, value, setValue, explanation }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        className="w-full rounded-lg border border-gray-300 p-1 focus:border-[#1e5c2a] focus:ring-[#1e5c2a]"
        value={value}
        onChange={(e) => setValue(+e.target.value)}
      />
      {explanation && (
        <div className="text-xs text-gray-500 mt-1">{explanation}</div>
      )}
    </div>
  );
}

function SelectInput({ label, state, setState, options }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        className="w-full rounded-lg border border-gray-300 p-1 focus:border-[#1e5c2a] focus:ring-[#1e5c2a]"
        value={state}
        onChange={(e) => setState(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleSwitch({ label, value, setValue }) {
  return (
    <div className="mb-6 flex justify-between items-center">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={() => setValue((v) => !v)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-[#1e5c2a]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}