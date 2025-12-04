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
} from "../data/staticData";
import VPFPVGPChart from "../components/charts/VPFPVGPChart";
import AreaProductionChart from "../components/charts/AreaProductionChart";
import PriceTrendChart from "../components/charts/PriceTrendChart";
import StabilityCard from "../components/cards/StabilityCard";

export default function ImpactDashboard() {
  const [stateFilter, setStateFilter] = useState("All-India");
  const [yearTypeFilter, setYearTypeFilter] = useState("financialYear");
  const [yearFilter, setYearFilter] = useState("2024-25");
  const [monthFilter, setMonthFilter] = useState("All Months");
  const [region, setRegion] = useState("National");

  // Get filtered data based on current filters
  const filteredData = useMemo(() => {
    const selectedYears = yearFilter === "All Years" ? 
      (yearTypeFilter === "financialYear" ? ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"] : 
       ["Nov-Oct 2019-20", "Nov-Oct 2020-21", "Nov-Oct 2021-22", "Nov-Oct 2022-23", "Nov-Oct 2023-24"]) 
      : [yearFilter];
    
    const selectedMonths = monthFilter === "All Months" ? MONTHS : [monthFilter];

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

    if (monthFilter && monthFilter !== 'All Months') {
      const monthObj = monthsData.find(m => m.month === monthFilter);
      if (!monthObj) return null;
      return { ffb: monthObj.ffb, cpo: monthObj.cpo, label: `${monthFilter} ${yearFilter}` };
    }

    return { ffb: avg(monthsData, 'ffb'), cpo: avg(monthsData, 'cpo'), label: `${yearFilter} (avg)` };
  }, [yearFilter, monthFilter, yearTypeFilter]);

  // Compute price cards data (respecting filters). Prefer selectedPricePoint (telangana proxy),
  // otherwise aggregate from filteredData.priceData so Year="All Years" still shows values.
  const priceCards = useMemo(() => {
    if (selectedPricePoint) return selectedPricePoint;
    if (!filteredData || !filteredData.priceData) return null;
    const entries = filteredData.priceData.flatMap(yd => (
      (yd.data || []).filter(m => monthFilter === 'All Months' || m.month === monthFilter)
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
    ? ["All Years", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26"]
    : ["All Years", "Nov-Oct 2019-20", "Nov-Oct 2020-21", "Nov-Oct 2021-22", "Nov-Oct 2022-23", "Nov-Oct 2023-24", "Nov-Oct 2024-25"];

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

        {/* News Cards: Price snapshots that respond to Year/Month filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Price Snapshot</div>
                  <div className="text-sm text-gray-600">FFB (Fresh Fruit Bunches)</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">
                    {selectedPricePoint && selectedPricePoint.ffb ? `₹${selectedPricePoint.ffb.toLocaleString()}` : '—'}
                  </div>
                  <div className="text-xs text-gray-500">{selectedPricePoint ? selectedPricePoint.label : 'Select year/month'}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">Source: Telangana data (used as proxy for all states)</div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Price Snapshot</div>
                  <div className="text-sm text-gray-600">CPO (Crude Palm Oil)</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-700">
                    {selectedPricePoint && selectedPricePoint.cpo ? `₹${selectedPricePoint.cpo.toLocaleString()}` : '—'}
                  </div>
                  <div className="text-xs text-gray-500">{selectedPricePoint ? selectedPricePoint.label : 'Select year/month'}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">Source: Telangana data (used as proxy for all states)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Status Overview - Plain Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">NMEO-OP Mission Status</h3>
            </div>
            <div className="text-sm">2030 Target Tracking</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MissionProgress 
              title="Area Expansion"
              current={missionAlignmentData.areaExpansion.current}
              target={missionAlignmentData.areaExpansion.target2030}
              unit="Million ha"
              status={missionAlignmentData.areaExpansion.status}
              description={missionAlignmentData.areaExpansion.description}
            />
            <MissionProgress 
              title="Farmer Viability"
              current={missionAlignmentData.farmerViability.score}
              target={100}
              unit="Score"
              status={missionAlignmentData.farmerViability.trend}
              description={missionAlignmentData.farmerViability.description}
            />
            <MissionProgress 
              title="Cluster Health"
              current={missionAlignmentData.clusterHealth.millsUtilization}
              target={100}
              unit="Utilization %"
              status={missionAlignmentData.clusterHealth.status}
              description={missionAlignmentData.clusterHealth.description}
            />
          </div>
        </div>
      </div>

       {/* Enhanced Filters - Plain Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        
        <div className="p-6">
          <div className="flex flex-wrap gap-6 items-end">
            <FilterSelect
              label="State/UT"
              value={stateFilter}
              onChange={setStateFilter}
              options={STATES}
            />
            {/* <FilterSelect
              label="Year Type"
              value={yearTypeFilter}
              onChange={setYearTypeFilter}
              options={["financialYear", "oilYear"]}
            /> */}
            <FilterSelect
              label="Year"
              value={yearFilter}
              onChange={setYearFilter}
              options={yearOptions}
            />
            <FilterSelect
              label="Month"
              value={monthFilter}
              onChange={setMonthFilter}
              options={["All Months", ...MONTHS]}
            />
              {/* <button className="bg-[#003366] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#164523] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Generate Report
              </button> */}
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{filteredData.stateInfo.coveragePercentage}%</div>
                <div className="text-sm text-blue-600 mt-1">Potential Area Covered</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {yearPriceSummary && yearPriceSummary.avgFFB ? `₹${yearPriceSummary.avgFFB.toLocaleString()}` : (filteredData.stateInfo.currentFFBPrice ? `₹${filteredData.stateInfo.currentFFBPrice}` : '₹19,681')}
                </div>
                <div className="text-sm text-green-600 mt-1">Avg FFB (₹/MT)</div>
              </div>

              {/* <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{filteredData.stateInfo.processingMills || 0}</div>
                <div className="text-sm text-purple-600 mt-1">Processing Mills</div>
              </div> */}
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{filteredData.stateInfo.totalExpansionTarget?.toLocaleString() || 0}</div>
              <div className="text-sm text-orange-600 mt-1">Expansion Target (ha)</div>
            </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">
                  {yearPriceSummary && yearPriceSummary.avgCPO ? `₹${yearPriceSummary.avgCPO.toLocaleString()}` : (filteredData.stateInfo.currentCPOPrice ? `₹${filteredData.stateInfo.currentCPOPrice}` : '—')}
                </div>
                <div className="text-sm text-yellow-600 mt-1">Avg CPO (₹/MT)</div>
              </div>
              {/* FFB & CPO cards (respect filters) - placed adjacent to Avg CPO */}
              <div className="text-center p-4 bg-green-50/60 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {priceCards && priceCards.ffb ? `₹${priceCards.ffb.toLocaleString()}` : '—'}
                </div>
                <div className="text-sm text-green-600 mt-1">FFB Price (₹/MT)</div>
                <div className="text-xs text-gray-500 mt-1">{priceCards ? priceCards.label : ''}</div>
              </div>

              <div className="text-center p-4 bg-yellow-50/60 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">
                  {priceCards && priceCards.cpo ? `₹${priceCards.cpo.toLocaleString()}` : '—'}
                </div>
                <div className="text-sm text-yellow-600 mt-1">CPO Price (₹/MT)</div>
                <div className="text-xs text-gray-500 mt-1">{priceCards ? priceCards.label : ''}</div>
              </div>
            </div>
          </div>
        </div>

      {/* Key Charts - Blue Header for first chart, Plain for second */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* First Chart - Blue Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h4 className="font-bold">Farmer Income Protection Mechanism</h4>
            <p className="text-sm opacity-90">VP vs FP with VGP support analysis</p>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-4">
              Shows the relationship between Govt-assured Price (VP), Market Price (FP), and Viability Gap Funding (VGP). When FP falls below VP, Govt provides VGP support to protect farmer incomes.
            </p>
            <VPFPVGPChart data={vpFpVgpData} />
          </div>
        </div>

        {/* Second Chart - Plain Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <h4 className="font-bold">Domestic Production Growth Trajectory</h4>
            <p className="text-sm">NMEO-OP Targets vs Actual Performance</p>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-4">
              Tracks area expansion and production growth under NMEO-OP. Achieving these targets is crucial for reducing import dependence and ensuring edible oil security.
            </p>
            <AreaProductionChart data={areaProductionData} />
          </div>
        </div>
      </div>

      {/* Price Trends Section - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
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
            Monthly price movement of Fresh Fruit Bunches and Crude Palm Oil in {stateFilter} region.
          </p>
          <PriceTrendChart ffbData={ffbPriceTrend} cpoData={cpoPriceTrend} selectedState={stateFilter}/>
        </div>
      </div>

      {/* Filtered price table replaced by compact price cards (see State Overview) */}

      {/* Mission Health Dashboard - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Mission Health Indicators</h3>
              <p className="text-sm opacity-90">
                Critical metrics that determine long-term success of oil palm cultivation in India
              </p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded text-sm">
              MONITORING DASHBOARD
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StabilityCard
              label="Farmer Retention Score"
              value={(nmeoOpProgress.farmerRetentionScore * 100).toFixed(0) + "%"}
              trend="stable"
              status="good"
              description="Measures farmer confidence to continue with oil palm instead of shifting to other crops. Higher scores indicate better policy effectiveness."
            />
            <StabilityCard
              label="Cluster Access to Mills"
              value={clusterStatus.millsNearby + "%"}
              trend="improving"
              status="good"
              description={`Percentage of farmers within efficient distance of processing mills. Current average distance: ${clusterStatus.avgDistanceKm} km.`}
            />
            <StabilityCard
              label="Farmer Income Risk Level"
              value={farmerRisk.riskLevel}
              trend="watch"
              status={farmerRisk.riskLevel === "Red" ? "critical" : farmerRisk.riskLevel === "Amber" ? "warning" : "good"}
              description={farmerRisk.comment}
            />
          </div>

          {/* Risk Interpretation Guide - Plain Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <h4 className="font-bold text-gray-800">Risk Level Interpretation</h4>
              <p className="text-sm text-gray-600">Understanding monitoring status indicators</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-green-800 text-sm">Green</div>
                    <div className="text-xs text-green-700">Normal operations</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-amber-800 text-sm">Amber</div>
                    <div className="text-xs text-amber-700">Monitor closely</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-red-800 text-sm">Red</div>
                    <div className="text-xs text-red-700">Immediate action required</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <div className="font-medium text-blue-900 mb-2">When Farmer Retention Score declines:</div>
              <ul className="text-blue-800 space-y-1 ml-5 list-disc">
                <li>Review and adjust VGP support levels</li>
                <li>Ensure timely subsidy payments</li>
                <li>Consider temporary duty protection</li>
                <li>Enhance extension services support</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-900 mb-2">When Cluster Access improves:</div>
              <ul className="text-green-800 space-y-1 ml-5 list-disc">
                <li>Accelerate area expansion in accessible regions</li>
                <li>Focus on yield improvement programs</li>
                <li>Plan additional processing capacity</li>
                <li>Strengthen market linkages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionProgress({ title, current, target, unit, status, description }) {
  const percentage = (current / target) * 100;
  
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
            clipPath: `inset(0 ${100 - percentage}% 0 0)`,
            borderColor: status === "on-track" ? "#10b981" : 
                        status === "improving" ? "#3b82f6" : 
                        status === "stable" ? "#f59e0b" : "#ef4444"
          }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 mb-2">{description}</div>
      <div className="text-xs text-gray-500 mb-2">Target: {target} {unit}</div>
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
          className="w-full rounded-lg border border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
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

function ChartCard({ title, explanation, children, isBlueHeader = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {isBlueHeader ? (
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <h4 className="font-bold">{title}</h4>
        </div>
      ) : (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h4 className="font-bold text-gray-800">{title}</h4>
        </div>
      )}
      <div className="p-5">
        <p className="text-sm text-gray-600 mb-4">{explanation}</p>
        {children}
      </div>
    </div>
  );
}