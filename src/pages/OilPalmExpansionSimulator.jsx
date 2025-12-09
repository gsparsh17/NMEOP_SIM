import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, AreaChart, Area,
  PieChart, Pie, Cell
} from "recharts";
import { Search, Zap, Settings, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Filter, X, TrendingUp, AlertTriangle, DollarSign, Leaf, Users, Target } from "lucide-react";

const OilPalmForestFireSimulator = ({ selectedState = "All-India" }) => {
  const stateBaselines = {
    "Andhra Pradesh": {
      baseAreaPerZone: 3000,
      breakevenPrice: 4000,
      growthRate: 0.15,
      sentimentBias: 0.6
    },
    "Telangana": {
      baseAreaPerZone: 2500,
      breakevenPrice: 4200,
      growthRate: 0.12,
      sentimentBias: 0.55
    },
    "Karnataka": {
      baseAreaPerZone: 2000,
      breakevenPrice: 4300,
      growthRate: 0.10,
      sentimentBias: 0.5
    },
    "Tamil Nadu": {
      baseAreaPerZone: 1500,
      breakevenPrice: 4500,
      growthRate: 0.08,
      sentimentBias: 0.45
    },
    "Gujarat": {
      baseAreaPerZone: 1200,
      breakevenPrice: 4600,
      growthRate: 0.07,
      sentimentBias: 0.4
    },
    "Assam": {
      baseAreaPerZone: 1000,
      breakevenPrice: 4700,
      growthRate: 0.05,
      sentimentBias: 0.35
    },
    "All-India": {
      baseAreaPerZone: 2000,
      breakevenPrice: 4300,
      growthRate: 0.10,
      sentimentBias: 0.5
    }
  };

  // ==================== SIMULATION CONFIGURATION ====================
  const SIMULATION_MODES = [
    { id: 'monthly', name: 'Monthly', interval: 12, label: 'Month', total: 60 }, // 5 years
    { id: 'quarterly', name: 'Quarterly', interval: 4, label: 'Quarter', total: 20 }, // 5 years
    { id: 'yearly', name: 'Yearly', interval: 1, label: 'Year', total: 5 } // 5 years
  ];

  const SPEED_PRESETS = [
    { id: 'slow', name: 'Slow', value: 1200, icon: '🐢' },
    { id: 'medium', name: 'Medium', value: 600, icon: '🐇' },
    { id: 'fast', name: 'Fast', value: 300, icon: '⚡' },
    { id: 'instant', name: 'Instant', value: 100, icon: '🚀' }
  ];

  // ==================== AVAILABLE PARAMETERS ====================
  const availableParameters = [
    { 
      id: 'cpoPrice', 
      name: 'CPO Price', 
      min: 30000, 
      max: 100000, 
      step: 1000, 
      unit: '₹/MT',
      category: 'price',
      description: 'Crude Palm Oil market price',
      icon: <DollarSign className="w-4 h-4" />
    },
    { 
      id: 'attritionRate', 
      name: 'Attrition Rate', 
      min: 5, 
      max: 50, 
      step: 1, 
      unit: '%/yr',
      category: 'risk',
      description: 'Annual area loss when unprofitable',
      icon: <TrendingUp className="w-4 h-4" />
    },
    { 
      id: 'contagionStrength', 
      name: 'Contagion Strength', 
      min: 1, 
      max: 30, 
      step: 1, 
      unit: '%',
      category: 'risk',
      description: 'How quickly abandonment spreads',
      icon: <Users className="w-4 h-4" />
    },
    { 
      id: 'growthRate', 
      name: 'Growth Rate', 
      min: 5, 
      max: 30, 
      step: 1, 
      unit: '%',
      category: 'growth',
      description: 'Annual growth when profitable',
      icon: <Leaf className="w-4 h-4" />
    },
    { 
      id: 'shockProbability', 
      name: 'Shock Probability', 
      min: 0, 
      max: 15, 
      step: 0.5, 
      unit: '%',
      category: 'risk',
      description: 'Chance of price shock per period',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    { 
      id: 'subsidyImpact', 
      name: 'Subsidy Impact', 
      min: 0, 
      max: 40, 
      step: 1, 
      unit: '%',
      category: 'policy',
      description: 'Government subsidy effectiveness',
      icon: <Target className="w-4 h-4" />
    },
    { 
      id: 'baseAreaPerZone', 
      name: 'Base Area Per Zone', 
      min: 500, 
      max: 5000, 
      step: 100, 
      unit: 'Ha',
      category: 'area',
      description: 'Initial cultivated area per zone',
      icon: <div className="w-4 h-4 bg-green-500 rounded-full"></div>
    },
    { 
      id: 'zoneDensity', 
      name: 'Zone Density', 
      min: 20, 
      max: 80, 
      step: 1, 
      unit: 'zones',
      category: 'area',
      description: 'Number of cultivation zones',
      icon: <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
    },
    { 
      id: 'recoveryTime', 
      name: 'Recovery Time', 
      min: 6, 
      max: 36, 
      step: 1, 
      unit: 'months',
      category: 'area',
      description: 'Time for abandoned zones to recover',
      icon: <RotateCcw className="w-4 h-4" />
    }
  ];

  // ==================== STATE VARIABLES ====================
  const [simulationMode, setSimulationMode] = useState('monthly');
  const [simulationSpeed, setSimulationSpeed] = useState(600);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const simulationIntervalRef = useRef(null);
  
  const [selectedParams, setSelectedParams] = useState(['cpoPrice', 'attritionRate']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  
  const [params, setParams] = useState({
    cpoPrice: 45000,
    attritionRate: 20,
    contagionStrength: 15,
    growthRate: 10,
    shockProbability: 5,
    subsidyImpact: 15,
    baseAreaPerZone: 2000,
    zoneDensity: 48,
    recoveryTime: 12
  });

  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [zoneMetrics, setZoneMetrics] = useState({
    healthy: 48,
    atRisk: 0,
    abandoned: 0,
    recovering: 0
  });

  // ==================== HELPER FUNCTIONS ====================
  const getCurrentMode = useCallback(() => 
    SIMULATION_MODES.find(mode => mode.id === simulationMode),
    [simulationMode]
  );
  
  // Helper to get time label based on period and mode
  const getTimeLabel = useCallback((period) => {
    const mode = getCurrentMode();
    
    switch(mode.id) {
      case 'monthly':
        const month = (period % 12);
        const year = 2024 + Math.floor(period / 12);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[month]} ${year}`;
        
      case 'quarterly':
        const quarter = (period % 4);
        const qYear = 2024 + Math.floor(period / 4);
        return `Q${quarter + 1} ${qYear}`;
        
      case 'yearly':
        return `Year ${2024 + period}`;
        
      default:
        return `Period ${period + 1}`;
    }
  }, [getCurrentMode]);

  const calculateFFBPrice = useCallback(() => {
    return params.cpoPrice * 0.1461; // 14.61% of CPO price
  }, [params.cpoPrice]);

  const calculateProfitability = useCallback(() => {
    const ffbPrice = calculateFFBPrice();
    const breakeven = stateBaselines[selectedState]?.breakevenPrice || 4300;
    return ffbPrice >= breakeven;
  }, [calculateFFBPrice, selectedState]);

  const initializeSimulation = useCallback(() => {
    const state = stateBaselines[selectedState] || stateBaselines["All-India"];
    const totalZones = params.zoneDensity;
    const baseAreaPerZone = params.baseAreaPerZone;
    
    const totalArea = totalZones * baseAreaPerZone;
    const ffbPrice = calculateFFBPrice();
    const isProfitable = calculateProfitability();
    
    const initialData = {
      period: 0,
      timeLabel: getTimeLabel(0),
      totalArea: Math.round(totalArea),
      avgSentiment: state.sentimentBias,
      ffbPrice: parseFloat(ffbPrice.toFixed(2)),
      profitability: isProfitable ? 1.0 : 0.0,
      zoneHealthy: totalZones,
      zoneAtRisk: 0,
      zoneAbandoned: 0,
      zoneRecovering: 0,
      cpoPrice: params.cpoPrice,
      attritionRate: params.attritionRate,
      contagionStrength: params.contagionStrength,
      growthRate: params.growthRate,
      shockProbability: params.shockProbability,
      subsidyImpact: params.subsidyImpact,
      baseAreaPerZone: params.baseAreaPerZone,
      zoneDensity: params.zoneDensity,
      recoveryTime: params.recoveryTime
    };
    
    setHistory([initialData]);
    setEvents([]);
    setZoneMetrics({
      healthy: totalZones,
      atRisk: 0,
      abandoned: 0,
      recovering: 0
    });
    setCurrentPeriod(0);
    
    return initialData;
  }, [selectedState, params, calculateFFBPrice, calculateProfitability, getTimeLabel]);

  // ==================== FIXED SIMULATION ENGINE ====================
  const simulatePeriod = useCallback((currentState) => {
    const mode = getCurrentMode();
    const currentFFBPrice = calculateFFBPrice();
    const state = stateBaselines[selectedState] || stateBaselines["All-India"];
    const breakeven = state.breakevenPrice;
    
    // Calculate period factors
    const periodFactor = mode.interval / 12;
    const adjustedBreakeven = breakeven * (1 - params.subsidyImpact / 100);
    const isProfitable = currentFFBPrice >= adjustedBreakeven;
    
    // Copy current metrics
    const currentZones = {
      healthy: currentState.zoneHealthy,
      atRisk: currentState.zoneAtRisk,
      abandoned: currentState.zoneAbandoned,
      recovering: currentState.zoneRecovering
    };
    
    let newZoneMetrics = { ...currentZones };
    let totalArea = currentState.totalArea;
    let avgSentiment = currentState.avgSentiment;
    const newEvents = [];
    
    // Calculate base effects
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    
    if (isProfitable) {
      // PROFITABLE SCENARIO - Growth & Recovery
      const growthFactor = (params.growthRate / 100) * periodFactor * randomFactor;
      totalArea = totalArea * (1 + growthFactor);
      avgSentiment = Math.min(1.0, avgSentiment + 0.05 * randomFactor);
      
      // Recovery from abandoned zones
      if (newZoneMetrics.abandoned > 0) {
        const recoveryChance = 0.4 * periodFactor;
        if (Math.random() < recoveryChance) {
          const recovered = Math.max(1, Math.floor(newZoneMetrics.abandoned * 0.15 * randomFactor));
          newZoneMetrics.abandoned -= recovered;
          newZoneMetrics.recovering += recovered;
          
          newEvents.push({
            period: currentPeriod + 1,
            type: 'recovery_start',
            zones: recovered,
            description: `${recovered} abandoned zones started recovery process`
          });
        }
      }
      
      // Recovery to healthy zones
      if (newZoneMetrics.recovering > 0) {
        const fullRecoveryChance = 0.3 * periodFactor;
        if (Math.random() < fullRecoveryChance) {
          const becomeHealthy = Math.max(1, Math.floor(newZoneMetrics.recovering * 0.2 * randomFactor));
          newZoneMetrics.recovering -= becomeHealthy;
          newZoneMetrics.healthy += becomeHealthy;
          
          newEvents.push({
            period: currentPeriod + 1,
            type: 'recovery_complete',
            zones: becomeHealthy,
            description: `${becomeHealthy} zones fully recovered and became healthy`
          });
        }
      }
      
      // New zone development when highly profitable
      if (currentFFBPrice > breakeven * 1.3 && Math.random() < 0.1) {
        const newZones = Math.max(1, Math.floor(Math.random() * 3));
        newZoneMetrics.healthy += newZones;
        
        newEvents.push({
          period: currentPeriod + 1,
          type: 'expansion',
          zones: newZones,
          description: `${newZones} new zones developed due to high profitability`
        });
      }
    } else {
      // UNPROFITABLE SCENARIO - Attrition & Risk
      const attritionFactor = (params.attritionRate / 100) * periodFactor * randomFactor;
      const areaLoss = totalArea * attritionFactor;
      totalArea = Math.max(0, totalArea - areaLoss);
      avgSentiment = Math.max(0.1, avgSentiment - 0.08 * randomFactor);
      
      // Healthy zones become at-risk
      if (avgSentiment < 0.6 && newZoneMetrics.healthy > 0) {
        const riskConversionRate = (params.contagionStrength / 100) * (0.7 - avgSentiment);
        const becomeAtRisk = Math.max(1, Math.floor(newZoneMetrics.healthy * riskConversionRate * periodFactor));
        newZoneMetrics.healthy = Math.max(0, newZoneMetrics.healthy - becomeAtRisk);
        newZoneMetrics.atRisk += becomeAtRisk;
        
        if (becomeAtRisk > 0) {
          newEvents.push({
            period: currentPeriod + 1,
            type: 'risk_increase',
            zones: becomeAtRisk,
            areaLost: Math.round(areaLoss),
            description: `${becomeAtRisk} zones became at-risk (sentiment: ${(avgSentiment * 100).toFixed(1)}%)`
          });
        }
      }
      
      // At-risk zones get abandoned
      if (newZoneMetrics.atRisk > 0) {
        const abandonmentRate = (params.attritionRate / 100) * 0.3 * periodFactor;
        const abandoned = Math.max(1, Math.floor(newZoneMetrics.atRisk * abandonmentRate * randomFactor));
        newZoneMetrics.atRisk = Math.max(0, newZoneMetrics.atRisk - abandoned);
        newZoneMetrics.abandoned += abandoned;
        
        if (abandoned > 0) {
          const lostArea = abandoned * params.baseAreaPerZone;
          newEvents.push({
            period: currentPeriod + 1,
            type: 'abandonment',
            zones: abandoned,
            areaLost: Math.round(lostArea),
            description: `${abandoned} zones abandoned (${Math.round(lostArea)} Ha lost)`
          });
        }
      }
    }
    
    // Price shock event (affects CPO price temporarily)
    const shockChance = (params.shockProbability / 100) * periodFactor;
    let shockMultiplier = 1.0;
    if (Math.random() < shockChance) {
      const shockMagnitude = 0.2 + Math.random() * 0.3; // 20-50% drop
      shockMultiplier = 1 - shockMagnitude;
      
      newEvents.push({
        period: currentPeriod + 1,
        type: 'price_shock',
        magnitude: shockMagnitude,
        description: `Major price shock: CPO prices dropped by ${(shockMagnitude * 100).toFixed(0)}%`
      });
      
      // Shock effect on sentiment
      avgSentiment = Math.max(0.05, avgSentiment - shockMagnitude * 0.7);
      
      // Shock effect on zones
      const shockEffect = Math.floor((newZoneMetrics.healthy + newZoneMetrics.atRisk) * shockMagnitude * 0.3);
      if (shockEffect > 0) {
        const healthyAffected = Math.floor(shockEffect * 0.7);
        const atRiskAffected = Math.floor(shockEffect * 0.3);
        
        newZoneMetrics.healthy = Math.max(0, newZoneMetrics.healthy - healthyAffected);
        newZoneMetrics.atRisk = Math.max(0, newZoneMetrics.atRisk + healthyAffected - atRiskAffected);
        newZoneMetrics.abandoned += atRiskAffected;
      }
    }
    
    // Recalculate total area based on zone status
    const effectiveHealthyZones = newZoneMetrics.healthy + newZoneMetrics.recovering * 0.5;
    totalArea = Math.round(effectiveHealthyZones * params.baseAreaPerZone);
    
    // Ensure values are within bounds
    totalArea = Math.max(0, totalArea);
    avgSentiment = Math.max(0.05, Math.min(1.0, parseFloat(avgSentiment.toFixed(3))));
    
    // Apply CPO price variation (with potential shock effect)
    const cpoPriceVariation = 0.95 + Math.random() * 0.1; // 5% variation
    const newCpoPrice = Math.round(params.cpoPrice * cpoPriceVariation * shockMultiplier);
    
    // Recalculate FFB price with new CPO price
    const newFFBPrice = newCpoPrice * 0.1461;
    const newProfitability = newFFBPrice >= adjustedBreakeven ? 1.0 : 0.0;
    
    const periodData = {
      period: currentPeriod + 1,
      timeLabel: getTimeLabel(currentPeriod + 1),
      totalArea,
      avgSentiment,
      ffbPrice: parseFloat(newFFBPrice.toFixed(2)),
      profitability: newProfitability,
      zoneHealthy: newZoneMetrics.healthy,
      zoneAtRisk: newZoneMetrics.atRisk,
      zoneAbandoned: newZoneMetrics.abandoned,
      zoneRecovering: newZoneMetrics.recovering,
      cpoPrice: newCpoPrice,
      attritionRate: params.attritionRate,
      contagionStrength: params.contagionStrength,
      growthRate: params.growthRate,
      shockProbability: params.shockProbability,
      subsidyImpact: params.subsidyImpact,
      baseAreaPerZone: params.baseAreaPerZone,
      zoneDensity: params.zoneDensity,
      recoveryTime: params.recoveryTime
    };
    
    return { periodData, newZoneMetrics, newEvents };
  }, [
    params, 
    selectedState, 
    calculateFFBPrice, 
    currentPeriod, 
    getCurrentMode, 
    getTimeLabel
  ]);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  // ==================== FIXED SIMULATION CONTROL ====================
  const startSimulation = useCallback(() => {
    if (isSimulating) {
      stopSimulation();
      return;
    }
    
    if (selectedParams.length < 2) {
      alert("Please select at least 2 parameters to simulate");
      return;
    }
    
    setIsSimulating(true);
    const mode = getCurrentMode();
    
    // Initialize if needed
    if (history.length === 0) {
      initializeSimulation();
    }
    
    let localPeriod = currentPeriod;
    let localHistory = [...history];
    let localZoneMetrics = { ...zoneMetrics };
    
    simulationIntervalRef.current = setInterval(() => {
      if (localPeriod >= mode.total) {
        stopSimulation();
        return;
      }
      
      const latestData = localHistory[localHistory.length - 1];
      const { periodData, newZoneMetrics, newEvents } = simulatePeriod(latestData);
      
      // Update local state
      localHistory = [...localHistory, periodData].slice(-100); // Keep last 100 periods
      localZoneMetrics = newZoneMetrics;
      localPeriod++;
      
      // Update React state
      setHistory(localHistory);
      setZoneMetrics(localZoneMetrics);
      setCurrentPeriod(localPeriod);
      
      if (newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents].slice(-20));
      }
      
    }, simulationSpeed);
  }, [
    isSimulating, 
    selectedParams.length, 
    simulationSpeed, 
    history, 
    currentPeriod, 
    zoneMetrics, 
    initializeSimulation, 
    simulatePeriod, 
    getCurrentMode,
    stopSimulation
  ]);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    initializeSimulation();
  }, [stopSimulation, initializeSimulation]);

  // ==================== PARAMETER HANDLERS ====================
  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    
    // Update zone metrics if density changes
    if (key === 'zoneDensity') {
      setZoneMetrics(prev => ({
        healthy: value,
        atRisk: 0,
        abandoned: 0,
        recovering: 0
      }));
    }
  }, []);

  const handleParamToggle = useCallback((paramId) => {
    setSelectedParams(prev => {
      if (prev.includes(paramId)) {
        return prev.filter(id => id !== paramId);
      } else {
        return [...prev, paramId];
      }
    });
  }, []);

  const handleSpeedChange = useCallback((speed) => {
    setSimulationSpeed(speed);
    if (isSimulating) {
      stopSimulation();
      // Restart simulation with new speed
      setTimeout(startSimulation, 100);
    }
  }, [isSimulating, startSimulation, stopSimulation]);

  // ==================== FILTERED PARAMETERS ====================
  const filteredParameters = useMemo(() => {
    if (!searchQuery.trim()) return availableParameters;
    
    const query = searchQuery.toLowerCase();
    return availableParameters.filter(param =>
      param.name.toLowerCase().includes(query) ||
      param.category.toLowerCase().includes(query) ||
      param.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // ==================== DERIVED DATA ====================
  const currentKPIs = useMemo(() => {
    if (history.length === 0) {
      const ffbPrice = calculateFFBPrice();
      const isProfitable = calculateProfitability();
      const totalZones = params.zoneDensity;
      const baseAreaPerZone = params.baseAreaPerZone;
      
      return {
        totalArea: totalZones * baseAreaPerZone,
        avgSentiment: stateBaselines[selectedState]?.sentimentBias || 0.5,
        ffbPrice: parseFloat(ffbPrice.toFixed(2)),
        profitability: isProfitable ? 100 : 0,
        abandonmentRisk: '0%',
        totalZones,
        healthyZones: totalZones
      };
    }
    
    const latest = history[history.length - 1];
    const totalZones = params.zoneDensity;
    const abandonmentRisk = ((latest.zoneAtRisk + latest.zoneAbandoned) / totalZones * 100).toFixed(1);
    
    return {
      totalArea: latest.totalArea,
      avgSentiment: latest.avgSentiment,
      ffbPrice: latest.ffbPrice,
      profitability: latest.profitability * 100,
      abandonmentRisk: `${abandonmentRisk}%`,
      totalZones,
      healthyZones: latest.zoneHealthy
    };
  }, [history, selectedState, calculateFFBPrice, calculateProfitability, params.zoneDensity]);

  // ==================== FIXED GRAPH DATA GENERATORS ====================
  const getGraphData = useCallback((graphType) => {
    if (!history.length) {
      // Generate initial data points for empty state
      const initialPoints = [];
      const mode = getCurrentMode();
      const displayPoints = Math.min(10, mode.total);
      
      for (let i = 0; i < displayPoints; i++) {
        const ffbPrice = calculateFFBPrice();
        const breakeven = stateBaselines[selectedState]?.breakevenPrice || 4300;
        const isProfitable = ffbPrice >= breakeven;
        const totalZones = params.zoneDensity;
        const baseArea = totalZones * params.baseAreaPerZone;
        
        initialPoints.push({
          period: i,
          label: getTimeLabel(i),
          area: baseArea,
          sentiment: (stateBaselines[selectedState]?.sentimentBias || 0.5) * 100,
          zones: totalZones,
          cpoPrice: params.cpoPrice,
          ffbPrice: parseFloat(ffbPrice.toFixed(2)),
          breakeven: breakeven,
          profitability: isProfitable ? 100 : 0,
          attrition: params.attritionRate,
          contagion: params.contagionStrength,
          atRisk: 0,
          abandoned: 0,
          growthRate: params.growthRate,
          actualGrowth: 0
        });
      }
      return initialPoints;
    }
    
    // Use actual simulation data
    const recentHistory = history.slice(-20);
    
    switch(graphType) {
      case 'areaTrend':
        return recentHistory.map(h => ({
          period: h.period,
          label: h.timeLabel,
          area: Math.max(0, Math.round(h.totalArea)),
          sentiment: Math.max(0, Math.min(100, parseFloat((h.avgSentiment * 100).toFixed(1)))),
          zones: Math.max(0, h.zoneHealthy)
        }));
        
      case 'priceAnalysis':
        return recentHistory.map(h => ({
          period: h.period,
          label: h.timeLabel,
          cpoPrice: Math.max(0, Math.round(h.cpoPrice)),
          ffbPrice: Math.max(0, parseFloat(h.ffbPrice.toFixed(2))),
          breakeven: stateBaselines[selectedState]?.breakevenPrice || 4300,
          profitability: Math.max(0, Math.min(100, parseFloat((h.profitability * 100).toFixed(1))))
        }));
        
      case 'riskMetrics':
        return recentHistory.slice(-15).map(h => ({
          period: h.period,
          label: h.timeLabel,
          attrition: Math.max(0, Math.min(100, parseFloat(h.attritionRate.toFixed(1)))),
          contagion: Math.max(0, Math.min(100, parseFloat(h.contagionStrength.toFixed(1)))),
          atRisk: Math.max(0, h.zoneAtRisk),
          abandoned: Math.max(0, h.zoneAbandoned)
        }));
        
      case 'zoneDistribution':
        const latest = history[history.length - 1];
        const distribution = [
          { name: 'Healthy', value: Math.max(0, latest.zoneHealthy), color: '#10b981' },
          { name: 'At Risk', value: Math.max(0, latest.zoneAtRisk), color: '#f59e0b' },
          { name: 'Abandoned', value: Math.max(0, latest.zoneAbandoned), color: '#ef4444' },
          { name: 'Recovering', value: Math.max(0, latest.zoneRecovering), color: '#3b82f6' }
        ].filter(item => item.value > 0);
        
        // If all values are 0, show a placeholder
        if (distribution.length === 0) {
          return [{ name: 'No Data', value: 1, color: '#9ca3af' }];
        }
        
        return distribution;
        
      case 'growthAnalysis':
        return recentHistory.slice(-15).map((h, i) => {
          let actualGrowth = 0;
          if (i > 0 && recentHistory[i-1].totalArea > 0) {
            actualGrowth = ((h.totalArea - recentHistory[i-1].totalArea) / recentHistory[i-1].totalArea * 100);
          }
          
          return {
            period: h.period,
            label: h.timeLabel,
            growthRate: Math.max(0, Math.min(100, parseFloat(h.growthRate.toFixed(1)))),
            actualGrowth: Math.max(-50, Math.min(100, parseFloat(actualGrowth.toFixed(1)))),
            area: Math.max(0, Math.round(h.totalArea))
          };
        });
        
      default:
        return [];
    }
  }, [history, selectedState, params, getCurrentMode, getTimeLabel, calculateFFBPrice]);

  // ==================== GRAPH RENDERER ====================
  const renderGraph = (graphType) => {
    const data = getGraphData(graphType);
    
    if (!data.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow h-72 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Collecting simulation data...</p>
            <p className="text-sm mt-1">Run simulation to see graphs</p>
          </div>
        </div>
      );
    }
    
    switch(graphType) {
      case 'areaTrend':
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Area & Sentiment Trend
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                    minTickGap={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#6b7280"
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#6b7280"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'area') return [`${value.toLocaleString()} Ha`, 'Total Area'];
                      if (name === 'sentiment') return [`${value.toFixed(1)}%`, 'Sentiment'];
                      if (name === 'zones') return [`${value} zones`, 'Healthy Zones'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="area" 
                    name="Total Area (Ha)"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="sentiment" 
                    name="Sentiment %"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case 'priceAnalysis':
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Price Analysis
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                    minTickGap={10}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (['cpoPrice', 'ffbPrice', 'breakeven'].includes(name)) {
                        return [`₹${value.toLocaleString()}`, name];
                      }
                      if (name === 'profitability') return [`${value.toFixed(1)}%`, 'Profitability'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="ffbPrice" 
                    name="FFB Price (₹)"
                    fill="#8884d8"
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpoPrice" 
                    name="CPO Price (₹)"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="breakeven" 
                    name="Breakeven (₹)"
                    stroke="#00c49f"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case 'riskMetrics':
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Risk Metrics
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                    minTickGap={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#6b7280"
                    allowDecimals={false}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#6b7280"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'atRisk' || name === 'abandoned') return [`${value} zones`, name];
                      if (name === 'attrition' || name === 'contagion') return [`${value}%`, name];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="atRisk" 
                    name="At-Risk Zones"
                    fill="#f59e0b"
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="abandoned" 
                    name="Abandoned Zones"
                    fill="#ef4444"
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="attrition" 
                    name="Attrition Rate %"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case 'zoneDistribution':
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Zone Status Distribution
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const total = data.reduce((sum, item) => sum + item.value, 0);
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return [`${value} zones (${percentage}%)`, props.payload.name];
                    }}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case 'growthAnalysis':
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              Growth Analysis
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                    minTickGap={10}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'actualGrowth' || name === 'growthRate') {
                        return [`${value.toFixed(1)}%`, name];
                      }
                      if (name === 'area') return [`${value.toLocaleString()} Ha`, 'Total Area'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="actualGrowth" 
                    name="Actual Growth %"
                    fill="#00c49f"
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="growthRate" 
                    name="Growth Rate %"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // ==================== DETERMINE VISIBLE GRAPHS ====================
  const visibleGraphs = useMemo(() => {
    const graphs = [];
    
    // Always show area trend if we have data
    if (history.length > 0) {
      graphs.push('areaTrend');
    }
    
    // Show price analysis if CPO price is selected
    if (selectedParams.includes('cpoPrice')) {
      graphs.push('priceAnalysis');
    }
    
    // Show risk metrics if risk parameters are selected
    const riskParams = selectedParams.filter(id => 
      ['attritionRate', 'contagionStrength', 'shockProbability'].includes(id)
    );
    if (riskParams.length > 0) {
      graphs.push('riskMetrics');
    }
    
    // Show zone distribution if we have zone data
    if (history.length > 0) {
      graphs.push('zoneDistribution');
    }
    
    // Show growth analysis if growth rate is selected
    if (selectedParams.includes('growthRate')) {
      graphs.push('growthAnalysis');
    }
    
    // Ensure we have at least one graph
    if (graphs.length === 0) {
      graphs.push('areaTrend');
    }
    
    return graphs;
  }, [selectedParams, history]);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-700 text-white p-4 sticky top-0 z-10 shadow-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Oil Palm Simulation Dashboard</h1>
              <p className="text-emerald-200 text-sm">Real-time forest-fire model simulation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all backdrop-blur-sm"
            >
              <Settings className="w-5 h-5" />
              <span>{showSidebar ? 'Hide Controls' : 'Show Controls'}</span>
            </button>
            
            <div className={`text-sm px-3 py-2 rounded-lg font-mono transition-all ${
              isSimulating 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
                : 'bg-white/20 backdrop-blur-sm'
            }`}>
              {isSimulating ? '🚀 SIMULATING' : '📊 READY'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Parameter Controls */}
        <div className={`h-full bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-2xl z-40 transition-all mb-4 duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`} style={{ width: '400px' }}>
          <div className="h-full p-6">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/90 backdrop-blur-sm pt-2 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Simulation Controls</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Simulation Controls */}
            <div className="space-y-6">
              {/* Basic Controls */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Simulation Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Simulation Mode
                    </label>
                    <select
                      value={simulationMode}
                      onChange={(e) => setSimulationMode(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSimulating}
                    >
                      {SIMULATION_MODES.map(mode => (
                        <option key={mode.id} value={mode.id}>
                          {mode.name} ({mode.label}s)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Simulation Speed
                    </label>
                    <select
                      value={simulationSpeed}
                      onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SPEED_PRESETS.map(preset => (
                        <option key={preset.id} value={preset.value}>
                          {preset.icon} {preset.name} ({preset.value}ms)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={startSimulation}
                      disabled={selectedParams.length < 2}
                      className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                        selectedParams.length < 2
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : isSimulating 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg'
                      }`}
                    >
                      {isSimulating ? (
                        <>
                          <Pause className="w-5 h-5" />
                          Stop Simulation
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Start Simulation
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={resetSimulation}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                      disabled={isSimulating}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Parameter Search & Selection */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Select Parameters
                </h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search parameters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                </div>
                
                {searchQuery ? (
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {filteredParameters.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No parameters found</p>
                    ) : (
                      filteredParameters.map(param => (
                        <div
                          key={param.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedParams.includes(param.id)
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleParamToggle(param.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-blue-600">
                                {param.icon}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{param.name}</div>
                                <div className="text-xs text-gray-600">{param.description}</div>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedParams.includes(param.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedParams.includes(param.id) && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">Available parameters:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {availableParameters.map(param => (
                        <div
                          key={param.id}
                          className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
                            selectedParams.includes(param.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                          onClick={() => handleParamToggle(param.id)}
                          title={param.description}
                        >
                          <div className="text-xs font-medium truncate">{param.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedParams.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Selected Parameters:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedParams.map(paramId => {
                        const param = availableParameters.find(p => p.id === paramId);
                        if (!param) return null;
                        
                        return (
                          <div
                            key={paramId}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm shadow-sm"
                          >
                            <span>{param.name}</span>
                            <button
                              onClick={() => handleParamToggle(paramId)}
                              className="hover:text-blue-900 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {selectedParams.length < 2 && selectedParams.length > 0 && (
                  <div className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    ⚠️ Select at least 2 parameters to start simulation
                  </div>
                )}
              </div>
              
              {/* Parameter Value Controls */}
              {selectedParams.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Adjust Parameter Values</h3>
                  <p className="text-sm text-gray-600 mb-4">Values can be changed during simulation</p>
                  
                  <div className="space-y-4">
                    {selectedParams.map(paramId => {
                      const param = availableParameters.find(p => p.id === paramId);
                      if (!param) return null;
                      
                      const value = params[paramId];
                      const percentageParams = ['attritionRate', 'contagionStrength', 'growthRate', 'shockProbability', 'subsidyImpact'];
                      
                      return (
                        <div key={paramId} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              {param.icon}
                              {param.name}
                            </label>
                            <span className="text-sm font-bold bg-white px-3 py-1 rounded-lg border border-gray-200">
                              {percentageParams.includes(paramId) ? `${value}${param.unit}` : 
                               paramId === 'cpoPrice' ? `₹${value.toLocaleString()}${param.unit}` :
                               `${value}${param.unit}`}
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={value}
                            onChange={(e) => handleParamChange(paramId, parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{param.min}{param.unit}</span>
                            <span className="font-medium">Current</span>
                            <span>{param.max}{param.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Graphs */}
        <div className={`flex-1 p-6 transition-all duration-300 ${showSidebar ? 'ml-[20px]' : 'ml-0'}`}>
          {/* Floating Sidebar Toggle */}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="fixed left-4 top-24 bg-white border border-gray-300 shadow-lg rounded-r-lg p-3 hover:bg-gray-50 z-30 transition-all hover:shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          
          {/* Current Status */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-600">Current Period</div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{currentPeriod}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {getTimeLabel(currentPeriod)}
                </div>
                <div className="text-sm text-gray-500">
                  {getCurrentMode().label} {currentPeriod + 1}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-600">Total Area</div>
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {currentKPIs.totalArea.toLocaleString()} Ha
                </div>
                <div className="text-sm text-gray-500">
                  {currentKPIs.healthyZones} of {currentKPIs.totalZones} zones healthy
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-600">FFB Price</div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  ₹{parseFloat(currentKPIs.ffbPrice).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {currentKPIs.profitability > 50 ? 'Profitable' : 'Unprofitable'} ({currentKPIs.profitability.toFixed(1)}%)
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-600">Risk Level</div>
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {currentKPIs.abandonmentRisk}
                </div>
                <div className="text-sm text-gray-500">
                  {currentKPIs.abandonmentRisk !== '0%' ? 'At-risk zones detected' : 'All zones healthy'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {isSimulating && (
            <div className="mb-8 bg-gradient-to-r from-white to-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Simulation Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-medium">Start: {getTimeLabel(0)}</span>
                  <span className="font-bold text-blue-600">Current: {getTimeLabel(currentPeriod)}</span>
                  <span className="font-medium">End: {getTimeLabel(getCurrentMode().total)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-500 shadow-inner"
                    style={{ width: `${Math.min(100, (currentPeriod / getCurrentMode().total) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 text-center">
                  {currentPeriod} of {getCurrentMode().total} {getCurrentMode().label}s completed
                  ({((currentPeriod / getCurrentMode().total) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
          )}
          
          {/* Graphs Grid */}
          {visibleGraphs.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-2xl shadow-inner">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Filter className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Simulate</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Select parameters and start simulation to visualize the forest-fire model dynamics
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-blue-600 font-bold text-lg mb-2">1</div>
                    <div className="font-medium text-gray-800">Select Parameters</div>
                    <div className="text-sm text-gray-600 mt-1">Choose at least 2 parameters to monitor</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-blue-600 font-bold text-lg mb-2">2</div>
                    <div className="font-medium text-gray-800">Adjust Values</div>
                    <div className="text-sm text-gray-600 mt-1">Set parameter values using sliders</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-blue-600 font-bold text-lg mb-2">3</div>
                    <div className="font-medium text-gray-800">Start Simulation</div>
                    <div className="text-sm text-gray-600 mt-1">Click play to begin the simulation</div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    Open Control Panel
                  </button>
                  <button
                    onClick={startSimulation}
                    disabled={selectedParams.length < 2}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      selectedParams.length < 2
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    Start Simulation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {visibleGraphs.map(graphType => (
                <div key={graphType}>
                  {renderGraph(graphType)}
                </div>
              ))}
            </div>
          )}
          
          {/* Events Log */}
          {events.length > 0 && (
            <div className="mt-8 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Simulation Events
              </h3>
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-3">
                  {events.slice(-8).reverse().map((event, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all ${
                      event.type === 'price_shock' 
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-white' 
                        : event.type === 'abandonment'
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-white'
                        : event.type === 'recovery_complete'
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-white'
                        : 'border-blue-500 bg-gradient-to-r from-blue-50 to-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            event.type === 'price_shock' ? 'bg-red-100' : 
                            event.type === 'abandonment' ? 'bg-orange-100' :
                            event.type === 'recovery_complete' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {event.type === 'price_shock' ? '⚡' : 
                             event.type === 'abandonment' ? '🔥' :
                             event.type === 'recovery_complete' ? '🌱' : '📈'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800">
                              {getTimeLabel(event.period)}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              - {event.type === 'price_shock' ? 'Price Shock' : 
                                 event.type === 'abandonment' ? 'Abandonment' :
                                 event.type === 'recovery_complete' ? 'Recovery' :
                                 event.type === 'expansion' ? 'Expansion' : 'Risk Increase'}
                            </span>
                          </div>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          event.type === 'price_shock' 
                            ? 'bg-red-100 text-red-800' 
                            : event.type === 'abandonment'
                            ? 'bg-orange-100 text-orange-800'
                            : event.type === 'recovery_complete'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.type === 'price_shock' 
                            ? `${(event.magnitude * 100).toFixed(0)}% drop`
                            : `${event.zones} zones`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 pl-13">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OilPalmForestFireSimulator;