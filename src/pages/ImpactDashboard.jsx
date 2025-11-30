import React, { useState } from "react";
import {
  STATES,
  vpFpVgpData,
  areaProductionData,
} from "../data/staticData";
import VPFPVGPChart from "../components/charts/VPFPVGPChart";
import AreaProductionChart from "../components/charts/AreaProductionChart";
import StabilityCard from "../components/cards/StabilityCard";

export default function ImpactDashboard() {
  const [stateFilter, setStateFilter] = useState("All-India");
  const [opyFilter, setOpyFilter] = useState("2022–23");
  const [region, setRegion] = useState("National");

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">

      {/* Page Intro */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-[#2F7F3E] mb-1">
          NMEO-OP Farmer Impact Dashboard
        </h2>
        <p className="text-xs text-slate-600">
          See how policy decisions affect farm income stability and domestic production.
        </p>
      </div>

      {/* FP / VP definitions — Green Gov Info Box */}
      <div className="bg-[#CFF3D6] border border-[#2F7F3E] rounded-lg p-3 text-xs">
        <p className="text-[#1e4730] font-semibold mb-1">🧭 Key Pricing Concepts</p>
        <ul className="list-disc ml-4 space-y-1 text-[#1e4730] leading-tight">
          <li><strong>VP — Viability Price:</strong> Government-assured minimum price paid to farmers</li>
          <li><strong>FP — Formula Price:</strong> Market-linked price paid by industry based on global CPO</li>
          <li><strong>Govt fills the gap</strong> when FP {"<"} VP, so farmers always get the VP</li>
        </ul>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4 flex flex-wrap gap-4 items-end text-xs">
        <FilterSelect
          label="State"
          state={stateFilter}
          setState={setStateFilter}
          options={STATES}
        />
        <FilterSelect
          label="Oil Palm Year (OPY)"
          state={opyFilter}
          setState={setOpyFilter}
          options={[
            "2021–22",
            "2022–23",
            "2023–24",
            "2024–25",
          ]}
        />
        <FilterSelect
          label="Region Type"
          state={region}
          setState={setRegion}
          options={[
            "National",
            "NE & Hilly Areas",
            "Rest of India",
          ]}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Income Stability Chart */}
        <ChartCard title="Stable Farm Income Guarantee">
          <ChartNote>
            Farmers get VP even when FP is lower — protected through Govt support.
          </ChartNote>
          <VPFPVGPChart data={vpFpVgpData} />
        </ChartCard>

        {/* Production Outlook */}
        <ChartCard title="Domestic Production Growth">
          <ChartNote>
            NMEO-OP expansion aims to reduce import dependency over time.
          </ChartNote>
          <AreaProductionChart data={areaProductionData} />
        </ChartCard>
      </div>

      {/* Stability KPIs */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
        <h3 className="text-xs font-semibold text-[#2F7F3E] mb-2">
          Income Stability Indicators
        </h3>
        <p className="text-[11px] text-slate-500 mb-4">
          Lower volatility → Stronger farmer confidence to adopt oil palm
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <StabilityCard
            label="Price Volatility Index"
            value="0.24"
            desc="How stable FP remains vs VP (lower = better)"
          />
          <StabilityCard
            label="Months FP below VP"
            value="3 / 12"
            desc="Market weakness months protected by Govt subsidy"
          />
          <StabilityCard
            label="Gov support role"
            value="42%"
            desc="Share of farmer payout paid via Govt support"
          />
        </div>
      </div>
    </div>
  );
}

/* Generic dropdown */
function FilterSelect({ label, state, setState, options }) {
  return (
    <div>
      <label className="block text-[11px] text-slate-500 mb-1">{label}</label>
      <select
        className="rounded-lg border-slate-300 text-xs"
        value={state}
        onChange={(e) => setState(e.target.value)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/* Shared chart wrapper */
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-[#2F7F3E] mb-1">{title}</h3>
      {children}
    </div>
  );
}

function ChartNote({ children }) {
  return (
    <p className="text-[11px] text-slate-500 mb-1 italic">
      {children}
    </p>
  );
}
