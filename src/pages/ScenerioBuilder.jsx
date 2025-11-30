import React, { useState, useMemo } from "react";
import PricesTab from "../components/charts/PriceCharts";
import ImportsFXCharts from "../components/charts/ImportsFXCharts";
import FiscalImpactChart from "../components/charts/FiscalImpactChart";
import TabPill from "../components/cards/TabPill";
import { liveMarket } from "../data/staticData";

export default function ScenarioBuilder() {
  const [duty, setDuty] = useState(5);
  const [cess, setCess] = useState(7.5);
  const [fx, setFx] = useState(83.5);
  const [globalShock, setGlobalShock] = useState("No Shock");
  const [weatherRisk, setWeatherRisk] = useState("Normal");
  const [clusterStatus, setClusterStatus] = useState("Expanding Well");
  const [fxShock, setFxShock] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");

  const recommendation = useMemo(() => {
    let lines = [];

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

    // Weather / domestic supply context
    if (weatherRisk === "Heat Stress" || weatherRisk === "Drought Risk") {
      lines.push(
        "Upcoming weather conditions could reduce domestic production. Keeping duty moderate can prevent shortages."
      );
    } else {
      lines.push(
        "Weather forecast is normal. Duty can be used more aggressively to protect farmer incomes during peak production."
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

    return lines;
  }, [duty, globalShock, weatherRisk, fxShock, clusterStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tariff Strategy Builder</h2>
        <p className="text-gray-600 mt-2">
          Simulate different customs duty scenarios and their impact on farmers, consumers, and government finances
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls Panel */}
        <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Policy Parameters</h3>
          
          <ControlSlider
            label="Basic Customs Duty"
            value={duty}
            min={0}
            max={25}
            setValue={setDuty}
            explanation="Higher duty protects farmers but increases consumer prices"
          />

          <ControlInput
            label="Additional Cesses"
            value={cess}
            setValue={setCess}
            explanation="Sector-specific levies and charges"
          />

          <ControlInput
            label="Exchange Rate (₹ per USD)"
            value={fx}
            setValue={setFx}
            explanation="Weaker rupee increases import costs"
          />

          <SelectInput
            label="Global Market Condition"
            state={globalShock}
            setState={setGlobalShock}
            options={["No Shock", "Mild Increase", "Moderate Increase", "Severe Increase"]}
          />

          <SelectInput
            label="Weather / Production Risk"
            state={weatherRisk}
            setState={setWeatherRisk}
            options={["Normal", "Heat Stress", "Drought Risk"]}
          />

          <SelectInput
            label="Cluster Expansion Status"
            state={clusterStatus}
            setState={setClusterStatus}
            options={["Expanding Well", "Moderate", "Slowing"]}
          />

          <ToggleSwitch
            label="Rupee Depreciation Risk"
            value={fxShock}
            setValue={setFxShock}
          />

          <div className="space-y-3 mt-6 pt-4 border-t border-gray-200">
            <button className="w-full bg-[#1e5c2a] text-white py-2.5 rounded-lg font-medium hover:bg-[#164523] transition-colors">
              Run Simulation
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Save Scenario
            </button>
            <button className="w-full border border-dashed border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Compare with Baseline
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Simulation Results</h3>
                <p className="text-sm text-gray-600">
                  Duty {duty}% · Cess {cess}% · FX {fx} ₹/USD · Global: {globalShock} · Weather: {weatherRisk}
                </p>
              </div>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <TabPill
                  label="Prices & Farmers"
                  active={activeTab === "prices"}
                  onClick={() => setActiveTab("prices")}
                />
                <TabPill
                  label="Imports & Forex"
                  active={activeTab === "imports"}
                  onClick={() => setActiveTab("imports")}
                />
                <TabPill
                  label="Fiscal Impact"
                  active={activeTab === "fiscal"}
                  onClick={() => setActiveTab("fiscal")}
                />
              </div>
            </div>

            <div className="flex-1 mb-6">
              {activeTab === "prices" && <PricesTab />}
              {activeTab === "imports" && <ImportsFXCharts />}
              {activeTab === "fiscal" && <FiscalImpactChart />}
            </div>

            {/* Policy Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-6 bg-blue-600 rounded"></div>
                <h4 className="font-semibold text-blue-900">Policy Recommendation</h4>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                {recommendation.map((line, idx) => (
                  <p key={idx}>• {line}</p>
                ))}
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                <div className="font-medium text-blue-900 mb-1">Suggested Action</div>
                <div className="text-sm text-blue-800">
                  Maintain duty at {duty}% for next 60 days, with weekly review of global price movements.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper Components */
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
        className="w-full rounded-lg border-gray-300 focus:border-[#1e5c2a] focus:ring-[#1e5c2a]"
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
        className="w-full rounded-lg border-gray-300 focus:border-[#1e5c2a] focus:ring-[#1e5c2a]"
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