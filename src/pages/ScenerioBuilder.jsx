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
  // --- 1. State Management ---
  const [activeMode, setActiveMode] = useState("ai"); // "ai" or "manual"
  const [duty, setDuty] = useState(5);
  const [cess, setCess] = useState(7.5);
  const [fx, setFx] = useState(89.97);
  const [globalShock, setGlobalShock] = useState("No Shock");
  const [weatherRisk, setWeatherRisk] = useState("Normal");
  const [clusterStatus, setClusterStatus] = useState("Expanding Well");
  const [fxShock, setFxShock] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");
  const [seasonalMonth, setSeasonalMonth] = useState("October");
  const [plantationAge, setPlantationAge] = useState(7);
  const [selectedState, setSelectedState] = useState("Telangana");
  
  // Manual Input State
  const [spotPrice, setSpotPrice] = useState("");
  const [useCurrentSpot, setUseCurrentSpot] = useState(true);
  
  // API Data State
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Report UI State
  const [showReport, setShowReport] = useState(false);
  const [reportHtml, setReportHtml] = useState("");
  const MINISTRY_NAME = "Ministry of Agriculture and Farmers Welfare";

  // Get current state data
  const currentStateData = stateWiseData[selectedState] || stateWiseData["Telangana"];

  // --- 2. API Integration ---
  const fetchSimulation = async (useManualSpot = false, manualSpotPrice = null) => {
    setLoading(true);
    setError(null);
    try {
      const requestBody = {
        month_name: seasonalMonth,
        year: 2025,
        bcd: duty,
        cess: cess
      };
      
      // Add spot_price if in manual mode and provided
      if (useManualSpot && manualSpotPrice) {
        requestBody.spot_price = parseFloat(manualSpotPrice);
      }
      
      const response = await fetch("http://localhost:5000/tariff-simulation", {
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
      console.log("API Response:", data); // Debug log
      setApiResult(data);
      return data;
    } catch (err) {
      console.error("Simulation Error:", err);
      const errorMsg = err.message.includes("Model not loaded") 
        ? "AI Model not available. Please use Manual Input mode."
        : "Failed to fetch simulation data. Please check connection.";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when in AI mode
  useEffect(() => {
    if (activeMode === "ai") {
      const timer = setTimeout(() => {
        fetchSimulation(false, null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [duty, cess, seasonalMonth, activeMode]);

  // --- 3. Derived Calculations (Hybrid: API + Local) ---
  
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

  // Current market spot price (simulated)
  const currentMarketSpot = useMemo(() => {
    // Simulate current CPO spot price based on month
    const basePrice = 90;
    const monthFactor = {
      "January": 1.05, "February": 1.03, "March": 1.02,
      "April": 1.00, "May": 0.98, "June": 0.96,
      "July": 0.95, "August": 0.97, "September": 1.00,
      "October": 1.02, "November": 1.04, "December": 1.06
    };
    return (basePrice * (monthFactor[seasonalMonth] || 1)).toFixed(2);
  }, [seasonalMonth]);

  // Update spot price when toggling useCurrentSpot
  useEffect(() => {
    if (useCurrentSpot) {
      setSpotPrice(currentMarketSpot);
    }
  }, [useCurrentSpot, currentMarketSpot]);

  // --- 4. Simulation Results Logic (Hybrid: API + Frontend) ---
  const simulationResults = useMemo(() => {
    // Default values if API fails
    let cifPrice = 980; 
    let landedCost = 1140; 
    let retailPrice = 1200;
    let riskFlag = "Normal";
    let effectiveDuty = duty + cess;
    let cifSource = "default";
    let predictedPrice = null;
    let usedSpotPrice = null;

    // Override with API Data if available
    if (apiResult && !error) {
      cifPrice = apiResult.cif_price_used || apiResult.predicted_cif_price || 980;
      landedCost = apiResult.landed_cost || 1140;
      retailPrice = apiResult.estimated_retail_price || 1200;
      riskFlag = apiResult.risk_flag || "Normal";
      effectiveDuty = apiResult.effective_duty_pct || (duty + cess);
      cifSource = apiResult.cif_source || "unknown";
      predictedPrice = apiResult.predicted_cif_price;
      usedSpotPrice = apiResult.spot_price;
    }

    // Frontend calculations using API data
    const domesticProduction = currentYield * (currentStateData.areaCovered / 10000) * 0.22; // FFB to CPO
    const totalConsumption = 9.5; // National proxy or State Proxy
    const importVolume = Math.max(0, totalConsumption - domesticProduction); 
    
    // Farmer Impact: 
    // Using simple elasticity: 1% Duty increase ~= 150 Rs/MT FFB increase (Heuristic)
    const farmerPriceImpact = (duty - 5) * 150; // Base is 5% duty
    const finalFarmerPrice = Math.round(currentSeasonalPrice + farmerPriceImpact);

    // VGP (Viability Gap Payment) logic
    // If Market Price (derived from Landed) < Target Price (18000), Govt pays diff
    const fiscalCost = Math.max(0, (18000 - finalFarmerPrice) * 0.1); 

    // FX Impact
    const fxOutflow = (importVolume * cifPrice) / 1000; // Billion USD approx logic

    // State-specific self-sufficiency
    const stateSelfSufficiency = ((domesticProduction / totalConsumption) * 100).toFixed(1);
    const nationalSelfSufficiency = ((nmeoOpProgress.productionCurrent / 19.3) * 100).toFixed(1); // Based on 2023 consumption
    
    return {
      // API-driven metrics
      cifPrice: cifPrice.toFixed(1),
      landedCost: landedCost.toFixed(0),
      retailPrice: retailPrice.toFixed(0),
      riskFlag: riskFlag,
      effectiveDuty: effectiveDuty.toFixed(1),
      cifSource: cifSource,
      predictedPrice: predictedPrice,
      usedSpotPrice: usedSpotPrice,
      
      // Frontend-calculated metrics
      importVolume: importVolume.toFixed(2),
      farmerPrice: finalFarmerPrice,
      fiscalCost: fiscalCost.toFixed(0),
      fxOutflow: fxOutflow.toFixed(2),
      
      selfSufficiency: stateSelfSufficiency,
      nationalSelfSufficiency: nationalSelfSufficiency,
      stateProduction: domesticProduction.toFixed(2),
      oer: currentStateData.OER || 16.0
    };
  }, [apiResult, duty, cess, currentYield, currentSeasonalPrice, currentStateData, error]);

  // --- Report generation helpers ---
  const buildReportHtml = (results) => {
    const now = new Date();
    const timestamp = now.toLocaleString();
    const status = apiResult && !error ? 'Connected' : error ? 'Error' : 'Not Connected';

    const rows = Object.entries({
      'CIF Price (₹/MT)': results.cifPrice,
      'Landed Cost (₹/kg)': results.landedCost,
      'Retail Price (₹/kg)': results.retailPrice,
      'Effective Duty (%)': results.effectiveDuty,
      'Import Volume (M MT)': results.importVolume,
      'Farmer Price (₹/MT FFB)': results.farmerPrice,
      'VGP Fiscal Cost (₹ Cr)': results.fiscalCost,
      'State Self-Sufficiency (%)': results.selfSufficiency,
      'National Self-Sufficiency (%)': results.nationalSelfSufficiency,
      'State Production (M MT)': results.stateProduction,
      'OER (%)': results.oer,
      'Risk Flag': results.riskFlag,
    });

    const rowsHtml = rows.map(([k, v]) => `<tr><td style="padding:6px;border:1px solid #ddd">${k}</td><td style="padding:6px;border:1px solid #ddd">${v ?? '-'}</td></tr>`).join('');

    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Tariff Strategy Report</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;padding:20px}
            .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
            .ministry{font-weight:700;font-size:18px}
            .meta{font-size:13px;color:#374151}
            table{border-collapse:collapse;width:100%;margin-top:12px}
            th,td{padding:8px;border:1px solid #e5e7eb;text-align:left}
            .section-title{background:#f3f4f6;padding:8px;margin-top:12px;font-weight:600}
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="ministry">${MINISTRY_NAME}</div>
              <div class="meta">Tariff Strategy Builder — ${selectedState}</div>
            </div>
            <div style="text-align:right">
              <div class="meta">Generated: ${timestamp}</div>
              <div class="meta">Report Status: ${status}</div>
            </div>
          </div>

          <div class="section-title">Scenario Parameters</div>
          <table>
            <tr><td style="width:40%">Mode</td><td>${activeMode === 'ai' ? 'AI-Powered' : 'Manual Input'}</td></tr>
            <tr><td>Duty (BCD)</td><td>${duty}%</td></tr>
            <tr><td>Cess</td><td>${cess}%</td></tr>
            <tr><td>Season</td><td>${seasonalMonth}</td></tr>
            <tr><td>Spot Price (used)</td><td>${apiResult?.spot_price ?? '-'}</td></tr>
          </table>

          <div class="section-title">Simulation Results</div>
          <table>
            ${rowsHtml}
          </table>

          <div style="margin-top:18px;font-size:13px;color:#374151">
            <strong>Notes:</strong> This report summarizes the latest simulation output from the Tariff Strategy Builder. Values marked '-' were not available from the API.
          </div>
        </body>
      </html>`;
  };

  const generateReport = () => {
    const html = buildReportHtml(simulationResults);
    setReportHtml(html);
    setShowReport(true);
  };

  const downloadReport = () => {
    // Ensure there's a report to download
    if (!reportHtml) {
      generateReport();
    }

    // Helper to load external scripts (only if not already loaded)
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });

    (async () => {
      try {
        // Load html2canvas and jsPDF UMD builds from CDN if not present
        if (!window.html2canvas) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        if (!window.jspdf) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        // Create hidden container for rendering the report HTML
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '1200px';
        container.style.padding = '20px';
        container.innerHTML = reportHtml || buildReportHtml(simulationResults);
        document.body.appendChild(container);

        // Use html2canvas to rasterize the container
        const canvas = await window.html2canvas(container, { scale: 2, useCORS: true });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions in mm
        const pxToMm = (px) => px * 0.264583; // 1 px ≈ 0.264583 mm
        const imgWidthMm = pxToMm(canvas.width);
        const imgHeightMm = pxToMm(canvas.height);

        // Scale image to fit page width
        const scale = Math.min(1, pageWidth / imgWidthMm);
        const renderWidth = imgWidthMm * scale;
        const renderHeight = imgHeightMm * scale;

        if (renderHeight <= pageHeight) {
          pdf.addImage(imgData, 'JPEG', 0, 0, renderWidth, renderHeight);
        } else {
          // Paginate: slice the canvas vertically into page-sized chunks
          const canvasPageHeightPx = Math.floor((pageHeight / scale) / 0.264583);
          let y = 0;
          while (y < canvas.height) {
            const sliceHeight = Math.min(canvasPageHeightPx, canvas.height - y);
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;
            const ctx = pageCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
            const pageData = pageCanvas.toDataURL('image/jpeg', 0.95);
            const pageHeightMm = pxToMm(sliceHeight) * scale;
            pdf.addImage(pageData, 'JPEG', 0, 0, renderWidth, pageHeightMm);
            y += sliceHeight;
            if (y < canvas.height) pdf.addPage();
          }
        }

        // Trigger download
        pdf.save(`tariff_report_${Date.now().toString(36)}.pdf`);

        // Cleanup
        container.remove();
      } catch (err) {
        console.error('PDF generation failed:', err);
        // Fallback: download raw HTML
        const blob = new Blob([reportHtml || buildReportHtml(simulationResults)], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tariff_report_${Date.now().toString(36)}.html`;
        a.click();
        URL.revokeObjectURL(url);
        if (document.body.contains(container)) container.remove();
      }
    })();
  };

  const openReportInNewWindow = () => {
    const w = window.open();
    if (!w) return;
    w.document.write(reportHtml);
    w.document.close();
  };

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

  // --- 5. Recommendation Logic ---
  const recommendation = useMemo(() => {
    let lines = [];

    // Mode and API Status
    lines.push(`Mode: ${activeMode === "ai" ? "AI-Powered Model" : "Manual Input"}`);
    
    if (loading) {
      lines.push(`${activeMode === "ai" ? "Running AI simulation..." : "Calculating..."}`);
    } else if (error) {
      lines.push("⚠️ " + error);
    } else if (apiResult) {
      lines.push(`✅ ${activeMode === "ai" ? "AI Simulation Complete" : "Manual Calculation Complete"}: ${seasonalMonth} 2025`);
    }

    // Price source information
    if (apiResult?.cif_source) {
      if (apiResult.cif_source === "user_input_spot_price") {
        lines.push(`Using manual spot price: ₹${apiResult.spot_price || spotPrice}`);
      } else {
        lines.push(`Using AI-predicted CIF price: ₹${apiResult.predicted_cif_price}`);
      }
    }

    // State-specific context
    lines.push(`Analysis for ${selectedState}:`);
    if (stateSpecificContext.strengths.length > 0) {
      lines.push(`Strengths: ${stateSpecificContext.strengths.join(', ')}`);
    }

    // API Risk Flag Analysis
    if (simulationResults.riskFlag) {
      if (simulationResults.riskFlag.includes("Risk") || simulationResults.riskFlag.includes("Low")) {
        lines.push("WARNING: Landed cost is low. Farmer viability gap is high. Consider raising duty.");
      } else if (simulationResults.riskFlag.includes("Safe") || simulationResults.riskFlag.includes("High")) {
        lines.push("Market Status: Landed cost supports farmer prices naturally.");
      }
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
  }, [simulationResults, duty, globalShock, weatherRisk, fxShock, clusterStatus, 
      seasonalMonth, seasonAnalysis, plantationAge, currentYield, selectedState, 
      stateSpecificContext, loading, error, apiResult, activeMode, spotPrice]);

  // Handle mode change
  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === "manual") {
      // Trigger calculation with manual spot price
      if (spotPrice) {
        fetchSimulation(true, spotPrice);
      }
    }
  };

  // Handle manual calculate
  const handleManualCalculate = () => {
    if (!spotPrice || isNaN(parseFloat(spotPrice))) {
      setError("Please enter a valid spot price");
      return;
    }
    fetchSimulation(true, spotPrice);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header - Blue Header */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Tariff Strategy Builder</h2>
                <div className={`px-3 py-1 rounded text-sm font-medium ${
                  "bg-[#003366] text-white"
                }`}>
                  {activeMode === "ai" ? "AI-POWERED" : "MANUAL INPUT"}
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    {activeMode === "ai" ? "Running AI Simulation..." : "Calculating..."}
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Simulate different customs duty scenarios with AI predictions or manual price inputs
              </p>
              
              {/* Mode Toggle */}
              <div className="mt-3 flex items-center gap-4">
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => handleModeChange("ai")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMode === "ai" 
                        ? "bg-white text-gray-800 shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    🤖 AI-Powered Model
                  </button>
                  <button
                    onClick={() => handleModeChange("manual")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMode === "manual" 
                        ? "bg-white text-gray-800 shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    ✏️ Manual Input
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  {activeMode === "ai" 
                    ? "Using machine learning to predict CPO prices"
                    : "Enter current market prices manually"
                  }
                </div>
              </div>
              
              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ⚠️ {error}
                </div>
              )}
            </div>
            
            {/* API Results Display */}
            {apiResult && !loading && (
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Predicted Retail Price</div>
                <div className="text-3xl font-bold text-[#003366]">₹{simulationResults.retailPrice}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {simulationResults.cifSource === "user_input_spot_price" ? "Manual Input" : "AI Prediction"}
                </div>
              </div>
            )}
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
            {/* <SelectInput
              label="State Analysis"
              state={selectedState}
              setState={setSelectedState}
              options={Object.keys(stateWiseData).filter(state => state !== "All-India")}
            /> */}

            {/* Mode-specific controls */}
            {activeMode === "manual" && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-semibold text-blue-800 mb-3">Manual Price Input</div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">Use Current Market Price</span>
                  <button
                    onClick={() => setUseCurrentSpot(!useCurrentSpot)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useCurrentSpot ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useCurrentSpot ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPO Spot Price (₹/MT)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                    value={spotPrice}
                    onChange={(e) => setSpotPrice(e.target.value)}
                    placeholder="Enter spot price..."
                    disabled={useCurrentSpot}
                  />
                  {useCurrentSpot && (
                    <div className="text-xs text-blue-600 mt-1">
                      Using estimated current market price for {seasonalMonth}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                  <div className="font-medium">Current Market Estimate:</div>
                  <div className="mt-1">₹{currentMarketSpot} per MT CPO</div>
                  <div className="text-gray-400">Based on seasonal patterns for {seasonalMonth}</div>
                </div>
              </div>
            )}

            <ControlSlider
              label="Basic Customs Duty"
              value={duty}
              min={0}
              max={25}
              setValue={setDuty}
              explanation="Higher duty protects farmers but increases consumer prices"
            />

            <ControlInput
              label="Agricultural Cesses"
              value={cess}
              setValue={setCess}
              explanation="Sector-specific levies and charges"
            />

            <SelectInput
              label="Production Season"
              state={seasonalMonth}
              setState={setSeasonalMonth}
              options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]}
            />

            {/* Risk Flag Display */}
            {simulationResults.riskFlag && (
              <div className={`mt-4 p-4 rounded-lg border ${
                simulationResults.riskFlag.includes("Risk") || simulationResults.riskFlag.includes("Low")
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    simulationResults.riskFlag.includes("Risk") || simulationResults.riskFlag.includes("Low")
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}></div>
                  <div className={`font-semibold ${
                    simulationResults.riskFlag.includes("Risk") || simulationResults.riskFlag.includes("Low")
                      ? "text-red-800"
                      : "text-green-800"
                  }`}>
                    Farmer Risk Assessment
                  </div>
                </div>
                <div className={`text-sm ${
                  simulationResults.riskFlag.includes("Risk") || simulationResults.riskFlag.includes("Low")
                    ? "text-red-700"
                    : "text-green-700"
                }`}>
                  {simulationResults.riskFlag}
                </div>
                {simulationResults.riskFlag.includes("Risk") && (
                  <div className="mt-2 text-xs text-red-600 bg-white p-2 rounded border border-red-200">
                    ⚠️ Recommendation: Consider increasing duty to improve landed cost and protect farmers
                  </div>
                )}
              </div>
            )}

            {/* API Status Panel */}
            <div className={`mt-4 p-3 rounded-lg border ${
              activeMode === "ai" 
                ? "bg-blue-50 border-blue-200" 
                : "bg-amber-50 border-amber-200"
            }`}>
              <div className="font-semibold mb-2" style={{
                color: activeMode === "ai" ? "#1e40af" : "#92400e"
              }}>
                {activeMode === "ai" ? "AI Model Status" : "Manual Input Status"}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{
                    color: activeMode === "ai" ? "#1e40af" : "#92400e"
                  }}>
                    Mode:
                  </span>
                  <span className={`font-bold ${
                    activeMode === "ai" ? "text-blue-600" : "text-amber-600"
                  }`}>
                    {activeMode === "ai" ? "AI-Powered" : "Manual"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{
                    color: activeMode === "ai" ? "#1e40af" : "#92400e"
                  }}>
                    API Status:
                  </span>
                  <span className={`font-bold ${apiResult && !error ? "text-green-600" : "text-red-600"}`}>
                    {apiResult && !error ? "Connected" : error ? "Error" : "Not Connected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{
                    color: activeMode === "ai" ? "#1e40af" : "#92400e"
                  }}>
                    CIF Source:
                  </span>
                  <span className="font-bold text-gray-700">
                    {simulationResults.cifSource === "user_input_spot_price" ? "Manual" : 
                     simulationResults.cifSource === "model_prediction" ? "AI Model" : 
                     simulationResults.cifSource}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{
                    color: activeMode === "ai" ? "#1e40af" : "#92400e"
                  }}>
                    Risk Status:
                  </span>
                  <span className={`font-bold ${
                    simulationResults.riskFlag.includes("Safe") || simulationResults.riskFlag.includes("High") 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {simulationResults.riskFlag.includes("Safe") || simulationResults.riskFlag.includes("High") 
                      ? "Farmer Safe" 
                      : "Risk"}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Source Info */}
            {apiResult && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-800 mb-2">Price Information</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CIF Price Used:</span>
                    <span className="font-bold">₹{simulationResults.cifPrice}</span>
                  </div>
                  {activeMode === "ai" && simulationResults.predictedPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Prediction:</span>
                      <span className="font-bold">₹{parseFloat(simulationResults.predictedPrice).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Effective Duty:</span>
                    <span className="font-bold">{simulationResults.effectiveDuty}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 mt-6 pt-4 border-t border-gray-200">
              {activeMode === "ai" ? (
                <button 
                  onClick={() => fetchSimulation(false, null)}
                  disabled={loading}
                  className="w-full bg-[#003366] text-white py-2.5 rounded-lg font-medium hover:bg-[#164523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Running AI Model..." : "Recalculate AI Model"}
                </button>
              ) : (
                <button 
                  onClick={handleManualCalculate}
                  disabled={loading || !spotPrice}
                  className="w-full bg-[#003366] text-white py-2.5 rounded-lg font-medium hover:bg-bg-[#003366]-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Calculating..." : "Calculate with Manual Price"}
                </button>
              )}
              
              {/* <button className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Save Scenario
              </button> */}
              
              {/* <button className="w-full border border-dashed border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Compare with Baseline
              </button> */}
            </div>
          </div>
        </div>

        {/* Enhanced Results Panel - Blue Header */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className={`p-4 ${
            activeMode === "ai" 
              ? "bg-gradient-to-r from-[#0072bc] to-[#00509e]" 
              : "bg-gradient-to-r from-[#0072bc] to-[#00509e]" 
          } text-white`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedState} Simulation Results
                </h3>
                <p className="text-sm opacity-90">
                  {activeMode === "ai" ? "🤖 AI-Powered" : "✏️ Manual Input"} • Duty {duty}% • Cess {cess}% • {seasonalMonth}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex flex-col md:flex-row gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{simulationResults.landedCost}</div>
                  <div className="text-sm opacity-90">Landed Cost (per kg)</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{simulationResults.selfSufficiency}%</div>
                  <div className="text-sm opacity-90">State Self-Sufficiency</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col h-full">
              {/* API Simulation Results Table */}
              {apiResult && (
                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">AI Simulation Data Table</h4>
                        <p className="text-sm opacity-90">Real-time API results with interactive controls</p>
                      </div>
                      <div className="text-xs px-2 py-1 bg-white/20 rounded">
                        LIVE DATA
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          
                          {/* CIF Price Row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <div className="font-medium text-gray-900">CIF Price</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-blue-600">₹{simulationResults.cifPrice}</div>
                              <div className="text-xs text-gray-500">{simulationResults.cifSource}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {activeMode === "ai" ? "AI Predicted" : "Manual Input"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Base import cost</div>
                            </td>
                          </tr>
                          
                          {/* Landed Cost Row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <div className="font-medium text-gray-900">Landed Cost</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-green-600">₹{simulationResults.landedCost}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">After duty & cess</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Key for farmer price</div>
                            </td>
                          </tr>
                          
                          {/* Retail Price Row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                <div className="font-medium text-gray-900">Retail Price</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-purple-600">₹{simulationResults.retailPrice}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Consumer price</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Consumer impact</div>
                            </td>
                          </tr>
                          
                          {/* Effective Duty Row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                                <div className="font-medium text-gray-900">Effective Duty</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-amber-600">{simulationResults.effectiveDuty}%</div>
                              <div className="text-xs text-gray-500">BCD: {duty}% + Cess: {cess}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {Number(simulationResults.effectiveDuty) >= 15 ? "High protection" : Number(simulationResults.effectiveDuty) <= 5 ? "Low protection" : "Moderate"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Trade policy impact</div>
                            </td>
                          </tr>
                          
                          {/* Farmer Price Row */}
                          {/* <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                                <div className="font-medium text-gray-900">Farmer Price</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-teal-600">₹{simulationResults.farmerPrice.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">FFB per MT</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Based on duty impact</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Farmer income impact</div>
                            </td>
                          </tr> */}
                          
                          {/* Fiscal Cost Row */}
                          {/* <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                                <div className="font-medium text-gray-900">VGP Fiscal Cost</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-indigo-600">₹{simulationResults.fiscalCost}</div>
                              <div className="text-xs text-gray-500">Annual Viability Gap</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${
                                parseFloat(simulationResults.fiscalCost) > 100 ? "text-red-600" : 
                                parseFloat(simulationResults.fiscalCost) > 50 ? "text-amber-600" : "text-green-600"
                              }`}>
                                {parseFloat(simulationResults.fiscalCost) > 100 ? "High cost" : 
                                 parseFloat(simulationResults.fiscalCost) > 50 ? "Moderate cost" : "Low cost"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">Government expenditure</div>
                            </td>
                          </tr> */}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 text-sm bg-yellow-100 border-2 border-yellow-600 text-yellow-600 rounded-lg p-4">
                      {simulationResults.riskFlag && (
                        <div className="mb-2">
                          <strong>Risk Flag:</strong> {simulationResults.riskFlag}
                        </div>
                      )}
                      <div>
                        <strong>CIF Price Source:</strong> {simulationResults.cifSource === "user_input_spot_price" ? "Manual Spot Price" : "AI Model Prediction"}
                      </div>
                    </div>
                    
                    {/* Interactive Controls for Table */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <button onClick={generateReport} className="px-4 py-2 text-sm bg-[#003366] text-white rounded-lg hover:bg-[#164523] transition-colors">
                            Generate Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Quick Results Summary */}
              {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className={`p-4 ${
                  activeMode === "ai" 
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200" 
                    : "bg-gradient-to-r from-blue-50 to-blue-100 border-b border-amber-200"
                }`}>
                  <h4 className="font-bold text-gray-800">
                    {activeMode === "ai" ? "🤖 AI Simulation Results" : "✏️ Manual Calculation Results"}
                  </h4>
                  <p className="text-sm text-gray-600">Key metrics from current scenario</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">₹{simulationResults.retailPrice}</div>
                      <div className="text-xs text-gray-600">Retail Price</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">{simulationResults.selfSufficiency}%</div>
                      <div className="text-xs text-gray-600">State Self-Sufficiency</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">₹{simulationResults.farmerPrice.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Farmer Price</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-[#1e5c2a]">₹{simulationResults.fiscalCost}Cr</div>
                      <div className="text-xs text-gray-600">VGP Cost</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">₹{simulationResults.cifPrice}</div>
                      <div className="text-xs text-blue-600">CIF Price Used</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-lg font-bold text-green-700">{simulationResults.effectiveDuty}%</div>
                      <div className="text-xs text-green-600">Effective Duty</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-lg font-bold text-purple-700">{simulationResults.importVolume}M MT</div>
                      <div className="text-xs text-purple-600">Import Volume</div>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Enhanced Policy Recommendation */}
              {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className={`p-4 ${
                  activeMode === "ai" 
                    ? "bg-gradient-to-r from-[#0072bc] to-[#00509e]" 
                    : "bg-gradient-to-r from-[#0072bc] to-[#00509e]"
                } text-white`}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <h3 className="text-lg font-bold">
                      {selectedState} {activeMode === "ai" ? "AI" : "Manual"} Policy Recommendation
                    </h3>
                    <div className="ml-auto bg-white/20 px-2 py-1 rounded text-xs">
                      {activeMode === "ai" ? "AI-POWERED ANALYSIS" : "MANUAL ANALYSIS"}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3 text-sm text-gray-700">
                    {recommendation.map((line, idx) => (
                      <p key={idx}>• {line}</p>
                    ))}
                  </div>
                  <div className={`mt-4 p-4 rounded-lg border ${
                    activeMode === "ai" 
                      ? "bg-blue-50 border-blue-200" 
                      : "bg-amber-50 border-amber-200"
                  }`}>
                    <div className={`font-medium mb-1 ${
                      activeMode === "ai" ? "text-blue-900" : "text-amber-900"
                    }`}>
                      Suggested Action for {selectedState}
                    </div>
                    <div className={`text-sm ${
                      activeMode === "ai" ? "text-blue-800" : "text-amber-800"
                    }`}>
                      {duty >= 15 ? "Consider reducing duty to balance consumer impact while maintaining farmer support through targeted VGP." :
                       duty <= 5 ? "Consider increasing duty to better protect domestic farmers, especially during peak production season." :
                       "Maintain current duty level with close monitoring of global prices and domestic production trends."}
                      {currentStateData.coveragePercentage < 50 && " Focus on area expansion to utilize untapped potential."}
                    </div>
                  </div>
                </div> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReport(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6 z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-bold">{MINISTRY_NAME}</div>
                <div className="text-sm text-gray-600">Tariff Strategy Report — {selectedState}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadReport} className="px-3 py-1 bg-[#003366] text-white rounded">Download</button>
                <button onClick={openReportInNewWindow} className="px-3 py-1 border rounded">Open</button>
                <button onClick={() => { setShowReport(false); }} className="px-3 py-1 border rounded">Close</button>
              </div>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: reportHtml }} />
          </div>
        </div>
      )}

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
        step="0.1"
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