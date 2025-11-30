import React, { useState } from "react";
import {
  STATES,
  YEARS,
  SCENARIOS,
  importsProdConsData,
  importShareByCountry,
  scenarioComparisonRows,
  liveMarket,
  farmerRisk,
  supplyGapSummary,
  nmeoOpProgress,
  retailInflationInfo,
} from "../data/staticData";

import ImportsProdChart from "../components/charts/ImportsProdChart";
import ImportShareDonut from "../components/charts/ImportShareDonut";
import KpiCard from "../components/cards/KpiCard";

export default function Overview() {
  const [selectedState, setSelectedState] = useState("All-India");
  const [timeRange, setTimeRange] = useState("2021–2025");
  const [scenario, setScenario] = useState("Baseline");

  const marketColor =
    liveMarket.status === "Shock"
      ? "bg-red-50 border-red-200 text-red-800"
      : liveMarket.status === "Volatile"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-green-50 border-green-200 text-green-800";

  const farmerRiskColor =
    farmerRisk.riskLevel === "Red"
      ? "bg-red-50 border-red-200 text-red-800"
      : farmerRisk.riskLevel === "Amber"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-green-50 border-green-200 text-green-800";

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Policy Situation Room</h2>
        <p className="text-gray-600 mt-2">
          Live monitoring of India's edible oil security with early-warning signals for policy action
        </p>
      </div>

      {/* Alert Strips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className={`border-l-4 border-l-red-500 bg-red-50 p-4 rounded-r-lg`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span className="font-semibold text-red-800 text-sm">GLOBAL MARKET ALERT</span>
          </div>
          <p className="text-red-700 text-sm">
            CPO prices +12% this month. Consider temporary duty reduction to protect consumers.
          </p>
        </div>

        <div className={`border-l-4 border-l-amber-500 bg-amber-50 p-4 rounded-r-lg`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <span className="font-semibold text-amber-800 text-sm">FARMER INCOME RISK</span>
          </div>
          <p className="text-amber-700 text-sm">
            Market price below Govt-assured price for 3 months. Monitor farmer retention.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <FilterSelect
            label="Geography"
            value={selectedState}
            onChange={setSelectedState}
            options={STATES}
          />
          <FilterSelect
            label="Time Horizon"
            value={timeRange}
            onChange={setTimeRange}
            options={YEARS}
          />
          <FilterSelect
            label="Scenario Mode"
            value={scenario}
            onChange={setScenario}
            options={SCENARIOS}
          />
          <div className="ml-auto">
            <button className="bg-[#1e5c2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#164523] transition-colors">
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Import Dependence"
          value={`${supplyGapSummary.importShare}%`}
          subtitle="Share of edible oil demand met by imports"
          trend="up"
          tooltip="Higher dependence increases vulnerability to global price shocks"
        />
        <KpiCard
          title="Farmer Price Gap"
          value="₹ -75 / MT"
          subtitle="Market price vs Govt-assured price"
          trend="down"
          tooltip="Negative gap requires VGP subsidy payments to protect farmers"
        />
        <KpiCard
          title="Govt Support (VGP)"
          value="₹ 5,900 Cr"
          subtitle="Estimated subsidy requirement this oil year"
          trend="up"
          tooltip="Fiscal burden for protecting farmer incomes"
        />
        <KpiCard
          title="Domestic Supply"
          value={`${supplyGapSummary.domesticShare}%`}
          subtitle="Demand met by domestic production"
          trend="up"
          tooltip="NMEO-OP target: Reduce import dependence below 40% by 2030"
        />
      </div>

      {/* NMEO-OP Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">NMEO-OP Mission Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressBar
            label="Area Expansion"
            current={nmeoOpProgress.areaCurrent}
            target={nmeoOpProgress.areaTarget2030}
            unit="Million ha"
          />
          <ProgressBar
            label="Oil Production"
            current={nmeoOpProgress.productionCurrent}
            target={nmeoOpProgress.productionTarget2030}
            unit="Million tonnes"
          />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e5c2a] mb-1">
              {(nmeoOpProgress.farmerRetentionScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Farmer Retention Score</div>
            <div className="text-xs text-gray-500 mt-1">Confidence to continue with oil palm</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <ChartCard 
          title="Supply-Demand Balance" 
          explanation="Shows how domestic production, imports, and consumption interact. Policy goal: reduce import dependency while ensuring adequate supply."
        >
          <ImportsProdChart data={importsProdConsData} />
        </ChartCard>

        <ChartCard 
          title="Import Partner Concentration Risk" 
          explanation="High dependence on single countries increases strategic vulnerability during global supply shocks."
        >
          <ImportShareDonut data={importShareByCountry} />
        </ChartCard>

        <ChartCard 
          title="Policy Action Matrix" 
          explanation="Critical indicators requiring government attention and potential intervention."
        >
          <ActionMatrix />
        </ChartCard>
      </div>

      {/* Scenario Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Scenario Comparison — Policy Outcomes</h3>
        <p className="text-gray-600 text-sm mb-4">
          Compare different tariff strategies and their impact on key national objectives
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Policy Metric</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b">Baseline</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b">Scenario A</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b">Scenario B</th>
              </tr>
            </thead>
            <tbody>
              {scenarioComparisonRows.map((row) => (
                <tr key={row.metric} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 border-b">{row.metric}</td>
                  <td className="px-4 py-3 text-right border-b">{row.baseline}</td>
                  <td className="px-4 py-3 text-right border-b">{row.scenarioA}</td>
                  <td className="px-4 py-3 text-right border-b">{row.scenarioB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

function ProgressBar({ label, current, target, unit }) {
  const percentage = (current / target) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600">{current} / {target} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#1e5c2a] h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% of 2030 target</div>
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

function ActionMatrix() {
  const actions = [
    { category: "Farmers", indicator: "FP < VP for 3 months", risk: "⚠️ Amber", action: "Increase duty support" },
    { category: "Consumers", indicator: "Retail inflation at 4.2%", risk: "🟢 Safe", action: "Monitor" },
    { category: "NMEO-OP", indicator: "Area expansion on track", risk: "🟢 Safe", action: "Continue" },
    { category: "FX Outflow", indicator: "Import cost rising", risk: "⚠️ Amber", action: "Review duty structure" }
  ];

  return (
    <div className="space-y-3">
      {actions.map((action, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-800 text-sm">{action.category}</div>
            <div className="text-xs text-gray-600">{action.indicator}</div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${
              action.risk.includes('🟢') ? 'text-green-600' : 
              action.risk.includes('⚠️') ? 'text-amber-600' : 'text-red-600'
            }`}>
              {action.risk}
            </div>
            <div className="text-xs text-gray-600">{action.action}</div>
          </div>
        </div>
      ))}
    </div>
  );
}