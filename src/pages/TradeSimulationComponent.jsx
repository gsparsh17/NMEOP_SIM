import React, { useState, useEffect } from 'react';

const TradeSimulationComponent = ({ onSimulationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [briefMode, setBriefMode] = useState(true);
  const [scenarioConfig, setScenarioConfig] = useState({
    rounds: 1,
    tariff_event: {
      imposer: "India",
      crude_delta_percent: 0,
      refined_delta_percent: 0,
      target: "Indonesia"
    },
    forex_shock: {
      pair: "INR_USD",
      percent_change: 0
    },
    supply_shock: {
      country: "Indonesia",
      export_capacity_delta_percent: 0
    },
    war: {
      is_active: false,
      region_hint: "South China Sea"
    },
    route_disruption: {
      is_active: false,
      severity: "medium"
    },
    situation_prompt: ""
  });

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        rounds: scenarioConfig.rounds,
        brief: briefMode,
        tariff_event: scenarioConfig.tariff_event.crude_delta_percent !== 0 || 
                    scenarioConfig.tariff_event.refined_delta_percent !== 0 
                    ? scenarioConfig.tariff_event : null,
        forex_shock: scenarioConfig.forex_shock.percent_change !== 0 
                    ? scenarioConfig.forex_shock : null,
        supply_shock: scenarioConfig.supply_shock.export_capacity_delta_percent !== 0 
                    ? scenarioConfig.supply_shock : null,
        war: scenarioConfig.war.is_active ? scenarioConfig.war : null,
        route_disruption: scenarioConfig.route_disruption.is_active 
                    ? scenarioConfig.route_disruption : null,
        situation_prompt: scenarioConfig.situation_prompt || null
      };

      Object.keys(payload).forEach(key => payload[key] === null && delete payload[key]);

      const response = await fetch('http://localhost:5000/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.ok) {
        setSimulationResult(result.result);
        if (onSimulationComplete) {
          onSimulationComplete(result.result);
        }
      } else {
        throw new Error(result.error || 'Simulation failed');
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key, value) => {
    setScenarioConfig(prev => {
      const keys = key.split('.');
      if (keys.length === 1) {
        return { ...prev, [key]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value
          }
        };
      }
      return prev;
    });
  };

  const presetScenarios = {
    'india_tariff_increase': {
      name: 'India Increases Tariffs',
      config: {
        tariff_event: {
          imposer: "India",
          crude_delta_percent: 8,
          refined_delta_percent: 10,
          target: "Indonesia"
        },
        situation_prompt: "India announces 8% increase in crude palm oil tariff, targeting Indonesian imports"
      }
    },
    'indonesia_supply_shock': {
      name: 'Indonesia Supply Disruption',
      config: {
        supply_shock: {
          country: "Indonesia",
          export_capacity_delta_percent: -15
        },
        situation_prompt: "El Niño weather pattern reduces Indonesian palm oil production by 15%"
      }
    },
    'forex_crisis': {
      name: 'INR Depreciation',
      config: {
        forex_shock: {
          pair: "INR_USD",
          percent_change: -8
        },
        situation_prompt: "Indian Rupee weakens 8% against USD, making imports more expensive"
      }
    },
    'geopolitical_tension': {
      name: 'Geopolitical Tensions',
      config: {
        war: {
          is_active: true,
          region_hint: "South China Sea shipping routes"
        },
        route_disruption: {
          is_active: true,
          severity: "high"
        },
        situation_prompt: "Geopolitical tensions disrupt major shipping routes through South China Sea"
      }
    }
  };

  const applyPreset = (presetKey) => {
    const preset = presetScenarios[presetKey];
    if (preset) {
      setScenarioConfig(prev => ({
        ...prev,
        ...preset.config
      }));
    }
  };

  // Enhanced UI Components for Full Results
  const AppliedShocksPanel = ({ shocks }) => {
    if (!shocks) return null;

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <h3 className="font-bold text-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Applied Shocks & Effects
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tariff Event */}
            {shocks.tariff_event?.applied && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-blue-800">Tariff Adjustment</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Imposer:</span>
                    <span className="font-semibold">{shocks.tariff_event.imposer}</span>
                  </div>
                  {shocks.tariff_event.new_tariffs && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Crude Tariff:</span>
                        <span className="font-semibold text-red-600">
                          {shocks.tariff_event.new_tariffs.crude}% 
                          <span className="text-xs text-gray-500 ml-1">
                            ({shocks.tariff_event.new_tariffs.crude > 0 ? '+' : ''})
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Refined Tariff:</span>
                        <span className="font-semibold text-red-600">
                          {shocks.tariff_event.new_tariffs.refined}%
                          <span className="text-xs text-gray-500 ml-1">
                            ({shocks.tariff_event.new_tariffs.refined > 0 ? '+' : ''})
                          </span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Forex Shock */}
            {shocks.forex_shock?.applied && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-green-800">Forex Movement</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Currency Pair:</span>
                    <span className="font-semibold">{shocks.forex_shock.pair}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Old Rate:</span>
                    <span className="font-semibold">{shocks.forex_shock.old}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Rate:</span>
                    <span className="font-semibold text-green-600">
                      {shocks.forex_shock.new}
                      <span className="text-xs text-gray-500 ml-1">
                        ({((shocks.forex_shock.new - shocks.forex_shock.old) / shocks.forex_shock.old * 100).toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Supply Shock */}
            {shocks.supply_shock?.applied && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-orange-800">Supply Disruption</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Country:</span>
                    <span className="font-semibold">{shocks.supply_shock.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Old Exports:</span>
                    <span className="font-semibold">{shocks.supply_shock.old_exports}M MT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Exports:</span>
                    <span className="font-semibold text-orange-600">
                      {shocks.supply_shock.new_exports}M MT
                      <span className="text-xs text-gray-500 ml-1">
                        ({shocks.supply_shock.delta_percent > 0 ? '+' : ''}{shocks.supply_shock.delta_percent}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Inferred Shock */}
            {shocks.inferred_supply_shock_applied && (
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-purple-800">Inferred Disruption</h4>
                </div>
                <p className="text-sm text-gray-600">Automatically inferred from route disruption and war risk scenarios</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ImpactReportsPanel = ({ reports }) => {
    if (!reports || !Array.isArray(reports)) return null;

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
          <h3 className="font-bold text-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l1 1a1 1 0 01-1.414 1.414l-1-1A1 1 0 0112 2zm-4.707 7.293a1 1 0 011.414 0L9 10.586V15a1 1 0 11-2 0v-4.414l-.293.293a1 1 0 01-1.414-1.414l2-2a1 1 0 011.414 0l2 2a1 1 0 010 1.414zM17 2a1 1 0 00-1.414 0l-1 1a1 1 0 001.414 1.414l1-1A1 1 0 0017 2zm-5 5a1 1 0 011 1v4.586l.293-.293a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414l.293.293V8a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Impact Reports
          </h3>
          <p className="text-sm opacity-90 mt-1">{reports.length} round{reports.length !== 1 ? 's' : ''} simulated</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {reports.map((report, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <span className="font-bold text-purple-600">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Round {report.round_number || idx + 1}</h4>
                      {report.price_movements?.scenario && (
                        <p className="text-sm text-gray-600">{report.price_movements.scenario}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                    Impact Score: {calculateImpactScore(report)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Movements */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <h5 className="font-semibold text-gray-700">Price Movements</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Crude Price:</span>
                        <span className="font-bold text-red-600">
                          ${report.price_movements?.new_crude_usd_per_tonne?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Refined Price:</span>
                        <span className="font-bold">
                          ${report.price_movements?.new_refined_usd_per_tonne?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Change vs Prev:</span>
                        <span className={`font-semibold ${
                          (report.price_movements?.price_change_percent_vs_prev || 0) >= 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {(report.price_movements?.price_change_percent_vs_prev || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Economic Impacts */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <h5 className="font-semibold text-gray-700">Economic Impacts</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">India Import Bill:</span>
                        <span className="font-bold text-blue-600">
                          ${report.economic_impacts?.india_import_bill?.cost_usd_billions?.toFixed(2) || 0}B
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">INR Bill:</span>
                        <span className="font-bold">
                          ₹{report.economic_impacts?.india_import_bill?.cost_inr_billions?.toFixed(2) || 0}B
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Inflation Impact:</span>
                        <span className={`font-semibold ${
                          (report.economic_impacts?.estimated_food_inflation_delta_percent || 0) > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {(report.economic_impacts?.estimated_food_inflation_delta_percent || 0).toFixed(4)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Volume Changes */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <h5 className="font-semibold text-gray-700">Market Volumes</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">India Demand:</span>
                        <span className="font-bold">
                          {report.volume_changes?.india_demand_million_tonnes?.toFixed(2) || 0}M MT
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">Export Volumes (M MT):</div>
                      <div className="space-y-1">
                        {report.volume_changes?.export_volumes_million_tonnes && 
                          Object.entries(report.volume_changes.export_volumes_million_tonnes).map(([country, volume]) => (
                            <div key={country} className="flex justify-between">
                              <span className="text-xs">{country}:</span>
                              <span className="text-xs font-medium">{volume.toFixed(2)}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Share Chart */}
                {report.volume_changes?.market_shares_percent && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-semibold text-gray-700 mb-3">Market Share Distribution</h5>
                    <div className="flex items-end h-20 space-x-2">
                      {Object.entries(report.volume_changes.market_shares_percent).map(([country, share]) => (
                        <div key={country} className="flex-1">
                          <div className="text-center text-xs mb-1">{country}</div>
                          <div 
                            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                            style={{ height: `${share * 0.6}px` }}
                            title={`${country}: ${share}%`}
                          >
                            <div className="text-center text-xs text-white pt-1">
                              {share.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const FinalStatePanel = ({ finalState }) => {
    if (!finalState) return null;

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4">
          <h3 className="font-bold text-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
            </svg>
            Final Market State
          </h3>
          <p className="text-sm opacity-90 mt-1">Round {finalState.round} • {finalState.date}</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prices and Forex */}
            <div className="space-y-6">
              {/* Global Prices */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Global Prices (USD/tonne)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-600 mb-1">Crude Palm Oil</div>
                    <div className="text-2xl font-bold text-red-700">
                      ${finalState.global_prices?.crude_usd_per_tonne?.toFixed(2) || 0}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Refined Palm Oil</div>
                    <div className="text-2xl font-bold text-blue-700">
                      ${finalState.global_prices?.refined_usd_per_tonne?.toFixed(2) || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Forex Rates */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Exchange Rates</h4>
                <div className="grid grid-cols-2 gap-3">
                  {finalState.forex && Object.entries(finalState.forex).map(([pair, rate]) => (
                    <div key={pair} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">{pair}</span>
                      <span className="font-bold text-gray-900">{rate.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tariffs and Inventory */}
            <div className="space-y-6">
              {/* Tariff Rates */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Tariff Rates (%)</h4>
                <div className="space-y-3">
                  {finalState.tariffs_percent && Object.entries(finalState.tariffs_percent).map(([country, tariffs]) => (
                    <div key={country} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{country}</span>
                      <div className="flex space-x-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Crude</div>
                          <div className={`font-bold ${tariffs.crude > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {tariffs.crude}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Refined</div>
                          <div className={`font-bold ${tariffs.refined > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {tariffs.refined}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Key Market Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">India Demand:</span>
                    <span className="font-bold text-gray-900">
                      {finalState.india_demand_million_tonnes?.toFixed(2) || 0}M MT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price Elasticity:</span>
                    <span className="font-bold text-gray-900">
                      {finalState.elasticities?.price_elasticity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Supply Elasticity:</span>
                    <span className="font-bold text-gray-900">
                      {finalState.elasticities?.supply_elasticity || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          {finalState.inventory_million_tonnes && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-800 mb-3">Country Inventories (Million Tonnes)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production Capacity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Reserves</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exports</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(finalState.inventory_million_tonnes).map(([country, data]) => {
                      const utilization = (data.exports / data.production_capacity * 100).toFixed(1);
                      return (
                        <tr key={country} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{country}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{data.production_capacity?.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`font-bold ${
                              data.current_reserves > 2 ? 'text-green-600' : 
                              data.current_reserves > 1 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {data.current_reserves?.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-bold text-blue-600">{data.exports?.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className={`h-2 rounded-full ${
                                    utilization > 80 ? 'bg-green-500' :
                                    utilization > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`font-bold ${
                                utilization > 80 ? 'text-green-600' :
                                utilization > 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {utilization}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CountryEffectsPanel = ({ countryEffects }) => {
    if (!countryEffects) return null;

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4">
          <h3 className="font-bold text-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Country Policy Responses
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(countryEffects).map(([country, data]) => (
              <div key={country} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      country === 'India' ? 'bg-saffron' :
                      country === 'Indonesia' ? 'bg-red-100' :
                      country === 'Malaysia' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <span className="font-bold">
                        {country.charAt(0)}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-800">{country}</h4>
                  </div>
                  {data.VALIDITY_FLAG && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      Validation Flagged
                    </span>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-500 mb-1">Analysis:</div>
                  <p className="text-sm text-gray-700 line-clamp-3">{data.analysis || 'No analysis provided'}</p>
                </div>
                
                {data.rationale && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-500 mb-1">Rationale:</div>
                    <p className="text-sm text-gray-700 line-clamp-2">{data.rationale}</p>
                  </div>
                )}
                
                {data.policy_actions && data.policy_actions.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Policy Actions:</div>
                    <div className="space-y-2">
                      {data.policy_actions.slice(0, 2).map((action, idx) => (
                        <div key={idx} className="text-xs p-2 bg-gray-50 rounded border border-gray-100">
                          <div className="font-semibold text-gray-700">{action.action_name || 'Action'}</div>
                          <div className="text-gray-600 mt-1">{action.description || action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const calculateImpactScore = (report) => {
    if (!report) return 0;
    let score = 0;
    
    // Price change impact
    const priceChange = Math.abs(report.price_movements?.price_change_percent_vs_prev || 0);
    score += priceChange * 2;
    
    // Inflation impact
    const inflationImpact = Math.abs(report.economic_impacts?.estimated_food_inflation_delta_percent || 0);
    score += inflationImpact * 100;
    
    // Import bill impact (normalized)
    const importBill = report.economic_impacts?.india_import_bill?.cost_usd_billions || 0;
    score += importBill * 0.1;
    
    return Math.min(Math.round(score), 100);
  };

  const renderFullResult = (result) => {
    if (!result) return null;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Scenario Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl">Simulation Complete</h3>
              <p className="opacity-90 mt-1">{result.scenario_used}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{result.round || 1} Round{result.round !== 1 ? 's' : ''}</div>
              <div className="text-sm opacity-90">Simulated</div>
            </div>
          </div>
        </div>

        {/* Applied Shocks */}
        <AppliedShocksPanel shocks={result.applied_shocks} />

        {/* Impact Reports */}
        {result.impact_reports && (
          <ImpactReportsPanel reports={result.impact_reports} />
        )}

        {/* Country Effects */}
        {result.impact_reports?.[0]?.country_specific_effects && (
          <CountryEffectsPanel 
            countryEffects={result.impact_reports[0].country_specific_effects} 
          />
        )}

        {/* Final State */}
        {result.final_state_summary && (
          <FinalStatePanel finalState={result.final_state_summary} />
        )}

        {/* Risk Assessment */}
        {result.risk_assessment && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Risk Assessment</h3>
            <div className="flex space-x-4">
              {result.risk_assessment.war_flag && (
                <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <h4 className="font-semibold text-red-800">War Risk Active</h4>
                  </div>
                  <p className="text-sm text-red-600">
                    Geopolitical tensions may disrupt supply chains and increase volatility
                  </p>
                </div>
              )}
              {result.risk_assessment.route_disruption_flag && (
                <div className="flex-1 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                    <h4 className="font-semibold text-orange-800">Route Disruption</h4>
                  </div>
                  <p className="text-sm text-orange-600">
                    Shipping route issues may affect delivery timelines and costs
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(result, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `simulation_results_${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>
    );
  };

  const renderBriefResult = (result) => {
    if (!result) return null;

    return (
      <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-3">Simulation Summary</h3>
        
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Scenario:</h4>
          <p className="text-sm text-gray-600">{result.scenario_used}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Country Actions:</h4>
          <div className="space-y-2">
            {Object.entries(result.countries || {}).map(([country, data]) => (
              <div key={country} className="flex items-start p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-800 w-24">{country}:</div>
                <div>
                  <div className="font-semibold">{data.action}</div>
                  <div className="text-xs text-gray-500">{data.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">India Impact:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-2 bg-blue-50 rounded">
              <div className="text-xs text-blue-600">Crude Price</div>
              <div className="font-bold">${result.india_impact?.crude_price_usd_per_tonne || 0}/tonne</div>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <div className="text-xs text-blue-600">Import Bill</div>
              <div className="font-bold">${result.india_impact?.import_bill_usd_billion_est || 0}B</div>
            </div>
          </div>
        </div>

        {result.india_recommended_policy && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Policy Recommendations:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {result.india_recommended_policy.map((rec, idx) => (
                <li key={idx} className="mb-1">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {result.risk_flags?.war && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">War Risk</span>
          )}
          {result.risk_flags?.route_disruption && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Route Disruption</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h3 className="text-lg font-bold">Multi-Agent Trade Simulation</h3>
        <p className="text-sm opacity-90">Simulate global palm oil trade dynamics with AI agents</p>
      </div>

      <div className="p-6">
        {/* Quick Presets */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Quick Scenarios:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presetScenarios).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tariff Event */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Tariff Event</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Imposer</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={scenarioConfig.tariff_event.imposer}
                  onChange={(e) => updateConfig('tariff_event.imposer', e.target.value)}
                >
                  <option value="India">India</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Thailand">Thailand</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Crude Δ%</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={scenarioConfig.tariff_event.crude_delta_percent}
                    onChange={(e) => updateConfig('tariff_event.crude_delta_percent', parseFloat(e.target.value))}
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Refined Δ%</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={scenarioConfig.tariff_event.refined_delta_percent}
                    onChange={(e) => updateConfig('tariff_event.refined_delta_percent', parseFloat(e.target.value))}
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Forex Shock */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Forex Shock</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Currency Pair</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={scenarioConfig.forex_shock.pair}
                  onChange={(e) => updateConfig('forex_shock.pair', e.target.value)}
                >
                  <option value="INR_USD">INR/USD</option>
                  <option value="IDR_USD">IDR/USD</option>
                  <option value="MYR_USD">MYR/USD</option>
                  <option value="THB_USD">THB/USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Change %</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={scenarioConfig.forex_shock.percent_change}
                  onChange={(e) => updateConfig('forex_shock.percent_change', parseFloat(e.target.value))}
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Supply Shock */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Supply Shock</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Country</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={scenarioConfig.supply_shock.country}
                  onChange={(e) => updateConfig('supply_shock.country', e.target.value)}
                >
                  <option value="Indonesia">Indonesia</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Thailand">Thailand</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Export Capacity Δ%</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={scenarioConfig.supply_shock.export_capacity_delta_percent}
                  onChange={(e) => updateConfig('supply_shock.export_capacity_delta_percent', parseFloat(e.target.value))}
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Geopolitical Factors */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Geopolitical Factors</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="war-risk"
                  className="mr-2"
                  checked={scenarioConfig.war.is_active}
                  onChange={(e) => updateConfig('war.is_active', e.target.checked)}
                />
                <label htmlFor="war-risk" className="text-sm text-gray-600">War Risk Active</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="route-disruption"
                  className="mr-2"
                  checked={scenarioConfig.route_disruption.is_active}
                  onChange={(e) => updateConfig('route_disruption.is_active', e.target.checked)}
                />
                <label htmlFor="route-disruption" className="text-sm text-gray-600">Route Disruption</label>
              </div>
              {scenarioConfig.route_disruption.is_active && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Severity</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={scenarioConfig.route_disruption.severity}
                    onChange={(e) => updateConfig('route_disruption.severity', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Configuration */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rounds
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={scenarioConfig.rounds}
                onChange={(e) => updateConfig('rounds', parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situation Description
              </label>
              <textarea
                className="w-full p-2 border rounded"
                value={scenarioConfig.situation_prompt}
                onChange={(e) => updateConfig('situation_prompt', e.target.value)}
                placeholder="Describe the geopolitical or market situation..."
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Mode Toggle and Run Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="mr-3 text-sm text-gray-700">Output Mode:</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setBriefMode(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  briefMode 
                    ? "bg-white text-gray-800 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Brief Summary
              </button>
              <button
                onClick={() => setBriefMode(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !briefMode 
                    ? "bg-white text-gray-800 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Full Details
              </button>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running Simulation...
              </span>
            ) : "Run Multi-Agent Simulation"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="font-semibold">Error:</div>
            <div>{error}</div>
          </div>
        )}

        {/* Results Display */}
        {simulationResult && (
          <div className="mt-6">
            {briefMode ? renderBriefResult(simulationResult) : renderFullResult(simulationResult)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeSimulationComponent;