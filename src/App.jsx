// App.jsx
import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATES = ["All-India", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Odisha"];
const YEARS = ["2010–2015", "2016–2020", "2021–2025", "2026–2030"];
const SCENARIOS = ["Baseline", "Scenario A", "Scenario B"];

const COLORS = ["#2563eb", "#f97316", "#16a34a", "#7c3aed", "#e11d48"];

const importsProdConsData = [
  { year: 2015, imports: 8.3, production: 6.5, consumption: 14.0 },
  { year: 2016, imports: 8.7, production: 6.8, consumption: 14.7 },
  { year: 2017, imports: 9.1, production: 7.2, consumption: 15.4 },
  { year: 2018, imports: 8.8, production: 7.5, consumption: 15.6 },
  { year: 2019, imports: 9.3, production: 7.7, consumption: 16.2 },
  { year: 2020, imports: 8.9, production: 8.0, consumption: 16.4 },
];

const importShareByCountry = [
  { name: "Indonesia", value: 55 },
  { name: "Malaysia", value: 35 },
  { name: "Thailand", value: 5 },
  { name: "Others", value: 5 },
];

const scenarioComparisonRows = [
  {
    metric: "Import Dependency (%)",
    baseline: 58,
    scenarioA: 52,
    scenarioB: 47,
  },
  {
    metric: "Avg Farmer Price vs VP (₹/tonne)",
    baseline: "VP – 200",
    scenarioA: "VP – 80",
    scenarioB: "VP – 30",
  },
  {
    metric: "GoI VGP Outlay (₹ crore)",
    baseline: 6200,
    scenarioA: 5400,
    scenarioB: 5100,
  },
  {
    metric: "Average Landed CPO (₹/kg)",
    baseline: 130,
    scenarioA: 136,
    scenarioB: 141,
  },
];

const priceChartData = [
  { month: "Jan", intl: 100, landed: 130, fp: 18, vp: 20, realized: 19 },
  { month: "Feb", intl: 105, landed: 135, fp: 19, vp: 20, realized: 19.5 },
  { month: "Mar", intl: 98, landed: 128, fp: 18.2, vp: 20, realized: 19.2 },
  { month: "Apr", intl: 110, landed: 140, fp: 20, vp: 20, realized: 20 },
];

const importsFXData = [
  { year: "2022", baselineImports: 9.0, scenarioImports: 8.3, baselineFx: 6500, scenarioFx: 6100 },
  { year: "2023", baselineImports: 9.4, scenarioImports: 8.5, baselineFx: 6800, scenarioFx: 6300 },
];

const fiscalImpactData = [
  { actor: "Industry", baseline: 40, scenario: 44 },
  { actor: "GoI (VGP)", baseline: 45, scenario: 38 },
  { actor: "Consumers", baseline: 15, scenario: 18 },
];

const vpFpVgpData = [
  { year: "2022", vp: 20, fp: 18.3, vgp: 1.7 },
  { year: "2023", vp: 21, fp: 19.2, vgp: 1.8 },
  { year: "2024", vp: 22, fp: 20.5, vgp: 1.5 },
];

const areaProductionData = [
  { year: "2022", area: 0.7, production: 0.27 },
  { year: "2023", area: 0.8, production: 0.35 },
  { year: "2024", area: 0.9, production: 0.45 },
  { year: "2025", area: 1.0, production: 0.55 },
];

const diagnosticsDataQuality = [
  { series: "CPO Prices", completeness: 98, revisions: 3 },
  { series: "Imports Volume", completeness: 96, revisions: 5 },
  { series: "Retail Prices", completeness: 89, revisions: 8 },
];

const diagnosticsModelPerf = [
  { model: "CPO Price Forecast", mape: 6.2, rmse: 12.4 },
  { model: "Import Demand", mape: 8.5, rmse: 0.23 },
  { model: "Retail Pass-through", mape: 7.1, rmse: 1.8 },
];

function App() {
  const [activeScreen, setActiveScreen] = useState("home");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <header className="w-full bg-slate-900 text-slate-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
            P
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Palm Oil Policy Simulator
            </h1>
            <p className="text-xs text-slate-300">
              NMEO-OP Tariff & Farmer Income Decision Support
            </p>
          </div>
        </div>
        <nav className="hidden md:flex gap-4 text-sm">
          <button
            onClick={() => setActiveScreen("home")}
            className={`px-3 py-1 rounded-full ${
              activeScreen === "home"
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveScreen("scenario")}
            className={`px-3 py-1 rounded-full ${
              activeScreen === "scenario"
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Scenario Builder
          </button>
          <button
            onClick={() => setActiveScreen("impact")}
            className={`px-3 py-1 rounded-full ${
              activeScreen === "impact"
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            NMEO-OP Impact
          </button>
          <button
            onClick={() => setActiveScreen("diagnostics")}
            className={`px-3 py-1 rounded-full ${
              activeScreen === "diagnostics"
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Data & Models
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-xs text-right">
            <div className="font-medium">Dept. of Agriculture & Farmers Welfare</div>
            <div className="text-slate-300">Oil Palm (NMEO-OP) · Policy User</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">
            MoA
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6">
        {activeScreen === "home" && <ScreenHome />}
        {activeScreen === "scenario" && <ScreenScenarioBuilder />}
        {activeScreen === "impact" && <ScreenImpact />}
        {activeScreen === "diagnostics" && <ScreenDiagnostics />}
      </main>
    </div>
  );
}

/* Screen 1 – Policy Maker Home (Overview) */
function ScreenHome() {
  const [selectedState, setSelectedState] = useState("All-India");
  const [timeRange, setTimeRange] = useState("2021–2025");
  const [scenario, setScenario] = useState("Baseline");

  return (
    <div className="max-w-7xl mx-auto flex gap-4">
      {/* Left Filters */}
      <aside className="w-64 hidden lg:block bg-white rounded-xl shadow-sm p-4 border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Filters
        </h2>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Geography
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full rounded-lg border-slate-200 text-sm"
          >
            {STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full rounded-lg border-slate-200 text-sm"
          >
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Scenario
          </label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full rounded-lg border-slate-200 text-sm"
          >
            {SCENARIOS.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
            <option value="CreateNew">+ Create New…</option>
          </select>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Note: KPIs are simulated values for illustration. Real values will be
          loaded from NMEO-OP & trade datasets.
        </p>
      </aside>

      {/* Main Area */}
      <section className="flex-1 flex flex-col gap-4">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title="Import Dependency"
            value="56.8%"
            subtitle="% of total edible oils"
          />
          <KpiCard
            title="Farmer Realized vs VP"
            value="₹ -75"
            subtitle="Gap per tonne (avg)"
          />
          <KpiCard
            title="GoI VGP (This FY)"
            value="₹ 5,900 Cr"
            subtitle="Viability Gap Payout"
          />
          <KpiCard
            title="Avg Landed CPO"
            value="₹ 132/kg"
            subtitle="Incl. current duties"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Big line chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Imports vs Domestic Production vs Consumption
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedState} · {timeRange} · Scenario: {scenario}
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={importsProdConsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="imports"
                    name="Imports (mt)"
                    stroke={COLORS[0]}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="production"
                    name="Domestic Production (mt)"
                    stroke={COLORS[1]}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    name="Consumption (mt)"
                    stroke={COLORS[2]}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Share of Countries in India’s Palm Oil Imports
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Based on long-run UN / DGFT import shares
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={importShareByCountry}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {importShareByCountry.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                Scenario Comparison (Baseline vs Selected Scenario)
              </h3>
              <p className="text-xs text-slate-500">
                High-level comparison of key indicators
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="text-left px-3 py-2 font-medium">Metric</th>
                  <th className="text-right px-3 py-2 font-medium">Baseline</th>
                  <th className="text-right px-3 py-2 font-medium">Scenario A</th>
                  <th className="text-right px-3 py-2 font-medium">Scenario B</th>
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
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{subtitle}</p>
    </div>
  );
}

/* Screen 2 – Scenario Builder */
function ScreenScenarioBuilder() {
  const [duty, setDuty] = useState(5);
  const [cess, setCess] = useState(7.5);
  const [fx, setFx] = useState(83.5);
  const [globalShock, setGlobalShock] = useState("none");
  const [fxShock, setFxShock] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
      {/* Left controls */}
      <aside className="w-full lg:w-72 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Scenario Inputs
        </h2>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            CPO Basic Customs Duty (%)
          </label>
          <input
            type="range"
            min={0}
            max={20}
            value={duty}
            onChange={(e) => setDuty(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-600 mt-1">
            {duty.toFixed(1)} %
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Additional Cesses / Surcharges (%)
          </label>
          <input
            type="number"
            value={cess}
            onChange={(e) => setCess(Number(e.target.value))}
            className="w-full rounded-lg border-slate-200 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            INR / USD Assumption
          </label>
          <input
            type="number"
            value={fx}
            onChange={(e) => setFx(Number(e.target.value))}
            className="w-full rounded-lg border-slate-200 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Apply Global Price Shock?
          </label>
          <select
            value={globalShock}
            onChange={(e) => setGlobalShock(e.target.value)}
            className="w-full rounded-lg border-slate-200 text-sm"
          >
            <option value="none">No Shock</option>
            <option value="mild">Mild</option>
            <option value="medium">Medium</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Apply FX Shock?
          </span>
          <button
            onClick={() => setFxShock((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              fxShock ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                fxShock ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button className="w-full rounded-lg bg-slate-900 text-slate-50 text-sm py-2">
            Run Simulation
          </button>
          <button className="w-full rounded-lg border border-slate-300 text-sm py-2">
            Save Scenario
          </button>
          <button className="w-full rounded-lg border border-dashed border-slate-300 text-sm py-2">
            Compare with Baseline
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          These controls will feed into the pricing & elasticity models. Values
          shown on the right are currently using sample data.
        </p>
      </aside>

      {/* Right results */}
      <section className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Scenario Results
            </h2>
            <p className="text-xs text-slate-500">
              Duty: {duty}% · Cess: {cess}% · FX: ₹{fx}/USD · Global shock:{" "}
              {globalShock || "none"}
            </p>
          </div>
          <div className="flex gap-2 text-xs bg-slate-100 rounded-full p-1">
            <TabPill
              label="Prices"
              active={activeTab === "prices"}
              onClick={() => setActiveTab("prices")}
            />
            <TabPill
              label="Imports & FX"
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

        <div className="flex-1">
          {activeTab === "prices" && <PricesTab />}
          {activeTab === "imports" && <ImportsTab />}
          {activeTab === "fiscal" && <FiscalTab />}
        </div>
      </section>
    </div>
  );
}

function TabPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

function PricesTab() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top: landed vs intl */}
      <div className="h-64">
        <h3 className="text-xs font-semibold text-slate-700 mb-1">
          Landed CPO Price vs International Price
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="intl"
              name="International CPO (₹)"
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="landed"
              name="Landed CPO (₹)"
              stroke={COLORS[1]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom: FP vs VP vs realized */}
      <div className="h-64">
        <h3 className="text-xs font-semibold text-slate-700 mb-1">
          FP vs VP vs Farmer Realized Price (with VGP Band)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="vp"
              name="Viability Price (VP)"
              stroke={COLORS[2]}
              fill={COLORS[2]}
              fillOpacity={0.05}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="fp"
              name="Formula Price (FP)"
              stroke={COLORS[0]}
              fill={COLORS[0]}
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="realized"
              name="Farmer Realized"
              stroke={COLORS[3]}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ImportsTab() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 h-64">
        <h3 className="text-xs font-semibold text-slate-700 mb-1">
          Imports (mt): Baseline vs Scenario
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={importsFXData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="baselineImports"
              name="Baseline Imports"
              fill={COLORS[0]}
            />
            <Bar
              dataKey="scenarioImports"
              name="Scenario Imports"
              fill={COLORS[1]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 h-64">
        <h3 className="text-xs font-semibold text-slate-700 mb-1">
          FX Outflow (₹ crore): Baseline vs Scenario
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={importsFXData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="baselineFx"
              name="Baseline FX"
              stroke={COLORS[2]}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="scenarioFx"
              name="Scenario FX"
              stroke={COLORS[3]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FiscalTab() {
  return (
    <div className="h-72">
      <h3 className="text-xs font-semibold text-slate-700 mb-1">
        Fiscal Impact: Who Pays? (Share of total burden)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={fiscalImpactData}
          stackOffset="expand"
          margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="actor" stroke="#64748b" />
          <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="#64748b" />
          <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
          <Legend />
          {/* Represent baseline vs scenario as stacked bars per actor */}
          <Bar dataKey="baseline" name="Baseline" stackId="a" fill={COLORS[0]} />
          <Bar dataKey="scenario" name="Scenario" stackId="a" fill={COLORS[1]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Screen 3 – NMEO-OP Impact Dashboard */
function ScreenImpact() {
  const [stateFilter, setStateFilter] = useState("All-India");
  const [opyFilter, setOpyFilter] = useState("2022–23");
  const [neFilter, setNeFilter] = useState("All");

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      {/* Top filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-600 mb-1">
            NMEO-OP Impact Dashboard
          </span>
          <span className="text-slate-500">
            Track VP, FP, VGP & area expansion under different conditions
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex flex-wrap gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Geography
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-lg border-slate-200 text-xs"
            >
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Oil Palm Year (OPY)
            </label>
            <select
              value={opyFilter}
              onChange={(e) => setOpyFilter(e.target.value)}
              className="rounded-lg border-slate-200 text-xs"
            >
              <option>2021–22</option>
              <option>2022–23</option>
              <option>2023–24</option>
              <option>2024–25</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Region
            </label>
            <select
              value={neFilter}
              onChange={(e) => setNeFilter(e.target.value)}
              className="rounded-lg border-slate-200 text-xs"
            >
              <option>All</option>
              <option>Rest of India</option>
              <option>NE & A&N Islands</option>
            </select>
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel A */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-1">
            VP vs FP vs VGP over Time
          </h3>
          <p className="text-[11px] text-slate-500 mb-2">
            {stateFilter} · {opyFilter} · {neFilter}
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vpFpVgpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Area
                  dataKey="vp"
                  name="Viability Price (VP)"
                  type="monotone"
                  stroke={COLORS[2]}
                  fill={COLORS[2]}
                  fillOpacity={0.05}
                  strokeWidth={2}
                />
                <Area
                  dataKey="fp"
                  name="Formula Price (FP)"
                  type="monotone"
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.1}
                />
                <Bar
                  dataKey="vgp"
                  name="VGP (₹/tonne)"
                  fill={COLORS[1]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel B */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-1">
            Area under Oil Palm & Projected Production
          </h3>
          <p className="text-[11px] text-slate-500 mb-2">
            Based on NMEO-OP targets & yield assumptions
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={areaProductionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line
                  dataKey="area"
                  name="Area (million ha)"
                  type="monotone"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                />
                <Line
                  dataKey="production"
                  name="Production (million tonnes)"
                  type="monotone"
                  stroke={COLORS[1]}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Panel C */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 className="text-xs font-semibold text-slate-700 mb-1">
          Farmer Income Stability Indicator
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Volatility of realized price vs VP. Lower is better (more stable).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <StabilityCard
            label="Price Volatility Index"
            value="0.24"
            desc="Standard deviation of FP/VP gap over last 3 OPYs."
          />
          <StabilityCard
            label="Months below VP (last OPY)"
            value="3 / 12"
            desc="Months where market-linked FP fell below declared VP."
          />
          <StabilityCard
            label="Average VGP share"
            value="42%"
            desc="Share of farmer payout funded via GoI VGP support."
          />
        </div>
      </div>
    </div>
  );
}

function StabilityCard({ label, value, desc }) {
  return (
    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/40">
      <p className="text-[11px] font-semibold text-slate-600 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{desc}</p>
    </div>
  );
}

/* Screen 4 – Data & Model Diagnostics */
function ScreenDiagnostics() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">
          Data & Model Diagnostics
        </h2>
        <p className="text-xs text-slate-500">
          Inspect data coverage, revisions, and model performance before using outputs
          for policy decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Data quality */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-3">
            Time-series Quality (Completeness & Revisions)
          </h3>
          <div className="space-y-3">
            {diagnosticsDataQuality.map((row) => (
              <div key={row.series} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-700">{row.series}</span>
                  <span className="text-slate-500">
                    {row.completeness}% complete · {row.revisions} revisions
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${row.completeness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model performance */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-3">
            Model Performance (MAPE / RMSE)
          </h3>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosticsModelPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="model" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="mape" name="MAPE (%)" fill={COLORS[0]} />
                <Bar dataKey="rmse" name="RMSE" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500">
            Models with MAPE &lt; 10% and stable RMSE across time are considered robust for
            scenario analysis. Outliers may need retraining or data review.
          </p>
        </div>
      </div>

      {/* Downloads */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold text-slate-700">
          Download Cleaned Datasets & Model Outputs
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            Download CPO Prices (CSV)
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            Download Imports Dataset (CSV)
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            Download Scenario Outputs (CSV)
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:bg-slate-50">
            Download Model Metrics (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
