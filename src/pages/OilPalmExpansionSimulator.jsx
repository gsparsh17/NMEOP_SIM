import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Cell
} from "recharts";

const OilPalmExpansionSimulator = ({ selectedState = "All-India" }) => {
  const [showParams, setShowParams] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimulationYear, setCurrentSimulationYear] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800); // Slower default speed
  const [animatedData, setAnimatedData] = useState([]);
  const [hasSimulationRun, setHasSimulationRun] = useState(false); // Track if simulation has run
  const simulationIntervalRef = useRef(null);
  
  // State-wise mature area baselines (official assumptions)
  const stateBaselines = {
    "Andhra Pradesh": 180000,
    "Telangana": 55000,
    "Karnataka": 45000,
    "Tamil Nadu": 35000,
    "Gujarat": 20000,
    "Assam": 25000,
    "All-India": 370000 // 3.7 lakh ha mature area (2021 baseline)
  };

  // Core parameters - ONLY validated ones remain
  const [params, setParams] = useState({
    startingYear: 2024,
    simulationYears: 10,
    newAreaPerYear: 65000,
    OER: 19.42, // % (from pricing order)
    cpoPrice: 115715.58 // ₹/MT (from Govt order)
  });

  // Fixed yield pattern (from your document)
  const yieldByAge = { 
    4: 5,   // Year 4: 5 MT/Ha
    5: 8,   // Year 5: 8 MT/Ha
    6: 11,  // Year 6: 11 MT/Ha
    7: 15,  // Year 7: 15 MT/Ha
    8: 18   // Year 8+: 18 MT/Ha
  };

  // Auto-calculate FFB price based on 14.61% rule
  const calculateFFBPrice = () => ((14.61 / 100) * params.cpoPrice).toFixed(2);

  const handleParamChange = (key, val) => {
    setParams(prev => ({ ...prev, [key]: Number(val) }));
    if (isSimulating) {
      stopSimulation();
    }
    // Don't reset hasSimulationRun here - let user decide when to run again
  };

  // --- Core Simulation Logic (Simplified) ---
  const fullSimulationData = useMemo(() => {
    const data = [];
    let matureArea = stateBaselines[selectedState] || 0;
    let immature = []; // {age, area}
    const ffbPrice = calculateFFBPrice();

    for (let year = 0; year < params.simulationYears; year++) {
      const currentYear = params.startingYear + year;

      // Add new area each year
      immature.push({ age: 0, area: params.newAreaPerYear });

      // Age the immature blocks
      immature = immature.map(x => ({ ...x, age: x.age + 1 }));

      // Move those age 4 -> mature
      const maturedThisYear = immature.filter(x => x.age === 4);
      matureArea += maturedThisYear.reduce((s, x) => s + x.area, 0);

      // Remove matured areas from immature
      immature = immature.filter(x => x.age < 4);

      // Calculate FFB Production
      let totalFFB = 0;
      
      // Production from immature areas (age >= 4)
      for (let block of immature) {
        if (block.age >= 4) {
          const age = Math.min(block.age, 8);
          totalFFB += block.area * yieldByAge[age];
        }
      }
      
      // Production from mature area (distributed across ages 4-8+)
      // Simple assumption: mature area equally distributed across age groups 4-8+
      const maturePortion = matureArea / 5; // 5 age groups (4, 5, 6, 7, 8+)
      for (let age = 4; age <= 8; age++) {
        const yieldValue = yieldByAge[age];
        totalFFB += maturePortion * yieldValue;
      }

      // CPO Production
      const totalCPO = totalFFB * (params.OER / 100);

      data.push({
        year: currentYear,
        matureArea: Math.round(matureArea),
        immatureArea: Math.round(immature.reduce((s, x) => s + x.area, 0)),
        totalArea: Math.round(matureArea + immature.reduce((s, x) => s + x.area, 0)),
        totalFFB: Math.round(totalFFB),
        totalCPO: Math.round(totalCPO),
        ffbPrice: ffbPrice,
        yieldPerHa: matureArea > 0 ? (totalFFB / matureArea).toFixed(1) : 0
      });
    }
    return data;
  }, [params, selectedState]);

  // Start simulation animation
  const startSimulation = () => {
    if (isSimulating) {
      stopSimulation();
      return;
    }
    
    setIsSimulating(true);
    setHasSimulationRun(true);
    setCurrentSimulationYear(0);
    setAnimatedData([]);
    
    // Initialize with starting baseline (Year 0)
    const baselineData = {
      year: params.startingYear - 1,
      matureArea: stateBaselines[selectedState] || 0,
      immatureArea: 0,
      totalArea: stateBaselines[selectedState] || 0,
      totalFFB: 0,
      totalCPO: 0,
      ffbPrice: calculateFFBPrice(),
      yieldPerHa: 0
    };
    setAnimatedData([baselineData]);
    
    let currentYear = 0;
    const fullData = [...fullSimulationData];
    
    simulationIntervalRef.current = setInterval(() => {
      if (currentYear >= fullData.length) {
        stopSimulation();
        return;
      }
      
      const newDataPoint = fullData[currentYear];
      setAnimatedData(prev => [...prev, newDataPoint]);
      setCurrentSimulationYear(currentYear + 1);
      
      currentYear++;
    }, animationSpeed);
  };

  // Stop simulation
  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
  };

  // Reset simulation
  const resetSimulation = () => {
    stopSimulation();
    setAnimatedData([]);
    setCurrentSimulationYear(0);
    setHasSimulationRun(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // Get display data (animated or full)
  const displayData = isSimulating ? animatedData : (hasSimulationRun ? fullSimulationData : []);
  
  // Check if we should show results
  const shouldShowResults = hasSimulationRun || isSimulating;

  // Scenario presets
  const applyScenario = (scenario) => {
    switch(scenario) {
      case 'nmeo':
        setParams({
          startingYear: 2024,
          simulationYears: 10,
          newAreaPerYear: 65000,
          OER: 19.42,
          cpoPrice: 115715.58
        });
        break;
      case 'optimistic':
        setParams({
          startingYear: 2024,
          simulationYears: 10,
          newAreaPerYear: 100000,
          OER: 21.0,
          cpoPrice: 125000
        });
        break;
      case 'conservative':
        setParams({
          startingYear: 2024,
          simulationYears: 10,
          newAreaPerYear: 30000,
          OER: 18.0,
          cpoPrice: 100000
        });
        break;
      case 'high-oer':
        setParams({
          startingYear: 2024,
          simulationYears: 10,
          newAreaPerYear: 75000,
          OER: 22.0,
          cpoPrice: 115715.58
        });
        break;
    }
    if (isSimulating) {
      stopSimulation();
    }
    // Don't reset hasSimulationRun - let user decide when to run
  };

  // Get current data for display
  const getDisplayData = () => {
    if (isSimulating) return animatedData;
    if (hasSimulationRun) return fullSimulationData;
    return [];
  };

  // Calculate KPIs for the final year
  const finalYearData = displayData.length > 0 ? displayData[displayData.length - 1] : null;

  return (
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
              <h3 className="text-lg font-bold">Oil Palm Expansion Simulator</h3>
              <p className="text-sm opacity-90">
                Simulate FFB & CPO production based on area expansion patterns
              </p>
            </div>
          </div>
          <div className="text-xs px-2 py-1 bg-white/20 rounded">
            {isSimulating ? 'ANIMATING...' : hasSimulationRun ? 'SIMULATION COMPLETE' : 'READY TO SIMULATE'}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Simulation Controls with Animation */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={startSimulation}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  isSimulating 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-[#003366] hover:bg-[#00509e] text-white'
                }`}
              >
                {isSimulating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Stop Simulation ({currentSimulationYear}/{params.simulationYears})
                  </>
                ) : hasSimulationRun ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Run Again
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Simulation
                  </>
                )}
              </button>
              
              <button
                onClick={resetSimulation}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={isSimulating || !hasSimulationRun}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
              
              {isSimulating && (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border">
                  <div className="text-sm text-gray-700">
                    Year: <span className="font-bold">{params.startingYear + currentSimulationYear - 1}</span>
                  </div>
                  <div className="w-32">
                    <input
                      type="range"
                      min="300"
                      max="2000"
                      step="100"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">Speed: {animationSpeed}ms/year</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm bg-white px-3 py-2 rounded border border-gray-300">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ml-2 ${
                  isSimulating ? 'text-green-600' : 
                  hasSimulationRun ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {isSimulating 
                    ? `Simulating... ${Math.round((currentSimulationYear / params.simulationYears) * 100)}%` 
                    : hasSimulationRun ? 'Complete' : 'Ready to Start'}
                </span>
              </div>
            </div>
          </div>
          
          {isSimulating && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(currentSimulationYear / params.simulationYears) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Year {params.startingYear}</span>
                <span>Year {params.startingYear + currentSimulationYear - 1}</span>
                <span>Year {params.startingYear + params.simulationYears - 1}</span>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Simulation Parameters */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg mb-6">
          <button
            onClick={() => setShowParams(!showParams)}
            className="w-full text-left px-4 py-3 font-semibold text-gray-800 flex justify-between items-center hover:bg-gray-100 rounded-t-lg transition-colors"
          >
            <span>Simulation Parameters</span>
            <span className="text-xl font-mono">{showParams ? "−" : "+"}</span>
          </button>

          {showParams && (
            <div className="p-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Simulation Years
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={params.simulationYears}
                    onChange={e => handleParamChange("simulationYears", e.target.value)}
                    disabled={isSimulating}
                  >
                    {[5, 10, 15, 20].map(n => (
                      <option key={n} value={n}>{n} Years</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Area per Year (Ha)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={params.newAreaPerYear}
                    onChange={e => handleParamChange("newAreaPerYear", e.target.value)}
                    min="1000"
                    step="1000"
                    disabled={isSimulating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OER (%)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={params.OER}
                    step="0.1"
                    min="10"
                    max="25"
                    onChange={e => handleParamChange("OER", e.target.value)}
                    disabled={isSimulating}
                  />
                  <div className="text-xs text-gray-500 mt-1">Oil Extraction Ratio</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPO Net Price (₹/MT)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={params.cpoPrice}
                    onChange={e => handleParamChange("cpoPrice", e.target.value)}
                    min="50000"
                    max="200000"
                    step="1000"
                    disabled={isSimulating}
                  />
                  <div className="text-xs text-gray-500 mt-1">From Govt. pricing order</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FFB Price (₹/MT)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50"
                    value={calculateFFBPrice()}
                    readOnly
                  />
                  <div className="text-xs text-gray-500 mt-1">Auto-calculated (14.61% of CPO)</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Baseline Area (Ha)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50"
                    value={stateBaselines[selectedState] || 0}
                    readOnly
                  />
                  <div className="text-xs text-gray-500 mt-1">Existing mature area for {selectedState}</div>
                </div>
              </div>

              {/* Scenario Buttons */}
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Quick Scenarios:</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyScenario('nmeo')}
                    className="px-4 py-2 bg-[#003366] text-white rounded text-sm font-medium hover:bg-[#00509e] disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    Reset to NMEO Targets
                  </button>
                  
                  <button
                    onClick={() => applyScenario('optimistic')}
                    className="px-4 py-2 border border-green-300 text-green-700 bg-green-50 rounded text-sm font-medium hover:bg-green-100 disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    Optimistic Scenario
                  </button>
                  
                  <button
                    onClick={() => applyScenario('conservative')}
                    className="px-4 py-2 border border-amber-300 text-amber-700 bg-amber-50 rounded text-sm font-medium hover:bg-amber-100 disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    Conservative Scenario
                  </button>
                  
                  <button
                    onClick={() => applyScenario('high-oer')}
                    className="px-4 py-2 border border-purple-300 text-purple-700 bg-purple-50 rounded text-sm font-medium hover:bg-purple-100 disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    High OER Scenario
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Click a scenario to load preset parameters, then click "Start Simulation"
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section - ONLY SHOW AFTER SIMULATION RUNS */}
        {shouldShowResults ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 transition-all duration-300">
                <div className="text-xs text-blue-600 font-medium mb-1">Total Area (Ha)</div>
                <div className="text-xl font-bold text-blue-700 transition-all duration-500">
                  {finalYearData ? finalYearData.totalArea.toLocaleString() : '0'}
                </div>
                <div className="text-xs text-gray-500">
                  {isSimulating ? `Year ${params.startingYear + currentSimulationYear - 1}` : 'Final'}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 transition-all duration-300">
                <div className="text-xs text-green-600 font-medium mb-1">Mature Area (Ha)</div>
                <div className="text-xl font-bold text-green-700 transition-all duration-500">
                  {finalYearData ? finalYearData.matureArea.toLocaleString() : '0'}
                </div>
                <div className="text-xs text-gray-500">
                  Productive area
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 transition-all duration-300">
                <div className="text-xs text-purple-600 font-medium mb-1">FFB Production</div>
                <div className="text-xl font-bold text-purple-700 transition-all duration-500">
                  {finalYearData ? `${(finalYearData.totalFFB / 1000).toFixed(1)}K MT` : '0 MT'}
                </div>
                <div className="text-xs text-gray-500">
                  Fresh Fruit Bunches
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 transition-all duration-300">
                <div className="text-xs text-amber-600 font-medium mb-1">CPO Production</div>
                <div className="text-xl font-bold text-amber-700 transition-all duration-500">
                  {finalYearData ? `${(finalYearData.totalCPO / 1000).toFixed(1)}K MT` : '0 MT'}
                </div>
                <div className="text-xs text-gray-500">
                  Crude Palm Oil
                </div>
              </div>
              
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200 transition-all duration-300">
                <div className="text-xs text-cyan-600 font-medium mb-1">FFB Price</div>
                <div className="text-xl font-bold text-cyan-700 transition-all duration-500">
                  ₹{finalYearData ? parseFloat(finalYearData.ffbPrice).toLocaleString() : '0'}/MT
                </div>
                <div className="text-xs text-gray-500">
                  Auto-calculated
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Area & CPO Production Chart with Animation */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300">
                <h4 className="font-bold text-gray-800 mb-4">
                  Area & CPO Production Trend
                  {isSimulating && (
                    <span className="ml-2 text-sm text-green-600 animate-pulse">
                      • LIVE
                    </span>
                  )}
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={getDisplayData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#6b7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'totalCPO') {
                            return [`${(value / 1000).toFixed(1)}K MT`, 'CPO Production'];
                          }
                          if (name.includes('Area')) {
                            return [`${(value / 1000).toFixed(1)}K Ha`, name];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="totalArea" name="Total Area (Ha)" fill="#3b82f6">
                        {isSimulating && getDisplayData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === getDisplayData().length - 1 ? '#1d4ed8' : '#3b82f6'} />
                        ))}
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="totalCPO" name="CPO (MT)" stroke="#10b981" strokeWidth={2} dot={{ r: isSimulating ? 4 : 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {isSimulating && getDisplayData().length > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Current year: {getDisplayData()[getDisplayData().length - 1].year} | 
                    Area: {(getDisplayData()[getDisplayData().length - 1].totalArea / 1000).toFixed(1)}K Ha | 
                    CPO: {(getDisplayData()[getDisplayData().length - 1].totalCPO / 1000).toFixed(1)}K MT
                  </div>
                )}
              </div>

              {/* Area Breakdown Chart with Animation */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300">
                <h4 className="font-bold text-gray-800 mb-4">
                  Area Composition
                  {isSimulating && (
                    <span className="ml-2 text-sm text-green-600 animate-pulse">
                      • UPDATING
                    </span>
                  )}
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDisplayData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value) => [`${(value / 1000).toFixed(1)}K Ha`, 'Area']}
                      />
                      <Legend />
                      <Bar dataKey="matureArea" name="Mature Area" stackId="a" fill="#10b981">
                        {isSimulating && getDisplayData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === getDisplayData().length - 1 ? '#059669' : '#10b981'} />
                        ))}
                      </Bar>
                      <Bar dataKey="immatureArea" name="Immature Area" stackId="a" fill="#f59e0b">
                        {isSimulating && getDisplayData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === getDisplayData().length - 1 ? '#d97706' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {isSimulating && getDisplayData().length > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Mature: {(getDisplayData()[getDisplayData().length - 1].matureArea / 1000).toFixed(1)}K Ha | 
                    Immature: {(getDisplayData()[getDisplayData().length - 1].immatureArea / 1000).toFixed(1)}K Ha
                  </div>
                )}
              </div>
            </div>

            {/* Production Chart with Animation */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 transition-all duration-300">
              <h4 className="font-bold text-gray-800 mb-4">
                Production Trend
                {isSimulating && (
                  <span className="ml-2 text-sm text-green-600 animate-pulse">
                    • ANIMATING
                  </span>
                )}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getDisplayData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [`${(value / 1000).toFixed(1)}K MT`, 'Production']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalFFB" 
                      name="FFB Production" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                      dot={{ r: isSimulating ? 4 : 3 }}
                      animationDuration={isSimulating ? animationSpeed : 1000}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalCPO" 
                      name="CPO Production" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      dot={{ r: isSimulating ? 4 : 3 }}
                      animationDuration={isSimulating ? animationSpeed : 1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {isSimulating && getDisplayData().length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  FFB: {(getDisplayData()[getDisplayData().length - 1].totalFFB / 1000).toFixed(1)}K MT | 
                  CPO: {(getDisplayData()[getDisplayData().length - 1].totalCPO / 1000).toFixed(1)}K MT
                </div>
              )}
            </div>

            {/* Detailed Data Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-800">Detailed Simulation Data</h4>
                <div className="text-sm text-gray-500">
                  {isSimulating ? 'Live updates' : 'Complete results'}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Year</th>
                      <th className="px-4 py-2 text-right">Total Area (Ha)</th>
                      <th className="px-4 py-2 text-right">Mature Area (Ha)</th>
                      <th className="px-4 py-2 text-right">FFB (MT)</th>
                      <th className="px-4 py-2 text-right">CPO (MT)</th>
                      <th className="px-4 py-2 text-right">Yield (MT/Ha)</th>
                      <th className="px-4 py-2 text-right">FFB Price (₹/MT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getDisplayData().map((row, index) => (
                      <tr 
                        key={row.year} 
                        className={`hover:bg-gray-50 ${isSimulating && index === getDisplayData().length - 1 ? 'bg-green-50' : ''}`}
                      >
                        <td className="px-4 py-2 font-medium">
                          {row.year}
                          {isSimulating && index === getDisplayData().length - 1 && (
                            <span className="ml-2 text-xs text-green-600 animate-pulse">●</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">{row.totalArea.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{row.matureArea.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{(row.totalFFB / 1000).toFixed(1)}K</td>
                        <td className="px-4 py-2 text-right">{(row.totalCPO / 1000).toFixed(1)}K</td>
                        <td className="px-4 py-2 text-right">{row.yieldPerHa}</td>
                        <td className="px-4 py-2 text-right">₹{parseFloat(row.ffbPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Notes */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg transition-all duration-300">
              <h4 className="font-bold text-blue-900 mb-3">
                Simulation Insights for {selectedState}
                {isSimulating && (
                  <span className="ml-2 text-sm text-blue-600">• Live Analysis</span>
                )}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-2">Production Forecast:</div>
                  <ul className="space-y-1 ml-5 list-disc">
                    <li>
                      {isSimulating 
                        ? `Currently in Year ${params.startingYear + currentSimulationYear - 1}`
                        : `Peak production reached in Year ${params.startingYear + 7}`}
                    </li>
                    <li>
                      Average yield: {getDisplayData().length > 0 
                        ? (getDisplayData().reduce((sum, year) => sum + parseFloat(year.yieldPerHa), 0) / getDisplayData().length).toFixed(1)
                        : '0'} MT/Ha
                    </li>
                    <li>
                      Total CPO production: {((getDisplayData().reduce((sum, year) => sum + year.totalCPO, 0)) / 1000000).toFixed(1)} lakh MT
                    </li>
                  </ul>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-2">Area Expansion:</div>
                  <ul className="space-y-1 ml-5 list-disc">
                    <li>
                      Total area expansion: {getDisplayData().reduce((sum, year) => sum + params.newAreaPerYear, 0).toLocaleString()} Ha
                    </li>
                    <li>
                      Mature area growth: {stateBaselines[selectedState]?.toLocaleString() || '0'} → {finalYearData?.matureArea.toLocaleString() || '0'} Ha
                    </li>
                    <li>
                      Annual new planting rate: {params.newAreaPerYear.toLocaleString()} Ha/year
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Show only when simulation hasn't run - No preview data */
          <div className="mb-6 p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to Simulate</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Configure your parameters above, select a scenario, then click <strong>"Start Simulation"</strong> to see animated results.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="font-medium text-gray-800 mb-2">What Will You See?</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Year-by-year animated growth</li>
                  <li>• FFB & CPO production increases</li>
                  <li>• Area composition changes</li>
                  <li>• Real-time data updates</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="font-medium text-gray-800 mb-2">Animation Features:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Adjustable speed control</li>
                  <li>• Live progress indicator</li>
                  <li>• Current year highlighting</li>
                  <li>• Pause/stop anytime</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="font-medium text-gray-800 mb-2">Current Setup:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {params.newAreaPerYear.toLocaleString()} Ha/year</li>
                  <li>• {params.OER}% OER</li>
                  <li>• ₹{params.cpoPrice.toLocaleString()}/MT CPO</li>
                  <li>• {selectedState} state</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OilPalmExpansionSimulator;