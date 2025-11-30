import React, { useState } from "react";
import PricesTab from "../components/charts/PriceCharts";
import ImportsFXCharts from "../components/charts/ImportsFXCharts";
import FiscalImpactChart from "../components/charts/FiscalImpactChart";
import TabPill from "../components/cards/TabPill";

export default function ScenarioBuilder() {
  const [duty, setDuty] = useState(5);
  const [cess, setCess] = useState(7.5);
  const [fx, setFx] = useState(83.5);
  const [globalShock, setGlobalShock] = useState("No Shock");
  const [fxShock, setFxShock] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">

      {/* Controls */}
      <aside className="w-full lg:w-72 bg-white rounded-xl shadow border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-[#2F7F3E] mb-1">Adjust Tariff Policy</h2>
        <p className="text-[11px] text-slate-500 mb-4">
          Change customs duty and global conditions to simulate future outcomes.
        </p>

        {/* Duty */}
        <ControlSlider
          label="Basic Customs Duty (%)"
          value={duty}
          min={0}
          max={25}
          setValue={setDuty}
        />

        {/* Cess */}
        <ControlInput
          label="Additional Cesses (%)"
          value={cess}
          setValue={setCess}
        />

        {/* FX */}
        <ControlInput
          label="₹ per USD (Exchange Rate)"
          value={fx}
          setValue={setFx}
        />

        {/* Global shock */}
        <SelectInput
          label="Global Market Condition"
          state={globalShock}
          setState={setGlobalShock}
          options={["No Shock", "Mild Increase", "Moderate Increase", "Severe Increase"]}
        />

        {/* FX shock */}
        <ToggleSwitch
          label="Dollar Strengthening?"
          value={fxShock}
          setValue={setFxShock}
        />

        <button className="mt-4 bg-[#2F7F3E] hover:bg-green-700 text-white text-sm rounded-lg py-2 transition">
          Run Simulation
        </button>
      </aside>

      {/* Results */}
      <section className="flex-1 bg-white rounded-xl shadow border border-slate-200 p-4 flex flex-col">
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#2F7F3E]">Scenario Results</h3>
            <p className="text-[11px] text-slate-500">
              Duty {duty}% · Cess {cess}% · FX {fx} ₹/USD
            </p>
          </div>

          <div className="flex gap-2 bg-slate-100 rounded-full p-1">
            <TabPill label="Farmer Prices" active={activeTab === "prices"} onClick={() => setActiveTab("prices")} />
            <TabPill label="Imports & Forex" active={activeTab === "imports"} onClick={() => setActiveTab("imports")} />
            <TabPill label="Govt Cost" active={activeTab === "fiscal"} onClick={() => setActiveTab("fiscal")} />
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "prices" && (
          <>
            <PricesTab />
            <p className="chart-explainer mt-1">
              VP = minimum assured by Government; FP = price linked to market conditions.
            </p>
          </>
        )}

        {activeTab === "imports" && (
          <>
            <ImportsFXCharts />
            <p className="chart-explainer mt-1">
              Higher duties may reduce import volume and foreign exchange outflow.
            </p>
          </>
        )}

        {activeTab === "fiscal" && (
          <>
            <FiscalImpactChart />
            <p className="chart-explainer mt-1">
              When FP falls below VP, Govt pays the gap to farmers (VGP subsidy).
            </p>
          </>
        )}
      </section>
    </div>
  );
}

/* Helpers for Controls */
function ControlSlider({ label, value, setValue, min, max }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
      <input type="range" className="w-full" min={min} max={max} value={value} onChange={(e) => setValue(+e.target.value)} />
      <div className="text-[11px] text-slate-600 mt-1">{value}%</div>
    </div>
  );
}

function ControlInput({ label, value, setValue }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
      <input type="number" className="w-full rounded-lg border-slate-200 text-sm" value={value} onChange={(e) => setValue(+e.target.value)} />
    </div>
  );
}

function SelectInput({ label, state, setState, options }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
      <select className="w-full rounded-lg border-slate-200 text-sm" value={state} onChange={(e) => setState(e.target.value)}>
        {options.map((o) => (<option key={o}>{o}</option>))}
      </select>
    </div>
  );
}

function ToggleSwitch({ label, value, setValue }) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <button onClick={() => setValue((v) => !v)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${value ? "bg-green-600" : "bg-slate-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? "translate-x-4" : "translate-x-1"}`} />
      </button>
    </div>
  );
}
