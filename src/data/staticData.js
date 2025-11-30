export const GOV_COLORS = {
  amber: "#DA8A00",
  green: "#2F7F3E",
  grey: "#64748b",
  dark: "#1e293b",
};

// ===============================
// Static Data for Demo Simulation
// ===============================

// Dropdown Lists
export const STATES = [
  "All-India",
  "Andhra Pradesh",
  "Telangana",
  "Tamil Nadu",
  "Odisha",
];

export const YEARS = ["2010–2015", "2016–2020", "2021–2025", "2026–2030"];

export const SCENARIOS = ["Baseline", "Scenario A", "Scenario B"];

// -------------------------------
// Overview Page - Charts
// -------------------------------
export const importsProdConsData = [
  { year: 2015, imports: 8.3, production: 6.5, consumption: 14.0 },
  { year: 2016, imports: 8.7, production: 6.8, consumption: 14.7 },
  { year: 2017, imports: 9.1, production: 7.2, consumption: 15.4 },
  { year: 2018, imports: 8.8, production: 7.5, consumption: 15.6 },
  { year: 2019, imports: 9.3, production: 7.7, consumption: 16.2 },
  { year: 2020, imports: 8.9, production: 8.0, consumption: 16.4 },
];

export const importShareByCountry = [
  { name: "Indonesia", value: 55 },
  { name: "Malaysia", value: 35 },
  { name: "Thailand", value: 5 },
  { name: "Others", value: 5 },
];

export const scenarioComparisonRows = [
  {
    metric: "Import Dependency (%)",
    baseline: "58%",
    scenarioA: "52%",
    scenarioB: "47%",
  },
  {
    metric: "Avg Farmer Price vs VP (₹/tonne)",
    baseline: "VP – 200",
    scenarioA: "VP – 80",
    scenarioB: "VP – 30",
  },
  {
    metric: "GoI VGP Outlay (₹ crore)",
    baseline: "₹ 6200 Cr",
    scenarioA: "₹ 5400 Cr",
    scenarioB: "₹ 5100 Cr",
  },
  {
    metric: "Average Landed CPO (₹/kg)",
    baseline: "₹ 130",
    scenarioA: "₹ 136",
    scenarioB: "₹ 141",
  },
];

// -------------------------------
// Scenario Builder Page - Charts
// -------------------------------
export const priceChartData = [
  { month: "Jan", intl: 100, landed: 130, fp: 18.0, vp: 20.0, realized: 19.0 },
  { month: "Feb", intl: 105, landed: 135, fp: 19.0, vp: 20.0, realized: 19.5 },
  { month: "Mar", intl: 98, landed: 128, fp: 18.2, vp: 20.0, realized: 19.2 },
  { month: "Apr", intl: 110, landed: 140, fp: 20.0, vp: 20.0, realized: 20.0 },
];

export const importsFXData = [
  {
    year: "2022",
    baselineImports: 9.0,
    scenarioImports: 8.3,
    baselineFx: 6500,
    scenarioFx: 6100,
  },
  {
    year: "2023",
    baselineImports: 9.4,
    scenarioImports: 8.5,
    baselineFx: 6800,
    scenarioFx: 6300,
  },
];

export const fiscalImpactData = [
  { actor: "Industry", baseline: 0.40, scenario: 0.44 },
  { actor: "GoI (VGP)", baseline: 0.45, scenario: 0.38 },
  { actor: "Consumers", baseline: 0.15, scenario: 0.18 },
];

// -------------------------------
// Impact Dashboard Page - Charts
// -------------------------------
export const vpFpVgpData = [
  { year: "2022", vp: 20, fp: 18.3, vgp: 1.7 },
  { year: "2023", vp: 21, fp: 19.2, vgp: 1.8 },
  { year: "2024", vp: 22, fp: 20.5, vgp: 1.5 },
];

export const areaProductionData = [
  { year: "2022", area: 0.7, production: 0.27 },
  { year: "2023", area: 0.8, production: 0.35 },
  { year: "2024", area: 0.9, production: 0.45 },
  { year: "2025", area: 1.0, production: 0.55 },
];

// -------------------------------
// Diagnostics Page - Indicators
// -------------------------------
export const diagnosticsDataQuality = [
  { series: "CPO Prices", completeness: 98, revisions: 3 },
  { series: "Import Volumes", completeness: 96, revisions: 5 },
  { series: "Retail Prices", completeness: 89, revisions: 8 },
];

export const diagnosticsModelPerf = [
  { model: "CPO Price Forecast", mape: 6.2, rmse: 12.4 },
  { model: "Import Demand", mape: 8.5, rmse: 0.23 },
  { model: "Retail Pass-through", mape: 7.1, rmse: 1.8 },
];
