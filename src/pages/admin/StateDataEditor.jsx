import React, { useState } from "react";
import { 
  MapPin, 
  Edit2, 
  Save, 
  Eye, 
  EyeOff, 
  TrendingUp,
  BarChart3,
  Users,
  Factory,
  DollarSign,
  ChevronDown,
  Search,
  Filter
} from "lucide-react";
import { useStaticData } from "../../contexts/StaticDataContext";

export default function StateDataEditor() {
  const { data, updateStateData } = useStaticData();
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'production', 'financial'
  const [searchTerm, setSearchTerm] = useState('');

  const states = Object.keys(data.stateWiseData || {}).filter(s => s !== "All-India");
  const stateData = data.stateWiseData[selectedState] || {};

  const handleFieldEdit = (field, value) => {
    updateStateData(selectedState, { [field]: parseFloat(value) || value });
    setEditingField(null);
  };

  const filteredStates = states.filter(state =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateCoverage = () => {
    if (stateData.potentialArea && stateData.areaCovered) {
      return ((stateData.areaCovered / stateData.potentialArea) * 100).toFixed(2);
    }
    return stateData.coveragePercentage || 0;
  };

  return (
    <div className="space-y-6">
      {/* State Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select State
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            >
              <option value="overview">Overview</option>
              <option value="production">Production Data</option>
              <option value="financial">Financial Data</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
          </div>
        </div>

        {/* State Quick Select */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filteredStates.slice(0, 8).map(state => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                selectedState === state
                  ? 'bg-[#003366] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {state}
            </button>
          ))}
          {filteredStates.length > 8 && (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              <option value="">More States...</option>
              {filteredStates.slice(8).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* State Overview Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MapPin size={32} className="text-yellow-300" />
              <div>
                <h2 className="text-2xl font-bold">{selectedState}</h2>
                <p className="text-blue-200">
                  Oil Palm Cultivation Data • NMEO-OP Implementation
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Coverage</div>
              <div className="text-2xl font-bold">
                {calculateCoverage()}%
              </div>
            </div>
          </div>
        </div>

        {/* Data Sections */}
        <div className="p-6">
          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-blue-600" />
                    <div className="text-sm font-medium text-blue-800">Potential Area</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {(stateData.potentialArea / 1000).toFixed(1)}K ha
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-green-600" />
                    <div className="text-sm font-medium text-green-800">Area Covered</div>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {(stateData.areaCovered / 1000).toFixed(1)}K ha
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} className="text-purple-600" />
                    <div className="text-sm font-medium text-purple-800">OER</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {stateData.OER || 'N/A'}%
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Factory size={16} className="text-amber-600" />
                    <div className="text-sm font-medium text-amber-800">Processing Mills</div>
                  </div>
                  <div className="text-2xl font-bold text-amber-900">
                    {stateData.processingMills || 0}
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Current Prices</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">FFB Price</span>
                      <div className="flex items-center gap-2">
                        {editingField === 'currentFFBPrice' ? (
                          <input
                            type="number"
                            defaultValue={stateData.currentFFBPrice}
                            onBlur={(e) => handleFieldEdit('currentFFBPrice', e.target.value)}
                            className="w-32 border border-gray-300 rounded px-2 py-1"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="font-medium">
                              ₹{stateData.currentFFBPrice?.toLocaleString() || 'N/A'}
                            </span>
                            <Edit2 
                              size={14} 
                              className="text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer"
                              onClick={() => setEditingField('currentFFBPrice')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">CPO Price</span>
                      <div className="flex items-center gap-2">
                        {editingField === 'currentCPOPrice' ? (
                          <input
                            type="number"
                            defaultValue={stateData.currentCPOPrice}
                            onBlur={(e) => handleFieldEdit('currentCPOPrice', e.target.value)}
                            className="w-32 border border-gray-300 rounded px-2 py-1"
                          />
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="font-medium">
                              ₹{stateData.currentCPOPrice?.toLocaleString() || 'N/A'}
                            </span>
                            <Edit2 
                              size={14} 
                              className="text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer"
                              onClick={() => setEditingField('currentCPOPrice')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expansion Targets */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">NMEO-OP Targets</h3>
                  <div className="space-y-2">
                    {stateData.areaExpansionTargets?.map((target, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {2021 + index}-{22 + index}
                        </span>
                        <div className="flex items-center gap-2">
                          {editingField === `target_${index}` ? (
                            <input
                              type="number"
                              defaultValue={target}
                              onBlur={(e) => {
                                const newTargets = [...stateData.areaExpansionTargets];
                                newTargets[index] = parseInt(e.target.value);
                                updateStateData(selectedState, { areaExpansionTargets: newTargets });
                                setEditingField(null);
                              }}
                              className="w-32 border border-gray-300 rounded px-2 py-1"
                            />
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="font-medium">{target.toLocaleString()} ha</span>
                              <Edit2 
                                size={14} 
                                className="text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer"
                                onClick={() => setEditingField(`target_${index}`)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'production' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Historical Production Data</h3>
              {stateData.productionData ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Target</th>
                        <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Achieved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FFB (MT)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPO (MT)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(stateData.productionData).map(([year, data]) => (
                        <tr key={year}>
                          <td className="px-6 py-4">{year}</td>
                          <td className="px-6 py-4">{data.areaTarget?.toLocaleString() || 'N/A'}</td>
                          <td className="px-6 py-4">{data.areaAchieved?.toLocaleString() || 'N/A'}</td>
                          <td className="px-6 py-4">{data.ffb?.toLocaleString() || 'N/A'}</td>
                          <td className="px-6 py-4">{data.cpo?.toLocaleString() || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No production data available</p>
              )}
            </div>
          )}

          {viewMode === 'financial' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Financial Data</h3>
              {stateData.financialData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(stateData.financialData).map(([year, data]) => (
                    <div key={year} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-800 mb-3">{year}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Allocation</span>
                          <span className="font-medium">₹{data.allocation?.toLocaleString()} lakh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Release</span>
                          <span className="font-medium">₹{data.release?.toLocaleString()} lakh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Utilization</span>
                          <span className="font-medium">
                            {data.allocation ? ((data.release || 0) / data.allocation * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No financial data available</p>
              )}
            </div>
          )}

          {viewMode === 'infrastructure' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Infrastructure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Processing Units</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Mills</span>
                      <span className="font-medium">{stateData.processingMills || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crushing Capacity</span>
                      <span className="font-medium">{stateData.crushingCapacity || 'N/A'} MT/hr</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Districts</h4>
                  <div className="text-sm text-gray-600">
                    {stateData.districts?.length || 0} districts covered
                  </div>
                  {stateData.districts && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stateData.districts.slice(0, 8).map(district => (
                        <span key={district} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {district}
                        </span>
                      ))}
                      {stateData.districts.length > 8 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{stateData.districts.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All States Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">All States Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Covered (ha)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FFB Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {states.map(state => {
                const sData = data.stateWiseData[state];
                const coverage = sData.coveragePercentage || 
                  (sData.potentialArea && sData.areaCovered ? 
                    ((sData.areaCovered / sData.potentialArea) * 100).toFixed(1) : 0);
                
                return (
                  <tr 
                    key={state}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedState === state ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedState(state)}
                  >
                    <td className="px-6 py-4 font-medium">{state}</td>
                    <td className="px-6 py-4">
                      {(sData.areaCovered || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              coverage > 50 ? 'bg-green-500' :
                              coverage > 20 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(coverage, 100)}%` }}
                          ></div>
                        </div>
                        <span>{coverage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      ₹{sData.currentFFBPrice?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">{sData.processingMills || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coverage > 50 ? 'bg-green-100 text-green-800' :
                        coverage > 20 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coverage > 50 ? 'High' : coverage > 20 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}