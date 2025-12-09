import React, { useState, useMemo, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import TradeSimulationComponent from './TradeSimulationComponent'; // or wherever you place it

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
  
  // Multi-Year Simulation State
  const [inflationRate, setInflationRate] = useState(5.0); // percentage
  const [supplyChainCost, setSupplyChainCost] = useState(14.0);
  const [supplyChainInflationRate, setSupplyChainInflationRate] = useState(5.0);
  const [safeLandedThreshold, setSafeLandedThreshold] = useState(4800.0);
  const [retailPriceThreshold, setRetailPriceThreshold] = useState(6000.0);
  const [simulationYears, setSimulationYears] = useState(5);
  const [startYear, setStartYear] = useState(2025);
  const [multiYearResults, setMultiYearResults] = useState(null);
  // Additional Multi-Year API inputs
  const [numSimulations, setNumSimulations] = useState(25);
  const [cifMin, setCifMin] = useState(3800);
  const [cifMax, setCifMax] = useState(4600);
  const [landedMin, setLandedMin] = useState(4200);
  const [landedMax, setLandedMax] = useState(5400);
  const [retailMin, setRetailMin] = useState(5200);
  const [retailMax, setRetailMax] = useState(6800);
  const [totalDutyPct, setTotalDutyPct] = useState(duty + cess);

  const [forexInrToMyr, setForexInrToMyr] = useState(0.055);
  const [forexPattern, setForexPattern] = useState("increasing");
  const [forexRate, setForexRate] = useState(0.03);
  const [forexVolatility, setForexVolatility] = useState(0.05);

  const [inflationPattern, setInflationPattern] = useState("increasing");
  const [inflationVolatilityAmplitude, setInflationVolatilityAmplitude] = useState(0.05);

  const [supplyChainBaseMin, setSupplyChainBaseMin] = useState(12);
  const [supplyChainBaseMax, setSupplyChainBaseMax] = useState(20);
  const [gstFactorMin, setGstFactorMin] = useState(1.10);
  const [gstFactorMax, setGstFactorMax] = useState(1.20);

  const [routeIssues, setRouteIssues] = useState(0.04);
  const [environmentImpact, setEnvironmentImpact] = useState(0.03);
  
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

  // Multi-Year Simulation API Call
  const fetchMultiYearSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the updated request body structure
      const requestBody = {
        start_year: startYear,
        years: simulationYears,
        num_simulations: Number(numSimulations) || 25,
        cif_range: [Number(cifMin) || 3800, Number(cifMax) || 4600],
        landed_price_range: [Number(landedMin) || 4200, Number(landedMax) || 5400],
        retail_price_range: [Number(retailMin) || 5200, Number(retailMax) || 6800],
        total_duty_pct: Number(totalDutyPct) || (duty + cess),
        safe_landed_price: Number(safeLandedThreshold),
        safe_retail_price: Number(retailPriceThreshold),
        forex_inr_to_myr: Number(forexInrToMyr),
        forex_pattern: forexPattern,
        forex_rate: Number(forexRate),
        forex_volatility_amplitude: Number(forexVolatility),
        inflation_pattern: inflationPattern,
        inflation_rate: Number(inflationRate) / 100,
        inflation_volatility_amplitude: Number(inflationVolatilityAmplitude),
        supply_chain_base_range: [Number(supplyChainBaseMin) || 12, Number(supplyChainBaseMax) || 20],
        gst_factor_range: [Number(gstFactorMin) || 1.1, Number(gstFactorMax) || 1.2],
        route_issues: Number(routeIssues) || 0.04,
        environment_impact: Number(environmentImpact) || 0.03
      };
      
      console.log("Sending multi-year request:", requestBody);
      
      const response = await fetch("http://localhost:5000/tariff-simulation-inflation-costpush", {
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
      console.log("Multi-year API Response:", data);
      setMultiYearResults(data);
      return data;
    } catch (err) {
      console.error("Multi-year Simulation Error:", err);
      const errorMsg = err.message.includes("Model not loaded") 
        ? "AI Model not available. Please use Manual Input mode."
        : "Failed to fetch multi-year simulation data. Please check connection.";
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

  const navigate = useNavigate();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('access_token');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

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
      'CIF Price (₹/kg)': results.cifPrice,
      'Landed Cost (₹/kg)': results.landedCost,
      'Retail Price (₹/kg)': results.retailPrice,
      'Effective Duty (%)': results.effectiveDuty,
      'Risk Flag': results.riskFlag,
    });

    const rowsHtml = rows.map(([k, v]) => `<tr><td style="padding:6px;border:1px solid #ddd">${k}</td><td style="padding:6px;border:1px solid #ddd">${v ?? '-'}</td></tr>`).join('');

    let html = `<!doctype html>
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
          </table>`;

    // Add multi-year results section if available
    if (multiYearResults) {
      const { simulation_paths, years_list, yearly_summary, inputs_echo } = multiYearResults;
      
      html += `
        <div class="section-title">Multi-Year Monte Carlo Simulation Results</div>
        <table>
          <tr>
            <th>Year</th>
            <th>Avg CIF Price</th>
            <th>Avg Landed Cost</th>
            <th>Avg Retail Price</th>
            <th>Farmer Risk Rate</th>
            <th>Consumer Risk Rate</th>
          </tr>`;
      
      yearly_summary?.forEach((summary, idx) => {
        html += `
          <tr>
            <td>${years_list[idx]}</td>
            <td>₹${summary.cif_stats?.avg.toFixed(0) || '-'}</td>
            <td>₹${summary.landed_stats?.avg.toFixed(0) || '-'}</td>
            <td>₹${summary.retail_stats?.avg.toFixed(0) || '-'}</td>
            <td>${(summary.farmer_risk_rate * 100).toFixed(1)}%</td>
            <td>${(summary.consumer_risk_rate * 100).toFixed(1)}%</td>
          </tr>`;
      });
      
      html += `</table>`;
      
      // Add simulation parameters
      html += `
          <div class="section-title">Simulation Parameters</div>
          <table>
            <tr><td>CIF Range</td><td>₹${inputs_echo?.cif_range?.min || 0} - ₹${inputs_echo?.cif_range?.max || 0}</td></tr>
            <tr><td>Forex Pattern</td><td>${inputs_echo?.forex_pattern || ''}</td></tr>
            <tr><td>Total Duty</td><td>${inputs_echo?.total_duty_pct || 0}%</td></tr>
            <tr><td>Safe Landed Price</td><td>₹${inputs_echo?.safe_landed_price || 0}</td></tr>
            <tr><td>Safe Retail Price</td><td>₹${inputs_echo?.safe_retail_price || 0}</td></tr>
          </table>`;
    }

    html += `
          <div style="margin-top:18px;font-size:13px;color:#374151">
            <strong>Notes:</strong> This report summarizes the latest simulation output from the Tariff Strategy Builder. Values marked '-' were not available from the API.
          </div>
        </body>
      </html>`;

    return html;
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
  

  // --- Simulation Visualization Component ---
  const SimulationVisualization = ({ simulationData }) => {
    const [currentYearIndex, setCurrentYearIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'chart'
    
    const { simulation_paths, years_list, yearly_summary } = simulationData || {};
    
    useEffect(() => {
      let interval;
      if (isPlaying && simulation_paths) {
        interval = setInterval(() => {
          setCurrentYearIndex(prev => {
            if (prev >= years_list.length - 1) {
              setIsPlaying(false);
              return 0;
            }
            return prev + 1;
          });
        }, speed);
      }
      return () => clearInterval(interval);
    }, [isPlaying, speed, simulation_paths, years_list]);
    
    if (!simulation_paths || !yearly_summary) return null;
    
    const currentYear = years_list[currentYearIndex];
    const currentYearData = yearly_summary[currentYearIndex];
    const currentSimulations = simulation_paths.map(path => path[currentYearIndex]);
    // Define ranges once so they can be used for all simulations and target lines
    const landedRange = [4200, 6800]; // From your data or user-configured ranges
    const retailRange = [5000, 7000]; // From your data or user-configured ranges
    
    const getRiskColor = (riskParty) => {
      switch(riskParty) {
        case 'farmer': return '#f97316'; // Orange
        case 'consumer': return '#ef4444'; // Red
        case 'both': return '#dc2626'; // Dark red
        default: return '#10b981'; // Green
      }
    };

    return (
      <div className="mt-6 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg">Monte Carlo Simulation Visualization</h4>
              <p className="text-sm opacity-90">Real-time risk propagation across {simulation_paths.length} simulation paths</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  {isPlaying ? <span>⏸️ Pause</span> : <span>▶️ Play</span>}
                </button>
                <button
                  onClick={() => setCurrentYearIndex(0)}
                  className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                >
                  ↺ Reset
                </button>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2 py-1 rounded text-xs ${viewMode === 'grid' ? 'bg-white text-purple-700' : 'bg-white/10'}`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`px-2 py-1 rounded text-xs ${viewMode === 'chart' ? 'bg-white text-purple-700' : 'bg-white/10'}`}
                  >
                    Chart View
                  </button>
                </div>
              </div>
              <div className="text-sm bg-white/20 px-3 py-1 rounded">
                Year: <span className="font-bold">{currentYear}</span>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Speed:</span>
              <input
                type="range"
                min="200"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-xs">{(2000 - speed) / 1000 + 1}x</span>
            </div>
            
            {/* Timeline */}
            <div className="flex-1 mx-4">
              <div className="flex justify-between text-xs mb-1">
                {years_list.map((year, idx) => (
                  <button
                    key={year}
                    onClick={() => setCurrentYearIndex(idx)}
                    className={`px-1 ${idx === currentYearIndex ? "font-bold text-white" : "text-white/70"}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <div className="h-2 bg-white/20 rounded-full relative">
                <div 
                  className="h-full bg-white rounded-full absolute top-0 left-0 transition-all duration-300"
                  style={{ width: `${(currentYearIndex / (years_list.length - 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-white/70">
              {currentSimulations.length} active simulations
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Simulation Grid */}
              <div className="lg:col-span-2">
                <div className="relative bg-gradient-to-b from-gray-50 to-white border border-gray-300 rounded-lg p-4 h-[500px]">
                  {/* Grid background */}
                  <div className="absolute inset-0">
                    {/* Horizontal lines */}
                    {[0, 20, 40, 60, 80, 100].map(pos => (
                      <div key={`h-${pos}`} className="absolute left-0 right-0 h-px bg-gray-200" style={{ top: `${pos}%` }} />
                    ))}
                    {/* Vertical lines */}
                    {[0, 20, 40, 60, 80, 100].map(pos => (
                      <div key={`v-${pos}`} className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${pos}%` }} />
                    ))}
                  </div>
                  
                  {/* Axis labels */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 text-nowrap">
                    Landed Cost (₹) → Farmer Risk Indicator
                  </div>
                  <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
                    Retail Price (₹) → Consumer Risk Indicator
                  </div>
                  
                  {/* Safe zones */}
                  <div className="absolute bg-green-50 border-2 border-green-200 rounded" 
                    style={{ 
                      left: '20%', top: '20%', 
                      width: '40%', height: '40%' 
                    }}>
                    <div className="text-xs text-green-600 p-2">Safe Zone (No Risk)</div>
                  </div>
                  
                  {/* Risk zones */}
                  <div className="absolute bg-orange-50 border-2 border-orange-200 rounded" 
                    style={{ 
                      left: '10%', top: '10%', 
                      width: '10%', height: '80%' 
                    }}>
                    <div className="text-xs text-orange-600 p-2 rotate-90">Farmer Risk Zone</div>
                  </div>
                  
                  <div className="absolute bg-red-50 border-2 border-red-200 rounded" 
                    style={{ 
                      left: '70%', top: '10%', 
                      width: '20%', height: '80%' 
                    }}>
                    <div className="text-xs text-red-600 p-2 rotate-90">Consumer Risk Zone</div>
                  </div>
                  
                  {/* Simulation dots with tooltips */}
                  {currentSimulations.map((sim, idx) => {
                    // Normalize positions based on realistic ranges
                    const xPos = ((sim.landed_cost - landedRange[0]) / (landedRange[1] - landedRange[0])) * 80 + 10;
                    const yPos = ((sim.retail_price - retailRange[0]) / (retailRange[1] - retailRange[0])) * 80 + 10;
                    
                    return (
                      <div
                        key={idx}
                        className="absolute rounded-full shadow-lg transition-all duration-500 cursor-pointer group"
                        style={{
                          left: `${Math.min(Math.max(xPos, 5), 95)}%`,
                          top: `${Math.min(Math.max(yPos, 5), 95)}%`,
                          width: '16px',
                          height: '16px',
                          backgroundColor: getRiskColor(sim.risk_party),
                          border: '2px solid white',
                          transform: `translate(-50%, -50%)`,
                          opacity: 0.9,
                          animation: `pulse 2s infinite ${idx * 0.1}s`,
                          zIndex: sim.risk_party === 'both' ? 30 : sim.risk_party === 'consumer' ? 20 : 10
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                          <div className="font-semibold mb-1">Simulation {sim.simulation_id + 1}</div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>Landed:</div>
                            <div className="text-right font-medium">₹{sim.landed_cost.toFixed(0)}</div>
                            <div>Retail:</div>
                            <div className="text-right font-medium">₹{sim.retail_price.toFixed(0)}</div>
                            <div>CIF:</div>
                            <div className="text-right">₹{sim.scenario_cif_used.toFixed(0)}</div>
                            <div>FX Rate:</div>
                            <div className="text-right">{sim.fx_inr_to_myr_used.toFixed(4)}</div>
                            <div>Risk:</div>
                            <div className={`text-right font-semibold ${
                              sim.risk_party === 'farmer' ? 'text-orange-400' :
                              sim.risk_party === 'consumer' ? 'text-red-400' :
                              'text-green-400'
                            }`}>
                              {sim.risk_party.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Target lines */}
                  <div className="absolute left-0 right-0 h-px bg-green-500 border-dashed" 
                    style={{ top: `${((6000 - retailRange[0]) / (retailRange[1] - retailRange[0])) * 80 + 10}%` }}>
                    <div className="absolute right-0 -top-6 text-xs text-green-600">Retail Target: ₹6000</div>
                  </div>
                  
                  <div className="absolute top-0 bottom-0 w-px bg-orange-500 border-dashed" 
                    style={{ left: `${((4800 - landedRange[0]) / (landedRange[1] - landedRange[0])) * 80 + 10}%` }}>
                    <div className="absolute -left-2 -bottom-8 text-xs text-orange-600 rotate-90">Landed Target: ₹4800</div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">No Risk (Safe)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Farmer at Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm">Consumer at Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-red-600 bg-red-300"></div>
                    <span className="text-sm">Both at Risk</span>
                  </div>
                </div>
              </div>
              
              {/* Right: Stats Panel */}
              <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-lg p-4">
                <h5 className="font-bold text-blue-800 mb-4">Year {currentYear} Statistics</h5>
                
                <div className="space-y-6">
                  {/* Risk Distribution */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Risk Distribution</div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-orange-600">Farmer Risk:</span>
                          <span className="font-bold">
                            {(currentYearData.farmer_risk_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${currentYearData.farmer_risk_rate * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600">Consumer Risk:</span>
                          <span className="font-bold">
                            {(currentYearData.consumer_risk_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-red-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${currentYearData.consumer_risk_rate * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-600">No Risk:</span>
                          <span className="font-bold">
                            {((1 - currentYearData.farmer_risk_rate - currentYearData.consumer_risk_rate) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${(1 - currentYearData.farmer_risk_rate - currentYearData.consumer_risk_rate) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Statistics */}
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Price Statistics (₹)</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">CIF Price</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">₹{currentYearData.cif_stats.min.toFixed(0)}</span>
                          <div className="text-center">
                            <div className="font-bold text-blue-600">₹{currentYearData.cif_stats.avg.toFixed(0)}</div>
                            <div className="text-xs text-gray-500">average</div>
                          </div>
                          <span className="text-sm">₹{currentYearData.cif_stats.max.toFixed(0)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Landed Cost</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">₹{currentYearData.landed_stats.min.toFixed(0)}</span>
                          <div className="text-center">
                            <div className={`font-bold ${currentYearData.landed_stats.avg < 4800 ? 'text-orange-600' : 'text-green-600'}`}>
                              ₹{currentYearData.landed_stats.avg.toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-500">average</div>
                          </div>
                          <span className="text-sm">₹{currentYearData.landed_stats.max.toFixed(0)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Retail Price</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">₹{currentYearData.retail_stats.min.toFixed(0)}</span>
                          <div className="text-center">
                            <div className={`font-bold ${currentYearData.retail_stats.avg > 6000 ? 'text-red-600' : 'text-green-600'}`}>
                              ₹{currentYearData.retail_stats.avg.toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-500">average</div>
                          </div>
                          <span className="text-sm">₹{currentYearData.retail_stats.max.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Risk Scenarios */}
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Top Risk Scenarios</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {currentSimulations
                        .filter(s => s.risk_party !== 'no_one')
                        .slice(0, 3)
                        .map((sim, idx) => (
                          <div key={idx} className="text-xs p-2 bg-white border border-gray-200 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">Path {sim.simulation_id + 1}</span>
                              <span className={`px-2 py-0.5 rounded ${
                                sim.risk_party === 'farmer' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {sim.risk_party}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-gray-600">
                              <div>CIF: ₹{sim.scenario_cif_used.toFixed(0)}</div>
                              <div>FX: {sim.fx_inr_to_myr_used.toFixed(4)}</div>
                            </div>
                          </div>
                      ))}
                      {currentSimulations.filter(s => s.risk_party !== 'no_one').length === 0 && (
                        <div className="text-center text-gray-500 text-xs py-4">
                          No active risk scenarios in {currentYear}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chart View
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Trends Chart */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-800 mb-4">Price Trends Over Time</div>
                  <div className="h-64">
                    {/* Simplified price chart visualization */}
                    <div className="relative h-full">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-12">
                        {[5000, 5500, 6000, 6500, 7000].map((price, idx) => (
                          <div key={price} className="absolute text-xs text-gray-500" 
                            style={{ bottom: `${(price - 5000) / 2000 * 100}%` }}>
                            ₹{price}
                          </div>
                        ))}
                      </div>
                      
                      {/* Chart area */}
                      <div className="absolute left-12 right-0 top-0 bottom-0 border-l border-b border-gray-300">
                        {/* Retail price line */}
                        <div className="absolute left-0 right-0 h-px bg-green-500 border-dashed" 
                          style={{ bottom: `${(6000 - 5000) / 2000 * 100}%` }}>
                          <div className="absolute right-0 -top-6 text-xs text-green-600">Target Retail</div>
                        </div>
                        
                        {/* Price lines for each simulation */}
                        {simulation_paths.slice(0, 5).map((path, idx) => {
                          const denom = Math.max(years_list.length - 1, 1);
                          const points = path.map((yearData, yearIdx) => {
                            const xRaw = (yearIdx / denom) * 100;
                            const yRaw = ((yearData.retail_price || 0) - 5000) / 2000 * 100;
                            const x = Math.min(Math.max(xRaw, 0), 100);
                            const y = Math.min(Math.max(yRaw, 0), 100);
                            return { x, y };
                          });
                          
                          return (
                            <div key={idx} className="absolute inset-0">
                              {/* Line */}
                              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ opacity: 0.3 }}>
                                <polyline
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="1"
                                  points={points.map(p => `${p.x},${100 - p.y}`).join(' ')}
                                />
                              </svg>
                              
                              {/* Points */}
                              {points.map((point, pointIdx) => (
                                <div
                                  key={pointIdx}
                                  className="absolute w-2 h-2 rounded-full bg-blue-500 transform -translate-x-1 -translate-y-1"
                                  style={{
                                    left: `${point.x}%`,
                                    top: `${100 - point.y}%`
                                  }}
                                />
                              ))}
                            </div>
                          );
                        })}
                        
                        {/* Year labels */}
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-between">
                          {years_list.map((year, idx) => (
                            <div key={year} className="text-xs text-gray-500">
                              {year}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Retail price trends for top 5 simulation paths
                  </div>
                </div>
                
                {/* Risk Evolution Chart */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-800 mb-4">Risk Evolution Over Years</div>
                  <div className="h-64">
                    <div className="relative h-full">
                      {/* Stacked bar chart for risk */}
                      <div className="absolute left-12 right-0 top-0 bottom-8 flex items-end space-x-1">
                        {yearly_summary.map((yearData, idx) => {
                          const barHeight = 100;
                          const farmerHeight = yearData.farmer_risk_rate * barHeight;
                          const consumerHeight = yearData.consumer_risk_rate * barHeight;
                          const safeHeight = (1 - yearData.farmer_risk_rate - yearData.consumer_risk_rate) * barHeight;
                          
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className="w-full h-48 relative">
                                {/* Safe segment */}
                                <div 
                                  className="absolute left-0 right-0 bg-green-500 rounded-t"
                                  style={{ 
                                    height: `${safeHeight}%`,
                                    bottom: 0 
                                  }}
                                ></div>
                                
                                {/* Farmer risk segment */}
                                <div 
                                  className="absolute left-0 right-0 bg-orange-500"
                                  style={{ 
                                    height: `${farmerHeight}%`,
                                    bottom: `${safeHeight}%` 
                                  }}
                                ></div>
                                
                                {/* Consumer risk segment */}
                                <div 
                                  className="absolute left-0 right-0 bg-red-500 rounded-b"
                                  style={{ 
                                    height: `${consumerHeight}%`,
                                    bottom: `${safeHeight + farmerHeight}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="mt-2 text-xs font-medium">{years_list[idx]}</div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-8 w-12">
                        {[0, 25, 50, 75, 100].map((percent, idx) => (
                          <div key={percent} className="absolute text-xs text-gray-500" 
                            style={{ bottom: `${percent}%` }}>
                            {percent}%
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-6 mt-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                      <span>No Risk</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
                      <span>Farmer Risk</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                      <span>Consumer Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Multi-Year Results Display Component ---
  const MultiYearResultsDisplay = () => {
    if (!multiYearResults) return null;
    
    const { simulation_paths, yearly_summary, years_list, inputs_echo } = multiYearResults;
    
    // Calculate overall statistics
    const allYearsData = simulation_paths.flat();
    const overallStats = {
      farmerRiskRate: (allYearsData.filter(d => d.farmer_risk).length / allYearsData.length * 100).toFixed(1),
      consumerRiskRate: (allYearsData.filter(d => d.consumer_risk).length / allYearsData.length * 100).toFixed(1),
      avgLanded: (allYearsData.reduce((sum, d) => sum + d.landed_cost, 0) / allYearsData.length).toFixed(0),
      avgRetail: (allYearsData.reduce((sum, d) => sum + d.retail_price, 0) / allYearsData.length).toFixed(0)
    };

    return (
      <div className="mt-5 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg">Multi-Year Monte Carlo Simulation Results</h4>
              <p className="text-sm opacity-90">
                {years_list.length}-Year Projection ({years_list[0]}-{years_list[years_list.length - 1]})
              </p>
            </div>
            <div className="text-xs px-2 py-1 bg-white/20 rounded">
              {simulation_paths.length} SIMULATION PATHS
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">Total Simulations</div>
              <div className="text-2xl font-bold text-blue-700">{allYearsData.length}</div>
              <div className="text-xs text-blue-500">Data points</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-orange-600 mb-1">Farmer Risk Rate</div>
              <div className="text-2xl font-bold text-orange-700">{overallStats.farmerRiskRate}%</div>
              <div className="text-xs text-orange-500">Overall average</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">Consumer Risk Rate</div>
              <div className="text-2xl font-bold text-red-700">{overallStats.consumerRiskRate}%</div>
              <div className="text-xs text-red-500">Overall average</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Avg Retail Price</div>
              <div className="text-2xl font-bold text-green-700">₹{overallStats.avgRetail}</div>
              <div className="text-xs text-green-500">Across all years</div>
            </div>
          </div>

          {/* Input Parameters Summary */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="font-semibold text-gray-800 mb-3">Simulation Input Parameters</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-600">CIF Range:</span>
                <span className="font-semibold ml-2">₹{inputs_echo?.cif_range?.min || 0} - ₹{inputs_echo?.cif_range?.max || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Forex Pattern:</span>
                <span className="font-semibold ml-2 capitalize">{inputs_echo?.forex_pattern || ''}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Duty:</span>
                <span className="font-semibold ml-2">{inputs_echo?.total_duty_pct || 0}%</span>
              </div>
              <div>
                <span className="text-gray-600">Safe Landed:</span>
                <span className="font-semibold ml-2">₹{inputs_echo?.safe_landed_price || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Safe Retail:</span>
                <span className="font-semibold ml-2">₹{inputs_echo?.safe_retail_price || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Environment Impact:</span>
                <span className="font-semibold ml-2">{(inputs_echo?.environment_impact * 100 || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Yearly Summary Table */}
          <div className="mb-6">
            <div className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <div>Yearly Summary Statistics</div>
              <div className="text-sm text-gray-500">Risk rates represent percentage of simulations at risk</div>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg CIF Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Landed Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Retail Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumer Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forex Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yearly_summary?.map((summary, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{years_list[idx]}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>₹{summary.cif_stats?.avg.toFixed(0)}</div>
                          <div className="text-xs text-gray-500">
                            (₹{summary.cif_stats?.min.toFixed(0)}-₹{summary.cif_stats?.max.toFixed(0)})
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`font-medium ${summary.landed_stats?.avg < (inputs_echo?.safe_landed_price || 0) ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{summary.landed_stats?.avg.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">Target: ₹{inputs_echo?.safe_landed_price || 0}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`font-medium ${summary.retail_stats?.avg > (inputs_echo?.safe_retail_price || 0) ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{summary.retail_stats?.avg.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">Target: ₹{inputs_echo?.safe_retail_price || 0}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${summary.farmer_risk_rate > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className={`text-sm font-medium ${summary.farmer_risk_rate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(summary.farmer_risk_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${summary.consumer_risk_rate > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className={`text-sm font-medium ${summary.consumer_risk_rate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(summary.consumer_risk_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{summary.fx_stats?.avg.toFixed(4)}</div>
                        <div className="text-xs text-gray-500">INR/MYR</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulation Visualization Component */}
          <SimulationVisualization simulationData={multiYearResults} />

          {/* Detailed Simulation Paths Table (Collapsible) */}
          <div className="mt-6">
            <details className="border border-gray-300 rounded-lg">
              <summary className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer font-medium text-gray-800">
                View Detailed Simulation Paths ({simulation_paths.length} paths × {years_list.length} years)
              </summary>
              <div className="p-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {simulation_paths.map((path, pathIndex) => {
                    const sampleYear = path[path.length - 1] || path[0] || {};
                    return (
                    <div key={pathIndex} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-gray-800">Path {pathIndex + 1}</div>
                        <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                          Base CIF: ₹{path[0]?.base_cif}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {path.slice(0, 3).map((yearData, yearIndex) => (
                          <div key={yearIndex} className="text-sm p-2 bg-gray-50 rounded border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">Year {yearData.year}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                yearData.risk_party === 'no_one' ? 'bg-green-100 text-green-800' :
                                yearData.risk_party === 'farmer' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {yearData.risk_party.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div>Landed: <span className="font-medium">₹{yearData.landed_cost.toFixed(0)}</span></div>
                              <div>Retail: <span className="font-medium">₹{yearData.retail_price.toFixed(0)}</span></div>
                              <div>FX: <span className="font-medium">{yearData.fx_inr_to_myr_used.toFixed(4)}</span></div>
                              <div>Inflation: <span className="font-medium">{yearData.gst_used}</span></div>
                            </div>
                          </div>
                        ))}
                        
                        {path.length > 3 && (
                          <div className="text-center text-xs text-gray-500 py-2 border-t">
                            + {path.length - 3} more years
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-gray-500">Env Impact:</span>
                            <span className="font-medium">{((sampleYear.environment_impact || 0) * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="block text-gray-500">Route Issues:</span>
                            <span className="font-medium">{((sampleYear.route_issues || 0) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            </details>
          </div>

          {/* Risk Analysis Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="font-semibold text-blue-800 mb-3">Risk Analysis Summary</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Risk Distribution Over Years</div>
                <div className="space-y-2">
                  {yearly_summary?.map((summary, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-16 text-sm text-gray-600">{years_list[idx]}</div>
                      <div className="flex-1 flex space-x-1">
                        <div 
                          className="h-6 bg-orange-500 rounded-l" 
                          style={{ width: `${summary.farmer_risk_rate * 100}%` }}
                          title={`Farmer Risk: ${(summary.farmer_risk_rate * 100).toFixed(1)}%`}
                        ></div>
                        <div 
                          className="h-6 bg-red-500 rounded-r" 
                          style={{ width: `${summary.consumer_risk_rate * 100}%` }}
                          title={`Consumer Risk: ${(summary.consumer_risk_rate * 100).toFixed(1)}%`}
                        ></div>
                        <div 
                          className="h-6 bg-green-500" 
                          style={{ width: `${(1 - summary.farmer_risk_rate - summary.consumer_risk_rate) * 100}%` }}
                          title={`No Risk: ${((1 - summary.farmer_risk_rate - summary.consumer_risk_rate) * 100).toFixed(1)}%`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Key Insights</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {yearly_summary?.some(s => s.farmer_risk_rate > 0.3) && (
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-2"></div>
                      <span>Farmer risk peaks in certain years, suggesting need for protective measures</span>
                    </li>
                  )}
                  {yearly_summary?.some(s => s.consumer_risk_rate > 0.3) && (
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
                      <span>Consumer risk is consistently present, indicating price pressure</span>
                    </li>
                  )}
                  {yearly_summary?.every(s => s.farmer_risk_rate < 0.5 && s.consumer_risk_rate < 0.5) && (
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                      <span>Overall risk distribution is manageable across simulation horizon</span>
                    </li>
                  )}
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Forex volatility contributes significantly to price fluctuations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add CSS styles
  const styles = `
    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
      50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <style>{styles}</style>
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
                <div className="text-3xl font-bold text-[#003366]">₹{simulationResults.retailPrice}/Kg</div>
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
        <div className="w-full lg:w-96 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h3 className="text-lg font-bold">Policy Parameters</h3>
            <p className="text-sm mt-1">Configure simulation scenarios</p>
          </div>
          
          <div className="p-6">
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
                    CPO Spot Price (₹/Kg)
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
              label="Agricultural Cess"
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
            {/* <div className={`mt-4 p-3 rounded-lg border ${
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
                    simulationResults.riskFlag?.includes("Safe") || simulationResults.riskFlag?.includes("High") 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {simulationResults.riskFlag?.includes("Safe") || simulationResults.riskFlag?.includes("High") 
                      ? "Farmer Safe" 
                      : "Risk"}
                  </span>
                </div>
              </div>
            </div> */}

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

            <div className="space-y-3 mt-6 pt-4 border-t border-b border-gray-200">
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
              
              {/* Multi-Year Controls */}
              <div className="mt-6 rounded-lg">
                <div className="font-bold border-gray-400 border-t py-4 text-blue-800 mb-3">Multi-Year Simulation Parameters</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Year
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={startYear}
                      onChange={(e) => setStartYear(parseInt(e.target.value))}
                      min="2023"
                      max="2030"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simulation Years
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={simulationYears}
                      onChange={(e) => setSimulationYears(parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Simulations</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={numSimulations}
                      onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                      min="1"
                      max="1000"
                    />
                    <div className="text-xs text-gray-500 mt-1">Number of Monte-Carlo simulation paths</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Duty % (BCD + Cess)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={totalDutyPct}
                      onChange={(e) => setTotalDutyPct(parseFloat(e.target.value))}
                    />
                    <div className="text-xs text-gray-500 mt-1">Override combined duty percentage</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CIF Range Min</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 p-2" value={cifMin} onChange={(e)=>setCifMin(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CIF Range Max</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 p-2" value={cifMax} onChange={(e)=>setCifMax(parseFloat(e.target.value))} />
                  </div>
                  <div className="text-xs text-gray-500 flex items-end">Price units: ₹/MT</div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landed Min</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 p-2" value={landedMin} onChange={(e)=>setLandedMin(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landed Max</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 p-2" value={landedMax} onChange={(e)=>setLandedMax(parseFloat(e.target.value))} />
                  </div>
                  <div className="text-xs text-gray-500 flex items-end">Used for scenario seeding</div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retail Min</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 p-2" value={retailMin} onChange={(e)=>setRetailMin(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retail Max</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 p-2" value={retailMax} onChange={(e)=>setRetailMax(parseFloat(e.target.value))} />
                  </div>
                  <div className="text-xs text-gray-500 flex items-end">Retail price seeding</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supply Chain Base Min (%)</label>
                    <input type="number" step="0.1" className="w-full rounded-lg border border-gray-300 p-2" value={supplyChainBaseMin} onChange={(e)=>setSupplyChainBaseMin(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supply Chain Base Max (%)</label>
                    <input type="number" step="0.1" className="w-full rounded-lg border border-gray-300 p-2" value={supplyChainBaseMax} onChange={(e)=>setSupplyChainBaseMax(parseFloat(e.target.value))} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Factor Min</label>
                    <input type="number" step="0.01" className="w-full rounded-lg border border-gray-300 p-2" value={gstFactorMin} onChange={(e)=>setGstFactorMin(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Factor Max</label>
                    <input type="number" step="0.01" className="w-full rounded-lg border border-gray-300 p-2" value={gstFactorMax} onChange={(e)=>setGstFactorMax(parseFloat(e.target.value))} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forex Pattern</label>
                    <select className="w-full rounded-lg border border-gray-300 p-2" value={forexPattern} onChange={(e)=>setForexPattern(e.target.value)}>
                      <option value="increasing">Increasing</option>
                      <option value="decreasing">Decreasing</option>
                      <option value="volatile">Volatile</option>
                      <option value="steady">Steady</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forex INR→MYR</label>
                    <input type="number" step="0.0001" className="w-full rounded-lg border border-gray-300 p-2" value={forexInrToMyr} onChange={(e)=>setForexInrToMyr(parseFloat(e.target.value))} />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forex Drift Rate</label>
                    <input type="number" step="0.001" className="w-full rounded-lg border border-gray-300 p-2" value={forexRate} onChange={(e)=>setForexRate(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forex Volatility Amp.</label>
                    <input type="number" step="0.001" className="w-full rounded-lg border border-gray-300 p-2" value={forexVolatility} onChange={(e)=>setForexVolatility(parseFloat(e.target.value))} />
                  </div>
                  <div className="text-xs text-gray-500 flex items-end">Forex settings for stochastic paths</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Pattern</label>
                    <select className="w-full rounded-lg border border-gray-300 p-2" value={inflationPattern} onChange={(e)=>setInflationPattern(e.target.value)}>
                      <option value="increasing">Increasing</option>
                      <option value="decreasing">Decreasing</option>
                      <option value="volatile">Volatile</option>
                      <option value="steady">Steady</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Volatility Amp.</label>
                    <input type="number" step="0.001" className="w-full rounded-lg border border-gray-300 p-2" value={inflationVolatilityAmplitude} onChange={(e)=>setInflationVolatilityAmplitude(parseFloat(e.target.value))} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route Issues (probability)</label>
                    <input type="number" step="0.001" className="w-full rounded-lg border border-gray-300 p-2" value={routeIssues} onChange={(e)=>setRouteIssues(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment Impact (probability)</label>
                    <input type="number" step="0.001" className="w-full rounded-lg border border-gray-300 p-2" value={environmentImpact} onChange={(e)=>setEnvironmentImpact(parseFloat(e.target.value))} />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Safe Landed Threshold (₹)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={safeLandedThreshold}
                      onChange={(e) => setSafeLandedThreshold(parseFloat(e.target.value))}
                    />
                    <div className="text-xs text-gray-500 mt-1">Minimum landed cost to protect farmers</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retail Price Ceiling (₹)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={retailPriceThreshold}
                      onChange={(e) => setRetailPriceThreshold(parseFloat(e.target.value))}
                    />
                    <div className="text-xs text-gray-500 mt-1">Maximum retail price for consumers</div>
                  </div>
                </div>
                
                <button
                  onClick={fetchMultiYearSimulation}
                  disabled={loading}
                  className="mt-4 w-full bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Running Multi-Year Simulation..." : "Run Multi-Year Simulation"}
                </button>
              </div>
              
            {/* Additional Simulation Options - Add this section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="font-semibold text-gray-800 mb-3">Additional Simulation Options</div>
              
              {/* Exchange Rate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={fx}
                  onChange={(e) => setFx(parseFloat(e.target.value))}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Higher rate increases import costs
                </div>
              </div>
              
              {/* Global Shock Scenario */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Global Price Shock
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={globalShock}
                  onChange={(e) => setGlobalShock(e.target.value)}
                >
                  <option value="No Shock">No Shock</option>
                  <option value="Moderate Increase">Moderate Increase (+15%)</option>
                  <option value="Severe Increase">Severe Increase (+30%)</option>
                  <option value="Price Crash">Price Crash (-20%)</option>
                </select>
              </div>
              
              {/* Weather Risk */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weather Risk
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={weatherRisk}
                  onChange={(e) => setWeatherRisk(e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Drought">Drought (-25% yield)</option>
                  <option value="Excess Rain">Excess Rain (-15% yield)</option>
                  <option value="Optimal">Optimal (+10% yield)</option>
                </select>
              </div>
              
              {/* Cluster Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cluster Expansion Status
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={clusterStatus}
                  onChange={(e) => setClusterStatus(e.target.value)}
                >
                  <option value="Expanding Well">Expanding Well</option>
                  <option value="Slowing">Slowing</option>
                  <option value="Stalled">Stalled</option>
                  <option value="Accelerating">Accelerating</option>
                </select>
              </div>
              
              {/* Plantation Age */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Plantation Age (Years)
                </label>
                <input
                  type="range"
                  className="w-full"
                  min="3"
                  max="25"
                  value={plantationAge}
                  onChange={(e) => setPlantationAge(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Young (3 yrs)</span>
                  <span className="font-semibold">{plantationAge} years</span>
                  <span>Mature (25 yrs)</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Current Yield: {currentYield} MT/ha
                </div>
              </div>
              
              {/* FX Shock Toggle */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">FX Shock Scenario</span>
                <button
                  onClick={() => setFxShock(!fxShock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    fxShock ? "bg-red-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      fxShock ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              {/* Selected State */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analysis State
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  {Object.keys(stateWiseData).map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Area: {currentStateData.areaCovered} ha | OER: {currentStateData.OER}%
                </div>
              </div>
            </div>
              
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

              {/* Multi-Year Results Display */}
              <MultiYearResultsDisplay />

            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReport(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6 z-10">
            <div className="flex items-start justify-end mb-4">
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

<div className="mt-8">
  <TradeSimulationComponent 
    onSimulationComplete={(result) => {
      // You can use the results to update your existing state
      console.log('Trade simulation completed:', result);
      
      // Example: Update duty based on recommendations
      if (result.india_recommended_policy) {
        // Parse recommendations to adjust duty
        const tariffRecommendations = result.india_recommended_policy.filter(rec => 
          rec.includes('tariff') || rec.includes('duty')
        );
        // You could implement logic here to adjust duty/cess based on recommendations
      }
    }}
  />
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