import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Save,
  X,
  IndianRupee,
  TrendingUp
} from "lucide-react";
import { useStaticData } from "../../contexts/StaticDataContext";

export default function PriceDataManager() {
  const { data, updatePriceData, addChangeLog } = useStaticData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    year: "all",
    month: "all",
    yearType: "financialYear"
  });
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearData, setNewYearData] = useState({ year: "", month: "Jan", ffb: "", cpo: "" });
  const [loading, setLoading] = useState(false);

  // Get price data from context
  const priceData = data.telanganaPriceData || { financialYear: [], oilYear: [] };
  const currentData = priceData[filters.yearType] || [];
  
  // Get available years
  const availableYears = [...new Set(currentData.map(y => y.year))];

  // Filter data based on selections
  const filteredData = currentData.filter(yearData => {
    if (selectedYear && yearData.year !== selectedYear) return false;
    return true;
  });

  // Calculate summary statistics
  const summaryStats = {
    totalYears: currentData.length,
    totalMonths: currentData.reduce((sum, year) => sum + (year.data?.length || 0), 0),
    avgFFB: currentData.length > 0 ? 
      Math.round(currentData.reduce((sum, year) => 
        sum + year.data.reduce((s, m) => s + (m.ffb || 0), 0), 0) / 
        currentData.reduce((sum, year) => sum + year.data.length, 0)
      ) : 0,
    avgCPO: currentData.length > 0 ? 
      Math.round(currentData.reduce((sum, year) => 
        sum + year.data.reduce((s, m) => s + (m.cpo || 0), 0), 0) / 
        currentData.reduce((sum, year) => sum + year.data.length, 0)
      ) : 0,
    latestFFB: currentData[currentData.length - 1]?.data[currentData[currentData.length - 1]?.data?.length - 1]?.ffb || 0,
    latestCPO: currentData[currentData.length - 1]?.data[currentData[currentData.length - 1]?.data?.length - 1]?.cpo || 0
  };

  const handleCellEdit = (yearIndex, monthIndex, field, value) => {
    const numericValue = parseInt(value) || 0;
    const oldValue = currentData[yearIndex].data[monthIndex][field];
    
    if (oldValue === numericValue) {
      setEditingCell(null);
      return;
    }

    // Update in context
    const updatedData = JSON.parse(JSON.stringify(currentData));
    updatedData[yearIndex].data[monthIndex][field] = numericValue;
    
    updatePriceData("Telangana", filters.yearType, updatedData[yearIndex].year, updatedData[yearIndex].data);
    
    // Log the change
    addChangeLog(
      'UPDATE',
      `telanganaPriceData.${filters.yearType}[${yearIndex}].data[${monthIndex}].${field}`,
      oldValue,
      numericValue
    );
    
    setEditingCell(null);
  };

  const handleAddMonth = (yearIndex) => {
    if (!newYearData.month || !newYearData.ffb || !newYearData.cpo) {
      alert("Please fill all fields");
      return;
    }

    const monthExists = currentData[yearIndex].data.some(m => m.month === newYearData.month);
    if (monthExists) {
      alert(`Month ${newYearData.month} already exists for this year`);
      return;
    }

    const updatedData = JSON.parse(JSON.stringify(currentData));
    updatedData[yearIndex].data.push({
      month: newYearData.month,
      ffb: parseInt(newYearData.ffb),
      cpo: parseInt(newYearData.cpo)
    });

    updatePriceData("Telangana", filters.yearType, updatedData[yearIndex].year, updatedData[yearIndex].data);
    
    addChangeLog(
      'CREATE',
      `telanganaPriceData.${filters.yearType}[${yearIndex}].data`,
      '',
      `Added ${newYearData.month} data`
    );
    
    setNewYearData({ year: "", month: "Jan", ffb: "", cpo: "" });
  };

  const handleDeleteMonth = (yearIndex, monthIndex) => {
    if (window.confirm("Delete this month's data?")) {
      const monthName = currentData[yearIndex].data[monthIndex].month;
      const updatedData = JSON.parse(JSON.stringify(currentData));
      updatedData[yearIndex].data.splice(monthIndex, 1);

      updatePriceData("Telangana", filters.yearType, updatedData[yearIndex].year, updatedData[yearIndex].data);
      
      addChangeLog(
        'DELETE',
        `telanganaPriceData.${filters.yearType}[${yearIndex}].data[${monthIndex}]`,
        `Month ${monthName} data`,
        ''
      );
    }
  };

  const handleAddYear = () => {
    if (!newYearData.year) {
      alert("Please enter a year");
      return;
    }

    const yearExists = currentData.some(y => y.year === newYearData.year);
    if (yearExists) {
      alert(`Year ${newYearData.year} already exists`);
      return;
    }

    const newYear = {
      year: newYearData.year,
      data: []
    };

    const updatedData = [...currentData, newYear];
    // Update context - this needs to be implemented in your updatePriceData function
    console.log("Add new year:", newYear);
    
    addChangeLog(
      'CREATE',
      `telanganaPriceData.${filters.yearType}`,
      '',
      `Added year ${newYearData.year}`
    );
    
    setNewYearData({ year: "", month: "Jan", ffb: "", cpo: "" });
    setShowAddYear(false);
  };

  const handleExport = () => {
    const exportData = {
      telanganaPriceData: priceData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `price_data_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
    
    addChangeLog('EXPORT', 'telanganaPriceData', '', 'Exported price data');
  };

  const getPriceTrend = () => {
    const latestYear = currentData[currentData.length - 1];
    if (!latestYear || !latestYear.data) return [];
    
    return latestYear.data.map(month => ({
      month: month.month,
      ffb: month.ffb,
      cpo: month.cpo,
      ratio: month.cpo > 0 ? ((month.ffb / month.cpo) * 100).toFixed(2) : 0
    }));
  };

  return (
    <div className="space-y-6">
      {/* Government Header */}
      <div className="bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">FFB & CPO Price Data Management</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>FINANCIAL DATA</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Update and manage Fresh Fruit Bunches and Crude Palm Oil price data for Telangana
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  Data Source: staticData.js
                </div>
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  State: Telangana
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={16} />
                Export JSON
              </button>
              <button
                onClick={() => setShowAddYear(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
              >
                <Plus size={16} />
                Add Year
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Years</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{summaryStats.totalYears}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">Total Months</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{summaryStats.totalMonths}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">Avg FFB</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">₹{summaryStats.avgFFB.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600">Avg CPO</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">₹{summaryStats.avgCPO.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-600">Latest FFB</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">₹{summaryStats.latestFFB.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Data Type</div>
          <div className="text-lg font-bold text-gray-800 mt-1">
            {filters.yearType === 'financialYear' ? 'Financial Year' : 'Oil Year'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Year Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Type</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setFilters(prev => ({ ...prev, yearType: 'financialYear' }))}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  filters.yearType === 'financialYear'
                    ? 'bg-[#003366] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Financial Year
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, yearType: 'oilYear' }))}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  filters.yearType === 'oilYear'
                    ? 'bg-[#003366] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Oil Year
              </button>
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2.5 px-3"
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Months</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search months..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Add New Month */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">Add New Month Data</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              value={newYearData.month}
              onChange={(e) => setNewYearData(prev => ({ ...prev, month: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {data.MONTHS?.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="FFB Price"
              value={newYearData.ffb}
              onChange={(e) => setNewYearData(prev => ({ ...prev, ffb: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="CPO Price"
              value={newYearData.cpo}
              onChange={(e) => setNewYearData(prev => ({ ...prev, cpo: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <select
              value={newYearData.year}
              onChange={(e) => setNewYearData(prev => ({ ...prev, year: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Year</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const yearIndex = currentData.findIndex(y => y.year === newYearData.year);
                if (yearIndex !== -1) {
                  handleAddMonth(yearIndex);
                } else {
                  alert("Please select an existing year first");
                }
              }}
              className="bg-[#003366] text-white rounded-lg px-4 py-2 hover:bg-[#002244]"
            >
              Add Month
            </button>
          </div>
        </div>
      </div>

      {/* Add Year Modal */}
      {showAddYear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-[#003366] to-[#00509e] text-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Add New Year</h3>
                <button onClick={() => setShowAddYear(false)} className="text-white hover:text-gray-200">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year (e.g., 2026-27)
                </label>
                <input
                  type="text"
                  value={newYearData.year}
                  onChange={(e) => setNewYearData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Enter year"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Type
                </label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => console.log("Set as financial year")}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700"
                  >
                    Financial Year
                  </button>
                  <button
                    onClick={() => console.log("Set as oil year")}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700"
                  >
                    Oil Year
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddYear(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddYear}
                  className="px-6 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
                >
                  Add Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Tables */}
      {filteredData.length > 0 ? (
        filteredData.map((yearData, yearIndex) => (
          <div key={yearData.year} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Year Header */}
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600" size={24} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{yearData.year}</h3>
                    <p className="text-sm text-gray-600">
                      {yearData.data.length} months • {filters.yearType === 'financialYear' ? 'Financial Year' : 'Oil Year'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Avg FFB</div>
                    <div className="font-bold text-blue-700">
                      ₹{yearData.data.length > 0 ? 
                        Math.round(yearData.data.reduce((sum, m) => sum + m.ffb, 0) / yearData.data.length).toLocaleString() 
                        : 0}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Avg CPO</div>
                    <div className="font-bold text-green-700">
                      ₹{yearData.data.length > 0 ? 
                        Math.round(yearData.data.reduce((sum, m) => sum + m.cpo, 0) / yearData.data.length).toLocaleString() 
                        : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FFB Price (₹/MT)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPO Price (₹/MT)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ratio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yearData.data
                    .filter(month => 
                      searchTerm === '' || 
                      month.month.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((month, monthIndex) => {
                      const ratio = month.cpo > 0 ? ((month.ffb / month.cpo) * 100).toFixed(2) : 0;
                      
                      return (
                        <tr key={month.month} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{month.month}</div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingCell === `${yearIndex}-${monthIndex}-ffb` ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  defaultValue={month.ffb}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="w-32 border border-gray-300 rounded px-2 py-1"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleCellEdit(yearIndex, monthIndex, 'ffb', editingValue)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => {
                                  setEditingCell(`${yearIndex}-${monthIndex}-ffb`);
                                  setEditingValue(month.ffb.toString());
                                }}
                              >
                                <IndianRupee size={14} className="text-gray-400" />
                                <span className="font-medium">{month.ffb.toLocaleString()}</span>
                                <Edit size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingCell === `${yearIndex}-${monthIndex}-cpo` ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  defaultValue={month.cpo}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="w-32 border border-gray-300 rounded px-2 py-1"
                                />
                                <button
                                  onClick={() => handleCellEdit(yearIndex, monthIndex, 'cpo', editingValue)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => {
                                  setEditingCell(`${yearIndex}-${monthIndex}-cpo`);
                                  setEditingValue(month.cpo.toString());
                                }}
                              >
                                <IndianRupee size={14} className="text-gray-400" />
                                <span className="font-medium">{month.cpo.toLocaleString()}</span>
                                <Edit size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`font-medium ${
                              ratio > 20 ? 'text-green-600' : 
                              ratio > 15 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {ratio}%
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteMonth(yearIndex, monthIndex)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Year Summary */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total FFB Value</div>
                  <div className="text-lg font-bold text-gray-800">
                    ₹{yearData.data.reduce((sum, m) => sum + m.ffb, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total CPO Value</div>
                  <div className="text-lg font-bold text-gray-800">
                    ₹{yearData.data.reduce((sum, m) => sum + m.cpo, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Avg Ratio</div>
                  <div className="text-lg font-bold text-gray-800">
                    {yearData.data.length > 0 ? 
                      ((yearData.data.reduce((sum, m) => sum + (m.ffb / m.cpo), 0) / yearData.data.length) * 100).toFixed(2) 
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Price Data Available</h3>
          <p className="text-gray-500 mb-4">Add price data using the controls above</p>
          <button
            onClick={() => setShowAddYear(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
          >
            <Plus size={16} />
            Add Your First Year
          </button>
        </div>
      )}

      {/* Price Trends */}
      {filteredData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Trends Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Highest FFB Price</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{Math.max(...filteredData.flatMap(y => y.data.map(m => m.ffb))).toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Lowest FFB Price</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                ₹{Math.min(...filteredData.flatMap(y => y.data.map(m => m.ffb))).toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Price Range</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                ₹{(Math.max(...filteredData.flatMap(y => y.data.map(m => m.ffb))) - 
                    Math.min(...filteredData.flatMap(y => y.data.map(m => m.ffb)))).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}