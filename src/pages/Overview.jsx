import React, { useState } from "react";
import {
  STATES,
  YEARS,
  SCENARIOS,
  importsProdConsData,
  importShareByCountry,
  scenarioComparisonRows,
} from "../data/staticData";

import ImportsProdChart from "../components/charts/ImportsProdChart";
import ImportShareDonut from "../components/charts/ImportShareDonut";
import KpiCard from "../components/cards/KpiCard";

export default function Overview() {
  const [selectedState, setSelectedState] = useState("All-India");
  const [timeRange, setTimeRange] = useState("2021–2025");
  const [scenario, setScenario] = useState("Baseline");

  return (
    <div className="max-w-7xl mx-auto flex gap-4">
      
      {/* Filters Panel */}
      <aside className="hidden lg:block w-64 p-4 bg-white rounded-xl shadow border border-slate-200">
        <h3 className="text-xs font-semibold mb-2 text-slate-700">Filters</h3>

        <FilterSelect label="Geography" value={selectedState} onChange={setSelectedState} options={STATES} />
        <FilterSelect label="Time Range" value={timeRange} onChange={setTimeRange} options={YEARS} />
        <FilterSelect label="Scenario" value={scenario} onChange={setScenario} options={[...SCENARIOS, "+ Create New…"]} />

        <p className="text-[11px] text-slate-500 mt-4">
          Values shown are sample data. Actual numbers update when data pipelines connect.
        </p>
      </aside>

      {/* Main */}
      <section className="flex-1 flex flex-col gap-4">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard title="Import Dependency" value="56.8%" subtitle="Share of edible oils" />
          <KpiCard title="Farmer Realized – VP gap" value="₹ -75" subtitle="Lower = better protection" />
          <KpiCard title="Govt Support Need (This FY)" value="₹ 5,900 Cr" subtitle="Viability gap subsidy" />
          <KpiCard title="Avg Landed CPO" value="₹ 132/kg" subtitle="Duty + cesses included" />
        </div>

        {/* Main charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          
          {/* Imports vs Domestic */}
          <ChartCard title="Imports vs Domestic Supply vs Consumption">
            <p className="chart-explainer">
              India imports due to demand {">"} production. Duty changes influence this gap.
            </p>
            <ImportsProdChart data={importsProdConsData} />
          </ChartCard>

          {/* Import Donut */}
          <ChartCard title="Countries Supplying Palm Oil to India">
            <p className="chart-explainer">Trade concentration influences risk exposure.</p>
            <ImportShareDonut data={importShareByCountry} />
          </ChartCard>
        </div>

        {/* Scenario Table */}
        <ChartCard title="Scenario Comparison (Policy Outcomes)">
          <p className="chart-explainer">
            Compare the impact on imports, farmer income gap & Govt spending.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Metric</th>
                  <th className="px-3 py-2 text-right">Baseline</th>
                  <th className="px-3 py-2 text-right">Scenario A</th>
                  <th className="px-3 py-2 text-right">Scenario B</th>
                </tr>
              </thead>
              <tbody>
                {scenarioComparisonRows.map((row) => (
                  <tr key={row.metric} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{row.metric}</td>
                    <td className="px-3 py-2 text-right">{row.baseline}</td>
                    <td className="px-3 py-2 text-right">{row.scenarioA}</td>
                    <td className="px-3 py-2 text-right">{row.scenarioB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

      </section>
    </div>
  );
}

/* Reusable select */
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="mb-3">
      <label className="text-[11px] text-slate-500">{label}</label>
      <select
        className="mt-1 w-full rounded-lg border-slate-200 text-xs"
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

/* Wrapper for white cards */
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-[#2F7F3E] mb-1">{title}</h4>
      {children}
    </div>
  );
}
