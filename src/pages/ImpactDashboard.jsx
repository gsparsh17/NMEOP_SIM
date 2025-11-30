import React, { useState } from "react";
import {
  STATES,
  vpFpVgpData,
  areaProductionData,
  nmeoOpProgress,
  clusterStatus,
  farmerRisk,
  missionAlignmentData,
} from "../data/staticData";
import VPFPVGPChart from "../components/charts/VPFPVGPChart";
import AreaProductionChart from "../components/charts/AreaProductionChart";
import StabilityCard from "../components/cards/StabilityCard";

export default function ImpactDashboard() {
  const [stateFilter, setStateFilter] = useState("All-India");
  const [opyFilter, setOpyFilter] = useState("2022–23");
  const [region, setRegion] = useState("National");

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mission Alignment Tracker</h2>
        <p className="text-gray-600 mt-2">
          Monitor how tariff decisions impact NMEO-OP mission objectives and farmer sustainability
        </p>
      </div>

      {/* Mission Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-8 bg-[#1e5c2a] rounded"></div>
          <h3 className="text-lg font-semibold text-gray-800">NMEO-OP Mission Status</h3>
        </div>
        
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <FilterSelect
            label="State/UT"
            value={stateFilter}
            onChange={setStateFilter}
            options={STATES}
          />
          <FilterSelect
            label="Oil Palm Year"
            value={opyFilter}
            onChange={setOpyFilter}
            options={["2021–22", "2022–23", "2023–24", "2024–25"]}
          />
          <FilterSelect
            label="Region Type"
            value={region}
            onChange={setRegion}
            options={["National", "NE & A&N", "Rest of India"]}
          />
          <div className="ml-auto">
            <button className="bg-[#1e5c2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#164523] transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Farmer Income Protection Mechanism"
          explanation="Shows the relationship between Govt-assured Price (VP), Market Price (FP), and Viability Gap Funding (VGP). When FP falls below VP, Govt provides VGP support to protect farmer incomes."
        >
          <VPFPVGPChart data={vpFpVgpData} />
        </ChartCard>

        <ChartCard 
          title="Domestic Production Growth Trajectory"
          explanation="Tracks area expansion and production growth under NMEO-OP. Achieving these targets is crucial for reducing import dependence and ensuring edible oil security."
        >
          <AreaProductionChart data={areaProductionData} />
        </ChartCard>
      </div>

      {/* Mission Health Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-[#1e5c2a] rounded"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Mission Health Indicators</h3>
            <p className="text-sm text-gray-600">
              Critical metrics that determine long-term success of oil palm cultivation in India
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Risk Interpretation Guide */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-700 text-sm mb-2">Risk Level Interpretation</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Green: Normal operations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-gray-600">Amber: Monitor closely</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Red: Immediate action required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Implications */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h4 className="font-semibold text-blue-900 mb-3">Policy Implications</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">When Farmer Retention Score declines:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Review and adjust VGP support levels</li>
              <li>Ensure timely subsidy payments</li>
              <li>Consider temporary duty protection</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">When Cluster Access improves:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Accelerate area expansion in accessible regions</li>
              <li>Focus on yield improvement programs</li>
              <li>Plan additional processing capacity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionProgress({ title, current, target, unit, status, description }) {
  const percentage = (current / target) * 100;
  
  const statusColor = status === "on-track" ? "bg-green-500" : 
                     status === "improving" ? "bg-blue-500" : 
                     status === "stable" ? "bg-amber-500" : "bg-red-500";
  
  return (
    <div className="text-center">
      <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>
      <div className="relative inline-block mb-2">
        <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">{current}</div>
            <div className="text-xs text-gray-500">{unit}</div>
          </div>
        </div>
        <div 
          className={`absolute top-0 left-0 w-24 h-24 rounded-full border-8 ${statusColor} border-t-8 border-r-8 border-b-8 border-l-8 -rotate-45`}
          style={{ 
            clipPath: `inset(0 ${100 - percentage}% 0 0)`,
            borderColor: status === "on-track" ? "#10b981" : 
                        status === "improving" ? "#3b82f6" : 
                        status === "stable" ? "#f59e0b" : "#ef4444"
          }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 mb-1">{description}</div>
      <div className="text-xs text-gray-500">Target: {target} {unit}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <select
        className="w-48 rounded-lg border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ChartCard({ title, explanation, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-xs text-gray-600 mb-3">{explanation}</p>
      {children}
    </div>
  );
}