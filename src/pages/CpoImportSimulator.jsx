import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Area, ScatterChart, Scatter, ZAxis,
  PieChart, Pie, Cell
} from "recharts";
import { Search } from "lucide-react";

const CPOMonthlyImportSimulator = () => {
  // ==================== AVAILABLE FIELDS FOR SELECTION ====================
  const availableFields = [
    { id: 'malaysiaShare', name: 'Malaysia CPO Share', min: 10, max: 60, step: 1, unit: '%', category: 'Market Share' },
    { id: 'indonesiaShare', name: 'Indonesia CPO Share', min: 30, max: 80, step: 1, unit: '%', category: 'Market Share' },
    { id: 'importDuty', name: 'Import Duty', min: 5, max: 30, step: 0.5, unit: '%', category: 'Policy' },
    { id: 'cpoPrice', name: 'International CPO Price', min: 50000, max: 150000, step: 1000, unit: '₹/MT', category: 'Price' },
    { id: 'transportCost', name: 'Transport Cost', min: 990, max: 2000, step: 10, unit: '$/container', category: 'Cost' },
    { id: 'demandGrowth', name: 'Demand Growth', min: -5, max: 20, step: 0.5, unit: '%/month', category: 'Demand' },
    { id: 'seasonalFactor', name: 'Seasonal Factor', min: 0.5, max: 1.5, step: 0.1, unit: 'multiplier', category: 'Seasonal' },
    { id: 'exchangeRate', name: 'USD to INR', min: 75, max: 90, step: 0.5, unit: '₹/$', category: 'Currency' },
    { id: 'priceVolatility', name: 'Price Volatility', min: 5, max: 30, step: 1, unit: '%', category: 'Price' },
    { id: 'soybeanPriceRatio', name: 'Soybean Price Ratio', min: 0.8, max: 1.5, step: 0.05, unit: 'ratio', category: 'Price' },
    { id: 'inflationRate', name: 'Inflation Rate', min: 2, max: 12, step: 0.5, unit: '%/year', category: 'Economic' },
    { id: 'subsidyImpact', name: 'Farmer Subsidy Impact', min: 0, max: 20, step: 1, unit: '%', category: 'Policy' },
    { id: 'exportLevyMalaysia', name: 'Malaysia Export Levy', min: 0, max: 15, step: 0.5, unit: '%', category: 'Policy' },
    { id: 'exportLevyIndonesia', name: 'Indonesia Export Levy', min: 0, max: 15, step: 0.5, unit: '%', category: 'Policy' }
  ];

  // ==================== SIMULATION CYCLE OPTIONS ====================
  const simulationCycles = [
    { id: 'monthly', name: 'Monthly Steps', value: 36, description: '3 years (36 months)' },
    { id: 'quarterly', name: 'Quarterly Steps', value: 12, description: '3 years (12 quarters)' },
    { id: 'yearly', name: 'Yearly Steps', value: 10, description: '10 years' },
    { id: 'custom', name: 'Custom Steps', value: 24, description: 'Set your own' }
  ];

  // ==================== DEFAULT PARAMETER VALUES ====================
  const defaultParams = {
    malaysiaShare: 35,
    indonesiaShare: 55,
    importDuty: 16.5,
    cpoPrice: 98942,
    transportCost: 1050,
    demandGrowth: 0.54,
    seasonalFactor: 1.0,
    exchangeRate: 83.5,
    priceVolatility: 15,
    soybeanPriceRatio: 1.2,
    inflationRate: 6,
    subsidyImpact: 5,
    exportLevyMalaysia: 3,
    exportLevyIndonesia: 5,
    simulationSteps: 36,
    currentStep: 0,
    startDate: new Date(2025, 0, 1),
    simulationCycle: 'monthly'
  };

  // ==================== STATE VARIABLES ====================
  const [selectedFields, setSelectedFields] = useState([
    'malaysiaShare',
    'importDuty',
    'cpoPrice'
  ]);

  const [params, setParams] = useState(defaultParams);

  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimStep, setCurrentSimStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const simulationIntervalRef = useRef(null);
  
  const [simulationData, setSimulationData] = useState([]);
  const [monthlyPrices, setMonthlyPrices] = useState([]);
  const [marketShareData, setMarketShareData] = useState([]);
  const [priceBreakdownData, setPriceBreakdownData] = useState([]);

  // Seasonal patterns for CPO imports (higher during festival seasons)
  const seasonalPattern = [
    0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.1, 1.0, 1.05, 1.1, 1.15 // Jan-Dec
  ];

  // ==================== SEARCH FUNCTIONALITY ====================
  const filteredFields = useMemo(() => {
    if (!searchQuery) return availableFields;
    const query = searchQuery.toLowerCase();
    return availableFields.filter(field => 
      field.name.toLowerCase().includes(query) ||
      field.category.toLowerCase().includes(query) ||
      field.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // ==================== CALCULATION FUNCTIONS ====================
  const calculateLandedCost = useCallback((basePrice, country = 'malaysia') => {
    const internationalPriceUSD = basePrice / params.exchangeRate;
    const transportCostUSD = params.transportCost;
    const freightPerMT = (transportCostUSD * 22) / 20; // Assuming 20 MT per container
    
    // Add export levy based on country
    const exportLevy = country === 'malaysia' ? params.exportLevyMalaysia : params.exportLevyIndonesia;
    const cifPrice = internationalPriceUSD * (1 + exportLevy/100) + freightPerMT;
    
    const dutyAmount = cifPrice * (params.importDuty / 100);
    const landedCostUSD = cifPrice + dutyAmount;
    return landedCostUSD * params.exchangeRate;
  }, [params]);

  const calculateRetailPrice = useCallback((landedCost) => {
    const distributionMargin = 0.15; // 15% distribution margin
    const retailMargin = 0.08; // 8% retail margin
    const gst = 0.05; // 5% GST
    
    const priceAfterDistribution = landedCost * (1 + distributionMargin);
    const priceBeforeGST = priceAfterDistribution * (1 + retailMargin);
    return priceBeforeGST * (1 + gst);
  }, []);

  const calculateFarmerFFBPrice = useCallback((cpoPrice) => {
    // Based on provided formula: 14.61% of Net CPO price
    const netCPOPrice = cpoPrice * (14.61 / 100);
    const subsidyEffect = 1 + (params.subsidyImpact / 100);
    return netCPOPrice * subsidyEffect;
  }, [params.subsidyImpact]);

  const getStepLabel = useCallback((stepIndex) => {
    const date = new Date(params.startDate);
    
    switch(params.simulationCycle) {
      case 'monthly':
        date.setMonth(date.getMonth() + stepIndex);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      case 'quarterly':
        date.setMonth(date.getMonth() + (stepIndex * 3));
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      
      case 'yearly':
        date.setFullYear(date.getFullYear() + stepIndex);
        return `${date.getFullYear()}`;
      
      default:
        date.setMonth(date.getMonth() + stepIndex);
        return `Step ${stepIndex + 1}`;
    }
  }, [params.startDate, params.simulationCycle]);

  const getCurrentDateLabel = useCallback(() => {
    const date = new Date(params.startDate);
    date.setMonth(date.getMonth() + currentSimStep);
    
    if (params.simulationCycle === 'quarterly') {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    } else if (params.simulationCycle === 'yearly') {
      return `${date.getFullYear()}`;
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
  }, [params.startDate, params.simulationCycle, currentSimStep]);

  // ==================== SIMULATION ENGINE ====================
  const simulateStep = useCallback((stepIndex) => {
    const stepLabel = getStepLabel(stepIndex);
    const monthOfYear = (new Date(params.startDate).getMonth() + stepIndex) % 12;
    const seasonalMultiplier = seasonalPattern[monthOfYear] * params.seasonalFactor;
    
    // Price volatility simulation
    const volatilityRange = params.priceVolatility / 100;
    const priceVolatility = 1 + ((Math.random() * 2 - 1) * volatilityRange);
    const currentCPOPrice = params.cpoPrice * priceVolatility;
    
    // Inflation effect
    const inflationMultiplier = 1 + (params.inflationRate / 100 / 12); // Monthly inflation
    
    // Calculate market dynamics
    const malaysiaLandedCost = calculateLandedCost(currentCPOPrice, 'malaysia');
    const indonesiaLandedCost = calculateLandedCost(currentCPOPrice, 'indonesia');
    const avgLandedCost = (malaysiaLandedCost * (params.malaysiaShare/100) + 
                          indonesiaLandedCost * (params.indonesiaShare/100)) / 
                          ((params.malaysiaShare + params.indonesiaShare)/100);
    
    const retailPrice = calculateRetailPrice(avgLandedCost) * inflationMultiplier;
    const farmerPrice = calculateFarmerFFBPrice(currentCPOPrice) * inflationMultiplier;
    
    // Demand calculation with seasonal effects and price competition
    let monthlyImports;
    if (stepIndex === 0) {
      // Starting imports
      monthlyImports = 8000;
    } else {
      const prevImports = simulationData[stepIndex - 1]?.imports || 8000;
      const baseGrowth = params.demandGrowth / 100;
      
      // Price competition effect (soybean vs palm oil)
      const priceCompetition = currentCPOPrice > (params.cpoPrice * params.soybeanPriceRatio) ? -0.02 : 0.01;
      
      // Duty effect
      const dutyEffect = params.importDuty < 16.5 ? 0.01 : 
                        params.importDuty > 20 ? -0.02 : 0;
      
      // Inflation impact on demand
      const inflationEffect = inflationMultiplier > 1.01 ? -0.005 : 0;
      
      const growthRate = (baseGrowth + priceCompetition + dutyEffect + inflationEffect) * seasonalMultiplier;
      monthlyImports = prevImports * (1 + growthRate);
    }
    
    // Calculate market shares with export levy impact
    const malaysiaCompetitiveness = params.exportLevyMalaysia < params.exportLevyIndonesia ? 1.02 : 0.98;
    const indonesiaCompetitiveness = params.exportLevyIndonesia < params.exportLevyMalaysia ? 1.02 : 0.98;
    
    const malaysiaShare = Math.max(10, Math.min(60, 
      params.malaysiaShare * malaysiaCompetitiveness * (1 + (params.demandGrowth/200))));
    const indonesiaShare = Math.max(30, Math.min(80, 
      params.indonesiaShare * indonesiaCompetitiveness * (1 + (params.demandGrowth/200))));
    const otherShare = 100 - malaysiaShare - indonesiaShare;
    
    const malaysiaImports = monthlyImports * (malaysiaShare / 100);
    const indonesiaImports = monthlyImports * (indonesiaShare / 100);
    const otherImports = monthlyImports - malaysiaImports - indonesiaImports;
    
    // Create result object with ALL parameter values for charting
    const result = {
      step: stepLabel,
      stepIndex,
      imports: Math.round(monthlyImports),
      malaysiaImports: Math.round(malaysiaImports),
      indonesiaImports: Math.round(indonesiaImports),
      otherImports: Math.round(otherImports),
      cpoPrice: Math.round(currentCPOPrice),
      landedCost: Math.round(avgLandedCost),
      retailPrice: Math.round(retailPrice),
      farmerPrice: Math.round(farmerPrice),
      importDuty: params.importDuty,
      malaysiaShare: Math.round(malaysiaShare * 10) / 10,
      indonesiaShare: Math.round(indonesiaShare * 10) / 10,
      seasonalMultiplier: seasonalMultiplier.toFixed(2),
      priceVolatility: (volatilityRange * 100).toFixed(1)
    };
    
    // Add all selected parameters to the result object for charting
    selectedFields.forEach(fieldId => {
      if (fieldId === 'cpoPrice') {
        result[fieldId] = Math.round(currentCPOPrice);
      } else if (fieldId === 'malaysiaShare') {
        result[fieldId] = Math.round(malaysiaShare * 10) / 10;
      } else if (fieldId === 'indonesiaShare') {
        result[fieldId] = Math.round(indonesiaShare * 10) / 10;
      } else {
        result[fieldId] = params[fieldId];
      }
    });
    
    return result;
  }, [params, simulationData, calculateLandedCost, calculateRetailPrice, calculateFarmerFFBPrice, getStepLabel, selectedFields]);

  // ==================== SIMULATION CONTROL ====================
  const startSimulation = useCallback(() => {
    if (isSimulating) {
      stopSimulation();
      return;
    }
    
    if (selectedFields.length < 2) {
      alert("Please select at least 2 parameters to monitor");
      return;
    }
    
    setIsSimulating(true);
    setCurrentSimStep(0);
    setSimulationData([]);
    setMonthlyPrices([]);
    setMarketShareData([]);
    setPriceBreakdownData([]);
    
    let stepIndex = 0;
    let cumulativeData = [];
    let cumulativePrices = [];
    let cumulativeMarketData = [];
    let cumulativePriceData = [];
    
    simulationIntervalRef.current = setInterval(() => {
      if (stepIndex >= params.simulationSteps) {
        stopSimulation();
        return;
      }
      
      const stepResult = simulateStep(stepIndex);
      cumulativeData.push(stepResult);
      setSimulationData([...cumulativeData]);
      
      // Update price data
      const priceData = {
        step: stepResult.step,
        cpoPrice: stepResult.cpoPrice,
        landedCost: stepResult.landedCost,
        retailPrice: stepResult.retailPrice
      };
      cumulativePrices.push(priceData);
      setMonthlyPrices([...cumulativePrices]);
      
      // Update market share data
      const marketData = {
        step: stepResult.step,
        malaysia: stepResult.malaysiaImports,
        indonesia: stepResult.indonesiaImports,
        other: stepResult.otherImports
      };
      cumulativeMarketData.push(marketData);
      setMarketShareData([...cumulativeMarketData]);
      
      // Update price breakdown data
      const breakdownData = {
        step: stepResult.step,
        cpoPrice: stepResult.cpoPrice,
        transport: Math.round((params.transportCost * params.exchangeRate) / 20),
        duty: Math.round(stepResult.cpoPrice * (params.importDuty / 100)),
        margins: Math.round(stepResult.retailPrice - stepResult.landedCost)
      };
      cumulativePriceData.push(breakdownData);
      setPriceBreakdownData([...cumulativePriceData]);
      
      setCurrentSimStep(stepIndex + 1);
      stepIndex++;
    }, animationSpeed);
  }, [isSimulating, params, selectedFields, simulateStep, animationSpeed]);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setSimulationData([]);
    setCurrentSimStep(0);
    setMonthlyPrices([]);
    setMarketShareData([]);
    setPriceBreakdownData([]);
  }, [stopSimulation]);

  // ==================== PARAMETER HANDLERS ====================
  const handleParamChange = useCallback((key, value) => {
    const numericValue = Number(value);
    setParams(prev => ({ 
      ...prev, 
      [key]: numericValue,
      // Auto-adjust other share if needed
      ...(key === 'malaysiaShare' ? { 
        indonesiaShare: Math.min(80, Math.max(30, 90 - numericValue)) 
      } : {}),
      ...(key === 'indonesiaShare' ? { 
        malaysiaShare: Math.min(60, Math.max(10, 90 - numericValue)) 
      } : {})
    }));
  }, []);

  const handleFieldToggle = useCallback((fieldId) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        if (prev.length > 2) {
          return prev.filter(id => id !== fieldId);
        }
        return prev;
      } else {
        // Ensure parameter has a default value if not already in params
        if (!(fieldId in params)) {
          const field = availableFields.find(f => f.id === fieldId);
          if (field) {
            setParams(prev => ({
              ...prev,
              [fieldId]: defaultParams[fieldId] || field.min
            }));
          }
        }
        return [...prev, fieldId];
      }
    });
    setShowSearchResults(false);
    setSearchQuery('');
  }, [params, availableFields]);

  const handleSimulationCycleChange = useCallback((cycleId) => {
    const cycle = simulationCycles.find(c => c.id === cycleId);
    setParams(prev => ({
      ...prev,
      simulationCycle: cycleId,
      simulationSteps: cycleId === 'custom' ? prev.simulationSteps : cycle.value
    }));
    resetSimulation();
  }, [resetSimulation]);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // ==================== DERIVED DATA ====================
  const currentKPIs = useMemo(() => {
    const malaysiaLandedCost = calculateLandedCost(params.cpoPrice, 'malaysia');
    const indonesiaLandedCost = calculateLandedCost(params.cpoPrice, 'indonesia');
    const avgLandedCost = (malaysiaLandedCost * (params.malaysiaShare/100) + 
                          indonesiaLandedCost * (params.indonesiaShare/100)) / 
                          ((params.malaysiaShare + params.indonesiaShare)/100);
    
    const retailPrice = calculateRetailPrice(avgLandedCost);
    const farmerPrice = calculateFarmerFFBPrice(params.cpoPrice);
    
    const monthlyImports = 8000;
    const malaysiaImports = monthlyImports * (params.malaysiaShare / 100);
    const indonesiaImports = monthlyImports * (params.indonesiaShare / 100);
    const otherImports = monthlyImports - malaysiaImports - indonesiaImports;
    
    return {
      currentDate: getCurrentDateLabel(),
      monthlyImports: Math.round(monthlyImports),
      landedCost: Math.round(avgLandedCost),
      retailPrice: Math.round(retailPrice),
      farmerPrice: Math.round(farmerPrice),
      malaysiaShare: params.malaysiaShare,
      indonesiaShare: params.indonesiaShare,
      otherShare: (100 - params.malaysiaShare - params.indonesiaShare).toFixed(1),
      malaysiaImports: Math.round(malaysiaImports),
      indonesiaImports: Math.round(indonesiaImports),
      otherImports: Math.round(otherImports),
      transportPerMT: Math.round((params.transportCost * params.exchangeRate) / 20)
    };
  }, [params, calculateLandedCost, calculateRetailPrice, calculateFarmerFFBPrice, getCurrentDateLabel]);

  const countryShareData = useMemo(() => [
    { name: 'Malaysia', value: params.malaysiaShare, color: '#3b82f6' },
    { name: 'Indonesia', value: params.indonesiaShare, color: '#10b981' },
    { name: 'Other', value: 100 - params.malaysiaShare - params.indonesiaShare, color: '#6b7280' }
  ], [params]);

  const fieldColors = {
    'malaysiaShare': '#3b82f6',
    'indonesiaShare': '#10b981',
    'importDuty': '#ef4444',
    'cpoPrice': '#f59e0b',
    'transportCost': '#8b5cf6',
    'demandGrowth': '#06b6d4',
    'seasonalFactor': '#84cc16',
    'exchangeRate': '#ec4899',
    'priceVolatility': '#f97316',
    'soybeanPriceRatio': '#22c55e',
    'inflationRate': '#dc2626',
    'subsidyImpact': '#14b8a6',
    'exportLevyMalaysia': '#8b5cf6',
    'exportLevyIndonesia': '#10b981'
  };

  // Get parameter value safely
  const getParamValue = (fieldId) => {
    return params[fieldId] !== undefined ? params[fieldId] : defaultParams[fieldId] || 0;
  };

  // ==================== RENDER ====================
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 via-amber-800 to-orange-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Monthly CPO Import Simulator</h1>
              <p className="text-amber-200 mt-1">
                Advanced simulation with searchable parameters and cycle control
              </p>
            </div>
          </div>
          <div className="text-sm px-3 py-2 bg-white/20 rounded-lg font-mono">
            {isSimulating ? '📈 SIMULATION RUNNING' : '📊 READY TO SIMULATE'}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search Bar for Parameters */}
        <div className="relative mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search parameters by name, category, or keyword..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && filteredFields.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Search Results ({filteredFields.length})
                </div>
                {filteredFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => handleFieldToggle(field.id)}
                    className={`flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg ${
                      selectedFields.includes(field.id) ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{field.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {field.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Range: {field.min}{field.unit} - {field.max}{field.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {getParamValue(field.id)}{field.unit}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${selectedFields.includes(field.id) ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Fields Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-800">Selected Parameters</h3>
              <p className="text-sm text-blue-600">
                {selectedFields.length} parameters selected (minimum 2 required)
              </p>
            </div>
            <div className="text-sm text-blue-700 font-medium">
              Search or click below to add more
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {selectedFields.map(fieldId => {
              const field = availableFields.find(f => f.id === fieldId);
              if (!field) return null;
              
              return (
                <div
                  key={fieldId}
                  className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-blue-200 shadow-sm"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fieldColors[fieldId] || '#6b7280' }} />
                  <div>
                    <div className="font-medium text-gray-900">{field.name}</div>
                    <div className="text-sm text-gray-600">
                      Current: {getParamValue(fieldId)}{field.unit}
                    </div>
                  </div>
                  <button
                    onClick={() => handleFieldToggle(fieldId)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            
            {selectedFields.length < 2 && (
              <div className="flex items-center gap-2 px-4 py-3 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.5 14.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium">Select {2 - selectedFields.length} more parameters</span>
              </div>
            )}
          </div>
        </div>

        {/* Simulation Controls with Cycle Selection */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={startSimulation}
                disabled={selectedFields.length < 2}
                className={`px-7 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
                  selectedFields.length < 2
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : isSimulating 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                }`}
              >
                {isSimulating ? (
                  <>
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Stop (Step {currentSimStep}/{params.simulationSteps})
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Simulation
                  </>
                )}
              </button>
              
              <button
                onClick={resetSimulation}
                className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={isSimulating}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
              
              {isSimulating && (
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-amber-300">
                  <div className="text-sm text-gray-800 font-medium">
                    {params.simulationCycle === 'monthly' ? 'Month' : 
                     params.simulationCycle === 'quarterly' ? 'Quarter' : 
                     params.simulationCycle === 'yearly' ? 'Year' : 'Step'}: 
                    <span className="font-bold text-orange-700 ml-2">{getCurrentDateLabel()}</span>
                  </div>
                  <div className="w-40">
                    <input
                      type="range"
                      min="300"
                      max="2000"
                      step="100"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                      className="w-full accent-orange-600"
                    />
                    <div className="text-xs text-gray-600 mt-1">Simulation Speed</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Simulation Cycle Selection */}
              <div className="bg-white px-4 py-3 rounded-xl border border-amber-300">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Simulation Cycle:</div>
                  <select
                    value={params.simulationCycle}
                    onChange={(e) => handleSimulationCycleChange(e.target.value)}
                    disabled={isSimulating}
                    className="text-sm font-medium text-orange-700 bg-transparent border-none focus:ring-0"
                  >
                    {simulationCycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.name} ({cycle.description})
                      </option>
                    ))}
                  </select>
                  {params.simulationCycle === 'custom' && (
                    <div className="ml-3 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={240}
                        value={params.simulationSteps}
                        onChange={(e) => setParams(prev => ({ ...prev, simulationSteps: Number(e.target.value) }))}
                        disabled={isSimulating}
                        className="w-24 text-sm px-2 py-1 border border-gray-200 rounded-md bg-white"
                      />
                      <div className="text-xs text-gray-500">steps</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm bg-white px-4 py-3 rounded-xl border border-amber-300">
                <span className="text-gray-600">Steps:</span>
                <span className="font-bold text-orange-700 ml-2">{params.simulationSteps}</span>
              </div>
            </div>
          </div>
          
          {isSimulating && (
            <div className="mt-5">
              <div className="flex justify-between text-sm text-orange-800 mb-2">
                <span>{getStepLabel(0)}</span>
                <span className="font-bold">{getCurrentDateLabel()}</span>
                <span>{getStepLabel(params.simulationSteps - 1)}</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 transition-all duration-300"
                  style={{ width: `${(currentSimStep / params.simulationSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-row gap-6">
          {/* Parameter Control Panel */}
          <div className="bg-gray-50 w-[400px] border border-gray-200 rounded-xl">
            <div className="px-5 py-4 font-bold text-gray-800 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Live Parameter Control</span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4">
                  Adjust parameters during simulation:
                </h4>
                
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {availableFields
                    .filter(field => selectedFields.includes(field.id))
                    .map(field => {
                      const paramValue = getParamValue(field.id);
                      
                      return (
                        <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <label className="block text-sm font-bold text-gray-700">
                                {field.name}
                              </label>
                              <div className="text-xs text-gray-500 mt-1">{field.category}</div>
                            </div>
                            <span className="text-sm font-bold px-2 py-1 rounded bg-gray-100">
                              {field.id === 'demandGrowth' ? `${paramValue}${field.unit}` 
                                : field.id === 'seasonalFactor' ? paramValue.toFixed(1)
                                : field.id === 'soybeanPriceRatio' ? paramValue.toFixed(2)
                                : field.id === 'malaysiaShare' || field.id === 'indonesiaShare' 
                                  ? `${paramValue}${field.unit}` 
                                  : paramValue.toFixed(0)}{field.unit}
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={paramValue}
                            onChange={(e) => handleParamChange(field.id, parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                          
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>{field.min}{field.unit}</span>
                            <span className="font-medium">Current: {
                              field.id === 'demandGrowth' ? `${paramValue}${field.unit}`
                              : field.id === 'seasonalFactor' ? paramValue.toFixed(1)
                              : field.id === 'soybeanPriceRatio' ? paramValue.toFixed(2)
                              : paramValue}{field.unit}</span>
                            <span>{field.max}{field.unit}</span>
                          </div>
                          
                          {isSimulating && (
                            <div className="mt-3 text-xs text-blue-600 font-medium animate-pulse">
                              ⚡ Live Adjustment Active
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Current Market Share */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <h5 className="text-sm font-bold text-green-800 mb-3">Market Share Distribution</h5>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryShareData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {countryShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-green-700 mt-2 text-center">
                  Malaysia: {currentKPIs.malaysiaShare}% | 
                  Indonesia: {currentKPIs.indonesiaShare}%
                </div>
              </div>

              {/* Scenario Presets */}
              <div className="border-t pt-5">
                <h5 className="text-sm font-bold text-gray-700 mb-3">Scenario Presets:</h5>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setParams(prev => ({
                        ...defaultParams,
                        ...prev,
                        malaysiaShare: 45,
                        indonesiaShare: 45,
                        importDuty: 10,
                        cpoPrice: 85000,
                        demandGrowth: 0.8,
                        seasonalFactor: 1.2
                      }));
                      resetSimulation();
                    }}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    📈 Festival Season Boom
                  </button>
                  
                  <button
                    onClick={() => {
                      setParams(prev => ({
                        ...defaultParams,
                        ...prev,
                        malaysiaShare: 25,
                        indonesiaShare: 65,
                        importDuty: 25,
                        cpoPrice: 120000,
                        demandGrowth: -0.5,
                        seasonalFactor: 0.8
                      }));
                      resetSimulation();
                    }}
                    className="px-5 py-3 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    📉 High Duty Crisis
                  </button>
                  
                  <button
                    onClick={() => {
                      setParams(prev => ({
                        ...defaultParams,
                        ...prev,
                        malaysiaShare: 35,
                        indonesiaShare: 55,
                        importDuty: 16.5,
                        cpoPrice: 98942,
                        demandGrowth: 0.54,
                        seasonalFactor: 1.0
                      }));
                      resetSimulation();
                    }}
                    className="px-5 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    ⚖️ Current Policy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="flex-1 space-y-8">
            {/* Monthly Imports Overview */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-5">
                {params.simulationCycle === 'monthly' ? 'Monthly' : 
                 params.simulationCycle === 'quarterly' ? 'Quarterly' : 
                 params.simulationCycle === 'yearly' ? 'Yearly' : 'Step-wise'} CPO Imports & Prices
                {isSimulating && <span className="ml-3 text-sm text-green-600 animate-pulse">⚡ Real-time</span>}
              </h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simulationData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="step" 
                      stroke="#6b7280"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis yAxisId="left" stroke="#6b7280" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'imports') return [`${value.toLocaleString()} MT`, 'Imports'];
                        if (name === 'cpoPrice') return [`₹${value.toLocaleString()}/MT`, 'CPO Price'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="imports" 
                      name={`${params.simulationCycle === 'monthly' ? 'Monthly' : 
                             params.simulationCycle === 'quarterly' ? 'Quarterly' : 
                             params.simulationCycle === 'yearly' ? 'Yearly' : 'Step'} Imports (MT)`}
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      barSize={30}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="cpoPrice" 
                      name="CPO Price (₹/MT)" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Breakdown Analysis */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-5">Price Component Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-bold text-gray-700 mb-4">Price Components (₹/MT)</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priceBreakdownData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="step" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                        <Legend />
                        <Bar dataKey="cpoPrice" name="CPO Price" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="transport" name="Transport" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="duty" name="Import Duty" stackId="a" fill="#ef4444" />
                        <Bar dataKey="margins" name="Retail Margins" stackId="a" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-bold text-gray-700 mb-4">Country-wise Imports</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketShareData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="step" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={(value) => [`${value.toLocaleString()} MT`, '']} />
                        <Legend />
                        <Bar dataKey="malaysia" name="Malaysia" fill="#3b82f6" />
                        <Bar dataKey="indonesia" name="Indonesia" fill="#10b981" />
                        <Bar dataKey="other" name="Other" fill="#6b7280" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Parameters Dashboard */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-5">
                Selected Parameters Over Time
              </h3>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="step" 
                      stroke="#6b7280"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => {
                        const field = availableFields.find(f => f.name === name);
                        return field ? [`${value}${field.unit}`, name] : [value, name];
                      }}
                    />
                    <Legend />
                    {selectedFields.map(fieldId => {
                      const field = availableFields.find(f => f.id === fieldId);
                      if (!field) return null;
                      
                      return (
                        <Line 
                          key={fieldId}
                          type="monotone" 
                          dataKey={fieldId}
                          name={field.name}
                          stroke={fieldColors[fieldId] || '#6b7280'}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      );
                    })}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Current Step KPIs */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-blue-800 mb-4">Current {params.simulationCycle === 'monthly' ? 'Month' : 
                 params.simulationCycle === 'quarterly' ? 'Quarter' : 
                 params.simulationCycle === 'yearly' ? 'Year' : 'Step'} Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600">CPO Price</div>
                  <div className="text-xl font-bold text-blue-800">₹{getParamValue('cpoPrice').toLocaleString()}/MT</div>
                  <div className="text-xs text-gray-500">International</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600">Landed Cost</div>
                  <div className="text-xl font-bold text-blue-800">₹{currentKPIs.landedCost.toLocaleString()}/MT</div>
                  <div className="text-xs text-gray-500">Including {getParamValue('importDuty')}% duty</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600">Retail Price</div>
                  <div className="text-xl font-bold text-blue-800">₹{currentKPIs.retailPrice.toLocaleString()}/MT</div>
                  <div className="text-xs text-gray-500">Consumer price</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600">Farmer FFB</div>
                  <div className="text-xl font-bold text-blue-800">₹{currentKPIs.farmerPrice.toLocaleString()}/MT</div>
                  <div className="text-xs text-gray-500">Based on 14.61% formula</div>
                </div>
              </div>
              
              <div className="mt-5 text-sm text-blue-700">
                <p className="font-bold">Import Breakdown:</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600">Malaysia</div>
                    <div className="font-bold">{currentKPIs.malaysiaImports.toLocaleString()} MT</div>
                    <div className="text-xs text-gray-500">{currentKPIs.malaysiaShare}% share</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600">Indonesia</div>
                    <div className="font-bold">{currentKPIs.indonesiaImports.toLocaleString()} MT</div>
                    <div className="text-xs text-gray-500">{currentKPIs.indonesiaShare}% share</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600">Other</div>
                    <div className="font-bold">{currentKPIs.otherImports.toLocaleString()} MT</div>
                    <div className="text-xs text-gray-500">{currentKPIs.otherShare}% share</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Results Table */}
            {simulationData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Simulation Results</h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">{params.simulationCycle === 'monthly' ? 'Month' : 
                           params.simulationCycle === 'quarterly' ? 'Quarter' : 
                           params.simulationCycle === 'yearly' ? 'Year' : 'Step'}</th>
                        <th className="px-4 py-2 text-left">Total Imports</th>
                        <th className="px-4 py-2 text-left">Malaysia</th>
                        <th className="px-4 py-2 text-left">Indonesia</th>
                        <th className="px-4 py-2 text-left">CPO Price</th>
                        <th className="px-4 py-2 text-left">Seasonal Factor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {simulationData.slice(-12).map((data, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{data.step}</td>
                          <td className="px-4 py-2">{data.imports.toLocaleString()} MT</td>
                          <td className="px-4 py-2">{data.malaysiaImports.toLocaleString()} MT</td>
                          <td className="px-4 py-2">{data.indonesiaImports.toLocaleString()} MT</td>
                          <td className="px-4 py-2">₹{data.cpoPrice.toLocaleString()}</td>
                          <td className="px-4 py-2">{data.seasonalMultiplier}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPOMonthlyImportSimulator;