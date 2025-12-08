// components/charts/NMEOProgressChart.jsx
import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { nmeoOPDetailedData, stateWiseData } from "../../data/staticData";

export default function NMEOProgressChart({ selectedState, stateData }) {
  // Generate data for the chart based on selected state
  const generateChartData = () => {
    if (selectedState === "All-India") {
      // National progress data - Historical from 2015-2022
      return [
        { 
          year: "2015-16", 
          area: (() => {
            // Calculate total area for 2015-16 from state data
            let totalArea = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2015-16"]?.areaAchieved) {
                totalArea += state.productionData["2015-16"].areaAchieved;
              }
            });
            return totalArea / 100000; // Convert to lakh ha
          })(),
          production: (() => {
            // Calculate total production for 2015-16
            let totalCPO = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2015-16"]?.cpo) {
                totalCPO += state.productionData["2015-16"].cpo;
              }
            });
            return totalCPO / 100000; // Convert to lakh tonnes
          })()
        },
        { 
          year: "2016-17", 
          area: (() => {
            let totalArea = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2016-17"]?.areaAchieved) {
                totalArea += state.productionData["2016-17"].areaAchieved;
              }
            });
            return totalArea / 100000;
          })(),
          production: (() => {
            let totalCPO = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2016-17"]?.cpo) {
                totalCPO += state.productionData["2016-17"].cpo;
              }
            });
            return totalCPO / 100000;
          })()
        },
        { 
          year: "2017-18", 
          area: (() => {
            let totalArea = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2017-18"]?.areaAchieved) {
                totalArea += state.productionData["2017-18"].areaAchieved;
              }
            });
            return totalArea / 100000;
          })(),
          production: (() => {
            let totalCPO = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2017-18"]?.cpo) {
                totalCPO += state.productionData["2017-18"].cpo;
              }
            });
            return totalCPO / 100000;
          })()
        },
        { 
          year: "2018-19", 
          area: (() => {
            let totalArea = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2018-19"]?.areaAchieved) {
                totalArea += state.productionData["2018-19"].areaAchieved;
              }
            });
            return totalArea / 100000;
          })(),
          production: (() => {
            let totalCPO = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2018-19"]?.cpo) {
                totalCPO += state.productionData["2018-19"].cpo;
              }
            });
            return totalCPO / 100000;
          })()
        },
        { 
          year: "2019-20", 
          area: (() => {
            let totalArea = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2019-20"]?.areaAchieved) {
                totalArea += state.productionData["2019-20"].areaAchieved;
              }
            });
            return totalArea / 100000;
          })(),
          production: (() => {
            let totalCPO = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2019-20"]?.cpo) {
                totalCPO += state.productionData["2019-20"].cpo;
              }
            });
            return totalCPO / 100000;
          })()
        },
        { 
          year: "2020-21", 
          area: (() => {
            let totalArea = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2020-21"]?.areaAchieved) {
                totalArea += state.productionData["2020-21"].areaAchieved;
              }
            });
            return totalArea / 100000;
          })(),
          production: (() => {
            let totalCPO = 0;
            Object.values(stateWiseData).forEach(state => {
              if (state.productionData && state.productionData["2020-21"]?.cpo) {
                totalCPO += state.productionData["2020-21"].cpo;
              }
            });
            return totalCPO / 100000;
          })()
        },
        { 
          year: "2021-22", 
          area: nmeoOPDetailedData.nationalTargets.area.current, // 3.70 lakh ha
          production: nmeoOPDetailedData.nationalTargets.production.current, // 2.72 lakh tonnes
          targetArea: nmeoOPDetailedData.nationalTargets.area.target2025, // 10.00 lakh ha
          targetProduction: nmeoOPDetailedData.nationalTargets.production.target2025 // 11.20 lakh tonnes
        }
      ];
    } else {
      // State-specific data - Historical from 2015-2022
      const stateTargets = nmeoOPDetailedData.stateExpansionTargets[selectedState];
      if (!stateTargets || !stateData?.productionData) return [];
      
      // Get production data for the state
      const productionData = stateData.productionData;
      
      return [
        { 
          year: "2015-16", 
          area: productionData["2015-16"]?.areaAchieved ? productionData["2015-16"].areaAchieved / 100000 : 0, // Convert to lakh ha
          production: productionData["2015-16"]?.cpo ? productionData["2015-16"].cpo / 100000 : 0, // Convert to lakh tonnes
          targetArea: productionData["2015-16"]?.areaTarget ? productionData["2015-16"].areaTarget / 100000 : 0
        },
        { 
          year: "2016-17", 
          area: productionData["2016-17"]?.areaAchieved ? productionData["2016-17"].areaAchieved / 100000 : 0,
          production: productionData["2016-17"]?.cpo ? productionData["2016-17"].cpo / 100000 : 0,
          targetArea: productionData["2016-17"]?.areaTarget ? productionData["2016-17"].areaTarget / 100000 : 0
        },
        { 
          year: "2017-18", 
          area: productionData["2017-18"]?.areaAchieved ? productionData["2017-18"].areaAchieved / 100000 : 0,
          production: productionData["2017-18"]?.cpo ? productionData["2017-18"].cpo / 100000 : 0,
          targetArea: productionData["2017-18"]?.areaTarget ? productionData["2017-18"].areaTarget / 100000 : 0
        },
        { 
          year: "2018-19", 
          area: productionData["2018-19"]?.areaAchieved ? productionData["2018-19"].areaAchieved / 100000 : 0,
          production: productionData["2018-19"]?.cpo ? productionData["2018-19"].cpo / 100000 : 0,
          targetArea: productionData["2018-19"]?.areaTarget ? productionData["2018-19"].areaTarget / 100000 : 0
        },
        { 
          year: "2019-20", 
          area: productionData["2019-20"]?.areaAchieved ? productionData["2019-20"].areaAchieved / 100000 : 0,
          production: productionData["2019-20"]?.cpo ? productionData["2019-20"].cpo / 100000 : 0,
          targetArea: productionData["2019-20"]?.areaTarget ? productionData["2019-20"].areaTarget / 100000 : 0
        },
        { 
          year: "2020-21", 
          area: productionData["2020-21"]?.areaAchieved ? productionData["2020-21"].areaAchieved / 100000 : 0,
          production: productionData["2020-21"]?.cpo ? productionData["2020-21"].cpo / 100000 : 0,
          targetArea: productionData["2020-21"]?.areaTarget ? productionData["2020-21"].areaTarget / 100000 : 0
        },
        { 
          year: "2021-22", 
          area: stateData.areaCovered / 100000, // Current area in lakh ha
          production: productionData["2020-21"]?.cpo ? productionData["2020-21"].cpo / 100000 : 0, // Latest available
          targetArea: stateTargets["2021-22"] ? stateTargets["2021-22"] / 100000 : 0 // NMEO-OP target
        }
      ];
    }
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      {/* Combined Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="#3b82f6"
              fontSize={12}
              label={{ 
                value: 'Area (lakh ha)', 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12 
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#10b981"
              fontSize={12}
              label={{ 
                value: 'Production (lakh tonnes)', 
                angle: 90, 
                position: 'insideRight',
                fontSize: 12 
              }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'area') return [`${value.toFixed(2)} lakh ha`, 'Area Under Oil Palm'];
                if (name === 'production') return [`${value.toFixed(2)} lakh tonnes`, 'CPO Production'];
                if (name === 'targetArea') return [`${value.toFixed(2)} lakh ha`, 'Annual Target'];
                if (name === 'targetProduction') return [`${value.toFixed(2)} lakh tonnes`, '2025 Target'];
                return value;
              }}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="area" 
              name="Area Under Cultivation" 
              stroke="#f5b836" 
              fill="#f5b836" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="production" 
              name="CPO Production" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
            {selectedState === "All-India" && (
              <>
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="targetArea" 
                  name="2025 Area Target" 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="targetProduction" 
                  name="2025 Production Target" 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-blue-700">Area Expansion Progress</span>
            <span className="font-bold">
              {selectedState === "All-India" 
                ? `${nmeoOPDetailedData.nationalTargets.area.current.toFixed(2)} / 10.00 lakh ha`
                : `${(stateData?.areaCovered / 100000).toFixed(2)} / ${(stateData?.potentialArea / 100000).toFixed(2)} lakh ha`
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${selectedState === "All-India" 
                  ? nmeoOPDetailedData.nationalTargets.area.progressPercentage 
                  : stateData?.coveragePercentage || 0}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 text-right">
            {selectedState === "All-India" 
              ? `${nmeoOPDetailedData.nationalTargets.area.progressPercentage.toFixed(1)}% of 2025 target`
              : `${stateData?.coveragePercentage?.toFixed(1) || 0}% of potential area`
            }
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-green-700">Production Growth</span>
            <span className="font-bold">
              {selectedState === "All-India" 
                ? `${nmeoOPDetailedData.nationalTargets.production.current.toFixed(2)} / 11.20 lakh tonnes`
                : (() => {
                    // Get latest production data for state
                    if (stateData?.productionData) {
                      const years = Object.keys(stateData.productionData).sort().reverse();
                      for (const year of years) {
                        if (stateData.productionData[year]?.cpo) {
                          return `${(stateData.productionData[year].cpo / 100000).toFixed(2)} lakh tonnes`;
                        }
                      }
                    }
                    return "Data being compiled";
                  })()
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${selectedState === "All-India" 
                  ? nmeoOPDetailedData.nationalTargets.production.progressPercentage 
                  : (() => {
                      // Calculate production progress for state if data exists
                      if (stateData?.productionData) {
                        const years = Object.keys(stateData.productionData).sort().reverse();
                        for (const year of years) {
                          const cpo = stateData.productionData[year]?.cpo;
                          if (cpo) {
                            // Estimate target production based on potential area
                            const avgYield = stateData.OER ? stateData.OER / 100 : 0.165;
                            const targetCPO = (stateData.potentialArea * 3.5 * avgYield) / 100000;
                            return Math.min((cpo / 100000) / targetCPO * 100, 100);
                          }
                        }
                      }
                      return 0;
                    })()}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 text-right">
            {selectedState === "All-India" 
              ? `${nmeoOPDetailedData.nationalTargets.production.progressPercentage.toFixed(1)}% of 2025 target`
              : (stateData?.productionData ? "Using Latest Available Data 2020-21" : "Production data being compiled")
            }
          </div>
        </div>
      </div>

      {/* NMEO-OP Financial Summary */}
      {selectedState !== "All-India" && nmeoOPDetailedData.financialAllocations[selectedState] && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm font-medium text-amber-800 mb-2">NMEO-OP Financial Allocation (2021-22)</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-amber-700">₹ {nmeoOPDetailedData.financialAllocations[selectedState]["2021-22"].central.toLocaleString()} lakh</div>
              <div className="text-amber-600">Central Share</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-700">₹ {nmeoOPDetailedData.financialAllocations[selectedState]["2021-22"].state.toLocaleString()} lakh</div>
              <div className="text-amber-600">State Share</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-700">{nmeoOPDetailedData.financialAllocations[selectedState]["2021-22"].areaTarget.toLocaleString()} ha</div>
              <div className="text-amber-600">Area Target</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}