// ===============================
// Static Data with Complete FFB & CPO Data
// ===============================

// Dropdown Lists
export const STATES = [
  "All-India",
  "Andhra Pradesh", 
  "Telangana",
  "Tamil Nadu",
  "Odisha",
  "Karnataka",
  "Kerala",
  "Gujarat",
  "Chhattisgarh",
  "Goa"
];

export const YEARS = ["2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const OIL_YEARS = ["Nov-Oct 2019-20", "Nov-Oct 2020-21", "Nov-Oct 2021-22", "Nov-Oct 2022-23", "Nov-Oct 2023-24", "Nov-Oct 2024-25"];

export const SCENARIOS = ["Baseline", "Scenario A", "Scenario B", "Optimal Duty"];

// -------------------------------
// Complete FFB & CPO Price Data from Telangana (Financial Years)
// -------------------------------
export const telanganaPriceData = {
  financialYear: [
    {
      year: "2020-21",
      data: [
        { month: "Apr", ffb: 10032, cpo: 67878 },
        { month: "May", ffb: 10339, cpo: 60735 },
        { month: "Jun", ffb: 9348, cpo: 67605 },
        { month: "Jul", ffb: 10306, cpo: 67229 },
        { month: "Aug", ffb: 10242, cpo: 71455 },
        { month: "Sep", ffb: 10903, cpo: 75760 },
        { month: "Oct", ffb: 11565, cpo: 76811 },
        { month: "Nov", ffb: 11868, cpo: 80930 },
        { month: "Dec", ffb: 12800, cpo: 92267 },
        { month: "Jan", ffb: 14416, cpo: 97044 },
        { month: "Feb", ffb: 15147, cpo: 101708 },
        { month: "Mar", ffb: 15923, cpo: 110414 }
      ]
    },
    {
      year: "2021-22",
      data: [
        { month: "Apr", ffb: 17364, cpo: 117374 },
        { month: "May", ffb: 18384, cpo: 123079 },
        { month: "Jun", ffb: 19114, cpo: 105475 },
        { month: "Jul", ffb: 16415, cpo: 107726 },
        { month: "Aug", ffb: 16717, cpo: 116482 },
        { month: "Sep", ffb: 18001, cpo: 111480 },
        { month: "Oct", ffb: 17293, cpo: 109632 },
        { month: "Nov", ffb: 17493, cpo: 109540 },
        { month: "Dec", ffb: 17687, cpo: 108410 },
        { month: "Jan", ffb: 17516, cpo: 107252 },
        { month: "Feb", ffb: 17476, cpo: 120614 },
        { month: "Mar", ffb: 19499, cpo: 142230 }
      ]
    },
    {
      year: "2022-23",
      data: [
        { month: "Apr", ffb: 22842, cpo: 141594 },
        { month: "May", ffb: 22765, cpo: 146715 },
        { month: "Jun", ffb: 23467, cpo: 128311 },
        { month: "Jul", ffb: 20267, cpo: 106147 },
        { month: "Aug", ffb: 16814, cpo: 102902 },
        { month: "Sep", ffb: 16295, cpo: 80940 },
        { month: "Oct", ffb: 12996, cpo: 82271 },
        { month: "Nov", ffb: 13741, cpo: 87025 },
        { month: "Dec", ffb: 13881, cpo: 86930 },
        { month: "Jan", ffb: 13781, cpo: 86292 },
        { month: "Feb", ffb: 13961, cpo: 87582 },
        { month: "Mar", ffb: 13943, cpo: 87668 }
      ]
    },
    {
      year: "2023-24",
      data: [
        { month: "Apr", ffb: 14205, cpo: 89474 },
        { month: "May", ffb: 13346, cpo: 83830 },
        { month: "Jun", ffb: 12623, cpo: 78858 },
        { month: "Jul", ffb: 13091, cpo: 81120 },
        { month: "Aug", ffb: 13026, cpo: 79108 },
        { month: "Sep", ffb: 12231, cpo: 75102 },
        { month: "Oct", ffb: 12196, cpo: 75393 },
        { month: "Nov", ffb: 12525, cpo: 77768 },
        { month: "Dec", ffb: 12534, cpo: 77720 },
        { month: "Jan", ffb: 12681, cpo: 78636 },
        { month: "Feb", ffb: 13135, cpo: 81650 },
        { month: "Mar", ffb: 14174, cpo: 88452 }
      ]
    },
    {
      year: "2024-25",
      data: [
        { month: "Apr", ffb: 14229, cpo: 88164 },
        { month: "May", ffb: 13438, cpo: 82948 },
        { month: "Jun", ffb: 13705, cpo: 85038 },
        { month: "Jul", ffb: 13822, cpo: 85342 },
        { month: "Aug", ffb: 14392, cpo: 87504 },
        { month: "Sep", ffb: 17043, cpo: 104951 },
        { month: "Oct", ffb: 19144, cpo: 119122 },
        { month: "Nov", ffb: 20413, cpo: 125081 },
        { month: "Dec", ffb: 20506, cpo: 125192 },
        { month: "Jan", ffb: 20487, cpo: 124595 },
        { month: "Feb", ffb: 20871, cpo: 127693 },
        { month: "Mar", ffb: 21000, cpo: 128157 }
      ]
    },
    {
      year: "2025-26",
      data: [
        { month: "Apr", ffb: 20058, cpo: 121529 },
        { month: "May", ffb: 18748, cpo: 112641 },
        { month: "Jun", ffb: 17463, cpo: 103738 },
        { month: "Jul", ffb: 18052, cpo: 106868 },
        { month: "Aug", ffb: 19107, cpo: 113502 },
        { month: "Sep", ffb: 19400, cpo: 114419 },
        { month: "Oct", ffb: 19681, cpo: 115715 }
      ]
    }
  ],
  oilYear: [
    {
      year: "2019-20",
      data: [
        { month: "Nov", ffb: 8073, cpo: 61177 },
        { month: "Dec", ffb: 9386, cpo: 69994 },
        { month: "Jan", ffb: 10809, cpo: 77979 },
        { month: "Feb", ffb: 12032, cpo: 68523 },
        { month: "Mar", ffb: 10769, cpo: 64418 },
        { month: "Apr", ffb: 10032, cpo: 67878 },
        { month: "May", ffb: 10339, cpo: 60735 },
        { month: "Jun", ffb: 9348, cpo: 67605 },
        { month: "Jul", ffb: 10306, cpo: 67229 },
        { month: "Aug", ffb: 10242, cpo: 71455 },
        { month: "Sep", ffb: 10903, cpo: 75760 },
        { month: "Oct", ffb: 11565, cpo: 76811 }
      ]
    },
    {
      year: "2020-21",
      data: [
        { month: "Nov", ffb: 11868, cpo: 80930 },
        { month: "Dec", ffb: 12800, cpo: 92267 },
        { month: "Jan", ffb: 14416, cpo: 97044 },
        { month: "Feb", ffb: 15147, cpo: 101708 },
        { month: "Mar", ffb: 15923, cpo: 110414 },
        { month: "Apr", ffb: 17364, cpo: 117374 },
        { month: "May", ffb: 18384, cpo: 123079 },
        { month: "Jun", ffb: 19114, cpo: 105475 },
        { month: "Jul", ffb: 16415, cpo: 107726 },
        { month: "Aug", ffb: 16717, cpo: 116482 },
        { month: "Sep", ffb: 18001, cpo: 111480 },
        { month: "Oct", ffb: 17293, cpo: 109632 }
      ]
    },
    {
      year: "2021-22",
      data: [
        { month: "Nov", ffb: 17493, cpo: 109540 },
        { month: "Dec", ffb: 17687, cpo: 108410 },
        { month: "Jan", ffb: 17516, cpo: 107252 },
        { month: "Feb", ffb: 17476, cpo: 120614 },
        { month: "Mar", ffb: 19499, cpo: 142230 },
        { month: "Apr", ffb: 22842, cpo: 141594 },
        { month: "May", ffb: 22765, cpo: 146715 },
        { month: "Jun", ffb: 23467, cpo: 128311 },
        { month: "Jul", ffb: 20267, cpo: 106147 },
        { month: "Aug", ffb: 16814, cpo: 102902 },
        { month: "Sep", ffb: 16295, cpo: 80940 },
        { month: "Oct", ffb: 12996, cpo: 82271 }
      ]
    },
    {
      year: "2022-23",
      data: [
        { month: "Nov", ffb: 13741, cpo: 87025 },
        { month: "Dec", ffb: 13881, cpo: 86930 },
        { month: "Jan", ffb: 13781, cpo: 86292 },
        { month: "Feb", ffb: 13961, cpo: 87582 },
        { month: "Mar", ffb: 13943, cpo: 87668 },
        { month: "Apr", ffb: 14205, cpo: 89474 },
        { month: "May", ffb: 13346, cpo: 83830 },
        { month: "Jun", ffb: 12623, cpo: 78858 },
        { month: "Jul", ffb: 13091, cpo: 81120 },
        { month: "Aug", ffb: 13026, cpo: 79108 },
        { month: "Sep", ffb: 12231, cpo: 75102 },
        { month: "Oct", ffb: 12196, cpo: 75393 }
      ]
    },
    {
      year: "2023-24",
      data: [
        { month: "Nov", ffb: 12525, cpo: 77768 },
        { month: "Dec", ffb: 12534, cpo: 77720 },
        { month: "Jan", ffb: 12681, cpo: 78636 },
        { month: "Feb", ffb: 13135, cpo: 81650 },
        { month: "Mar", ffb: 14174, cpo: 88452 },
        { month: "Apr", ffb: 14229, cpo: 88164 },
        { month: "May", ffb: 13438, cpo: 82948 },
        { month: "Jun", ffb: 13705, cpo: 85038 },
        { month: "Jul", ffb: 13822, cpo: 85342 },
        { month: "Aug", ffb: 14392, cpo: 87504 },
        { month: "Sep", ffb: 17043, cpo: 104951 },
        { month: "Oct", ffb: 19144, cpo: 119122 }
      ]
    },
    {
      year: "2024-25",
      data: [
        { month: "Nov", ffb: 20413, cpo: 125081 },
        { month: "Dec", ffb: 20506, cpo: 125192 },
        { month: "Jan", ffb: 20487, cpo: 124595 },
        { month: "Feb", ffb: 20871, cpo: 127693 },
        { month: "Mar", ffb: 21000, cpo: 128157 },
        { month: "Apr", ffb: 20058, cpo: 121529 },
        { month: "May", ffb: 18748, cpo: 112641 },
        { month: "Jun", ffb: 17463, cpo: 103738 },
        { month: "Jul", ffb: 18052, cpo: 106868 },
        { month: "Aug", ffb: 19107, cpo: 113502 },
        { month: "Sep", ffb: 19400, cpo: 114419 },
        { month: "Oct", ffb: 19681, cpo: 115715 }
      ]
    }
  ]
};

// -------------------------------
// State-wise Real Data from PDF
// -------------------------------
export const stateWiseData = {
  "Andhra Pradesh": {
    potentialArea: 531379,
    areaCovered: 185000,
    coveragePercentage: 35,
    areaExpansionTargets: [15000, 20000, 24000, 25000, 28000],
    totalExpansionTarget: 112000,
    currentFFBPrice: 17951,
    currentCPOPrice: 116159,
    OER: 16.26,
    processingMills: 19,
    crushingCapacity: 240,
    productionData: {
      "2014-15": { ffb: 1007553, cpo: 170478 },
      "2015-16": { ffb: 1147780, cpo: 193562 },
      "2016-17": { ffb: 1137398, cpo: 190999 },
      "2017-18": { ffb: 1427828, cpo: 234696 },
      "2018-19": { ffb: 1379215, cpo: 232938 },
      "2019-20": { ffb: 1277760, cpo: 208359 },
      "2020-21": { ffb: 1471521, cpo: 237900 }
    }
  },
  "Telangana": {
    potentialArea: 436325,
    areaCovered: 21382,
    coveragePercentage: 4.90,
    areaExpansionTargets: [19000, 22000, 25000, 29300, 30000],
    totalExpansionTarget: 125300,
    currentFFBPrice: 19681,
    currentCPOPrice: 115715,
    OER: 18.04,
    processingMills: 2,
    crushingCapacity: 60,
    productionData: {
      "2014-15": { ffb: 57873, cpo: 10012 },
      "2015-16": { ffb: 75447, cpo: 12499 },
      "2016-17": { ffb: 88119, cpo: 8947 },
      "2017-18": { ffb: 147516, cpo: 27275 },
      "2018-19": { ffb: 197632, cpo: 37205 },
      "2019-20": { ffb: 208826, cpo: 38050 },
      "2020-21": { ffb: 149488, cpo: 26690 }
    }
  },
  "Tamil Nadu": {
    potentialArea: 95719,
    areaCovered: 32982,
    coveragePercentage: 34.46,
    areaExpansionTargets: [1500, 2000, 5000, 5000, 5000],
    totalExpansionTarget: 18500,
    currentFFBPrice: 8126,
    OER: 14.29,
    processingMills: 1,
    crushingCapacity: 2.5,
    productionData: {
      "2014-15": { ffb: 6568, cpo: 1019 },
      "2015-16": { ffb: 7810, cpo: 1222 },
      "2016-17": { ffb: 7422, cpo: 1115 },
      "2017-18": { ffb: 6995, cpo: 938 },
      "2018-19": { ffb: 7014, cpo: 1017 },
      "2019-20": { ffb: 3798, cpo: 553 },
      "2020-21": { ffb: 3038, cpo: 429 }
    }
  },
  "Odisha": {
    potentialArea: 34291,
    areaCovered: 23130,
    coveragePercentage: 67,
    areaExpansionTargets: [1500, 2000, 2000, 2500, 2500],
    totalExpansionTarget: 10500,
    currentFFBPrice: 17636,
    processingMills: 1,
    productionData: {
      "2014-15": { ffb: 3769, cpo: 557 },
      "2015-16": { ffb: 4569, cpo: 618 },
      "2016-17": { ffb: 4965, cpo: null },
      "2017-18": { ffb: 6702, cpo: null },
      "2018-19": { ffb: 6899, cpo: null },
      "2019-20": { ffb: 7106, cpo: null },
      "2020-21": { ffb: null, cpo: null }
    }
  },
  "Karnataka": {
    potentialArea: 72642,
    areaCovered: 46954,
    coveragePercentage: 65,
    areaExpansionTargets: [2000, 3300, 4000, 5000, 5000],
    totalExpansionTarget: 19300,
    currentFFBPrice: 15306,
    currentCPOPrice: 110191,
    OER: 17,
    processingMills: 4,
    crushingCapacity: 21,
    productionData: {
      "2014-15": { ffb: 12638, cpo: 2176 },
      "2015-16": { ffb: 14740, cpo: 2538 },
      "2016-17": { ffb: 11912, cpo: 2051 },
      "2017-18": { ffb: 12917, cpo: 2224 },
      "2018-19": { ffb: 13238, cpo: 2280 },
      "2019-20": { ffb: 12685, cpo: 2184 },
      "2020-21": { ffb: 15877, cpo: 2734 }
    }
  }
};

// Calculate All-India totals
const allIndiaPotential = Object.values(stateWiseData).reduce((sum, state) => sum + state.potentialArea, 0);
const allIndiaCovered = Object.values(stateWiseData).reduce((sum, state) => sum + state.areaCovered, 0);
const allIndiaExpansionTarget = Object.values(stateWiseData).reduce((sum, state) => sum + state.totalExpansionTarget, 0);

stateWiseData["All-India"] = {
  potentialArea: allIndiaPotential,
  areaCovered: allIndiaCovered,
  coveragePercentage: (allIndiaCovered / allIndiaPotential * 100).toFixed(1),
  areaExpansionTargets: [38320, 31980, 43200, 52000, 53000],
  totalExpansionTarget: allIndiaExpansionTarget
};

// -------------------------------
// Live Market + NMEO-OP Snapshot
// -------------------------------
export const liveMarket = {
  oilYear: "2024-25",
  globalChangePct: 8.5,
  status: "Stable",
  description: "Current FFB price in Telangana: ₹19,681/MT (Oct 2025)",
  currentFFBPrice: 19681,
  currentCPOPrice: 115715,
};

// -------------------------------
// Oil Palm Bearing Potential by Age
// -------------------------------
export const bearingPotential = [
  { age: 4, yield: 5.0, description: "Initial bearing stage" },
  { age: 5, yield: 8.0, description: "Early production phase" },
  { age: 6, yield: 11.0, description: "Rapid yield increase" },
  { age: 7, yield: 15.0, description: "Near maturity" },
  { age: 8, yield: 18.0, description: "Full maturity reached" },
  { age: 9, yield: 18.0, description: "Peak production" },
  { age: 10, yield: 18.0, description: "Sustained peak yield" }
];

export const farmerRisk = {
  riskLevel: "Green",
  fpBelowVpMonths: 0,
  comment: "FFB prices showing positive trend in Telangana",
};

export const supplyGapSummary = {
  domesticShare: 15,
  importShare: 85,
  note: "Domestic oil palm production growing steadily under NMEO-OP",
};

// NMEO-OP Progress
export const nmeoOpProgress = {
  areaTarget2030: 1.2,
  areaCurrent: 0.37,
  productionTarget2030: 4.0,
  productionCurrent: 1.47,
  farmerRetentionScore: 0.85,
};

export const clusterStatus = {
  millsNearby: 75,
  avgDistanceKm: 18,
  note: "Processing capacity expanding across states",
};

// -------------------------------
// Charts Data with Filtering Capability
// -------------------------------
export const getPriceData = (state, yearType, years, months) => {
  if (state === "Telangana") {
    const data = telanganaPriceData[yearType];
    return data.filter(item => years.includes(item.year))
               .map(yearData => ({
                 year: yearData.year,
                 data: yearData.data.filter(monthData => months.includes(monthData.month))
               }));
  }
  return [];
};

export const getProductionData = (state, years) => {
  if (stateWiseData[state] && stateWiseData[state].productionData) {
    const productionData = stateWiseData[state].productionData;
    return Object.entries(productionData)
      .filter(([year]) => years.includes(year))
      .map(([year, data]) => ({
        year,
        ffb: data.ffb,
        cpo: data.cpo
      }));
  }
  return [];
};

// -------------------------------
// Mission Alignment Data
// -------------------------------
export const missionAlignmentData = {
  areaExpansion: {
    target2030: 1.2,
    current: 0.37,
    status: "on-track",
    description: "Area expansion progressing with 3.70 lakh ha achieved"
  },
  farmerViability: {
    score: 85,
    trend: "improving",
    risk: "low",
    description: "FFB prices showing positive trend"
  },
  clusterHealth: {
    millsUtilization: 68,
    avgDistance: 18,
    status: "improving",
    description: "Processing capacity expanding"
  }
};

// -------------------------------
// Price Trend for Charts (Latest 27 months from Telangana)
// -------------------------------
export const ffbPriceTrend = [
  { period: "Aug 2023", price: 13026 },
  { period: "Sep 2023", price: 12231 },
  { period: "Oct 2023", price: 12196 },
  { period: "Nov 2023", price: 12525 },
  { period: "Dec 2023", price: 12534 },
  { period: "Jan 2024", price: 12681 },
  { period: "Feb 2024", price: 13135 },
  { period: "Mar 2024", price: 14174 },
  { period: "Apr 2024", price: 14229 },
  { period: "May 2024", price: 13438 },
  { period: "Jun 2024", price: 13705 },
  { period: "Jul 2024", price: 13822 },
  { period: "Aug 2024", price: 14392 },
  { period: "Sep 2024", price: 17043 },
  { period: "Oct 2024", price: 19144 },
  { period: "Nov 2024", price: 20413 },
  { period: "Dec 2024", price: 20506 },
  { period: "Jan 2025", price: 20487 },
  { period: "Feb 2025", price: 20871 },
  { period: "Mar 2025", price: 21000 },
  { period: "Apr 2025", price: 20058 },
  { period: "May 2025", price: 18748 },
  { period: "Jun 2025", price: 17463 },
  { period: "Jul 2025", price: 18052 },
  { period: "Aug 2025", price: 19107 },
  { period: "Sep 2025", price: 19400 },
  { period: "Oct 2025", price: 19681 }
];

export const cpoPriceTrend = [
  { period: "Aug 2023", price: 79108 },
  { period: "Sep 2023", price: 75102 },
  { period: "Oct 2023", price: 75393 },
  { period: "Nov 2023", price: 77768 },
  { period: "Dec 2023", price: 77720 },
  { period: "Jan 2024", price: 78636 },
  { period: "Feb 2024", price: 81650 },
  { period: "Mar 2024", price: 88452 },
  { period: "Apr 2024", price: 88164 },
  { period: "May 2024", price: 82948 },
  { period: "Jun 2024", price: 85038 },
  { period: "Jul 2024", price: 85342 },
  { period: "Aug 2024", price: 87504 },
  { period: "Sep 2024", price: 104951 },
  { period: "Oct 2024", price: 119122 },
  { period: "Nov 2024", price: 125081 },
  { period: "Dec 2024", price: 125192 },
  { period: "Jan 2025", price: 124595 },
  { period: "Feb 2025", price: 127693 },
  { period: "Mar 2025", price: 128157 },
  { period: "Apr 2025", price: 121529 },
  { period: "May 2025", price: 112641 },
  { period: "Jun 2025", price: 103738 },
  { period: "Jul 2025", price: 106868 },
  { period: "Aug 2025", price: 113502 },
  { period: "Sep 2025", price: 114419 },
  { period: "Oct 2025", price: 115715 }
];

// -------------------------------
// Area and Production Growth
// -------------------------------
export const areaProductionData = [
  { year: "2022", area: 0.25, production: 0.45 },
  { year: "2023", area: 0.28, production: 0.58 },
  { year: "2024", area: 0.32, production: 0.72 },
  { year: "2025", area: 0.37, production: 1.47 }
];

export const vpFpVgpData = [
  { year: "2022", vp: 15000, fp: 14500, vgp: 500 },
  { year: "2023", vp: 16000, fp: 15500, vgp: 500 },
  { year: "2024", vp: 17000, fp: 16200, vgp: 800 },
  { year: "2025", vp: 18000, fp: 17951, vgp: 49 }
];

// -------------------------------
// Diagnostics Data
// -------------------------------
export const diagnosticsDataQuality = [
  { series: "CPO Prices (Global)", completeness: 98, revisions: 2 },
  { series: "FFB Prices (State)", completeness: 95, revisions: 1 },
  { series: "Import Volumes (DGFT)", completeness: 96, revisions: 3 },
  { series: "Weather Data (IMD)", completeness: 92, revisions: 4 },
];

export const importsProdConsData = [
  { year: 2015, imports: 8.3, production: 6.5, consumption: 14.0 },
  { year: 2016, imports: 8.7, production: 6.8, consumption: 14.7 },
  { year: 2017, imports: 9.1, production: 7.2, consumption: 15.4 },
  { year: 2018, imports: 8.8, production: 7.5, consumption: 15.6 },
  { year: 2019, imports: 9.3, production: 7.7, consumption: 16.2 },
  { year: 2020, imports: 8.9, production: 8.0, consumption: 16.4 },
];

export const diagnosticsModelPerf = [
  { model: "CPO Price Forecast", mape: 5.8, rmse: 8.4 },
  { model: "FFB Yield Prediction", mape: 7.2, rmse: 0.18 },
  { model: "Import Demand", mape: 6.5, rmse: 0.21 },
];


export const policyActions = [
  {
    category: "Farmers",
    indicator: "Current FFB Price: ₹19,681/MT",
    risk: "🟢 Safe",
    action: "Monitor price trends",
    priority: "low"
  },
  {
    category: "Production",
    indicator: "Yield potential increasing",
    risk: "🟢 Safe", 
    action: "Continue expansion",
    priority: "medium"
  },
  {
    category: "Imports",
    indicator: "Global prices +12.3%",
    risk: "⚠️ Amber",
    action: "Review duty structure",
    priority: "high"
  },
  {
    category: "Weather",
    indicator: "Monitor rainfall patterns",
    risk: "🟢 Safe",
    action: "Normal monsoon expected",
    priority: "medium"
  }
];

export const priceChartData = [
  { month: "Jan", intl: 100, landed: 130, fp: 18.0, vp: 20.0, realized: 19.0 },
  { month: "Feb", intl: 105, landed: 135, fp: 19.0, vp: 20.0, realized: 19.5 },
  { month: "Mar", intl: 98, landed: 128, fp: 18.2, vp: 20.0, realized: 19.2 },
  { month: "Apr", intl: 110, landed: 140, fp: 20.0, vp: 20.0, realized: 20.0 },
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
    baseline: "₹ 6,200 Cr",
    scenarioA: "₹ 5,400 Cr",
    scenarioB: "₹ 5,100 Cr",
  },
  {
    metric: "Average Landed CPO (₹/kg)",
    baseline: "₹ 130",
    scenarioA: "₹ 136",
    scenarioB: "₹ 141",
  },
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

export const importShareByCountry = [
  { name: "Indonesia", value: 55 },
  { name: "Malaysia", value: 35 },
  { name: "Thailand", value: 5 },
  { name: "Others", value: 5 },
];