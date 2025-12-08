import React, { useState } from "react";
import { 
  Database, 
  Search, 
  Filter, 
  Edit2, 
  Save, 
  X, 
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  FileText,
  BarChart3,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Shield,
  Globe
} from "lucide-react";
import { useStaticData } from "../../contexts/StaticDataContext";
import DropdownManager from "./DropdownManager";
import PriceDataEditor from "./PriceDataEditor";
import StateDataEditor from "./StateDataEditor";

export default function StaticDataManager() {
  const { data, exportData, resetToOriginal, getDataAsJSFile } = useStaticData();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const dataCategories = [
    {
      id: 'dropdowns',
      title: 'Dropdown Lists',
      icon: <ChevronDown size={20} />,
      count: 5,
      color: 'blue',
      description: 'Basic dropdown options like states, years, months'
    },
    {
      id: 'prices',
      title: 'Price Data',
      icon: <BarChart3 size={20} />,
      count: 1,
      color: 'green',
      description: 'FFB and CPO prices by state and time'
    },
    {
      id: 'states',
      title: 'State-wise Data',
      icon: <MapPin size={20} />,
      count: Object.keys(data.stateWiseData || {}).length,
      color: 'purple',
      description: 'Detailed state-level statistics and targets'
    },
    {
      id: 'nmeo',
      title: 'NMEO-OP Mission',
      icon: <Target size={20} />,
      count: 4,
      color: 'orange',
      description: 'Mission targets, achievements, and financial data'
    },
    {
      id: 'market',
      title: 'Market Data',
      icon: <TrendingUp size={20} />,
      count: 6,
      color: 'red',
      description: 'Live market prices, trends, and analysis'
    },
    {
      id: 'charts',
      title: 'Chart Data',
      icon: <FileText size={20} />,
      count: 7,
      color: 'indigo',
      description: 'Data series for charts and visualizations'
    }
  ];

  const handleExportJS = () => {
    const jsContent = getDataAsJSFile();
    const blob = new Blob([jsContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staticData.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-[#003366]" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-[#003366]">Static Data Management</h1>
                <p className="text-gray-600">Manage all NMEO-OP policy data directly in the browser</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Shield size={14} />
                <span>Local Storage</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
                <Database size={14} />
                <span>{Object.keys(data).length} Data Sets</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm">
                <Users size={14} />
                <span>Editable In-Browser</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={16} />
              Export JSON
            </button>
            <button
              onClick={handleExportJS}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText size={16} />
              Export JS File
            </button>
            <button
              onClick={resetToOriginal}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search data fields, values, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filters
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('dropdowns')}
              className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'dropdowns'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dropdowns
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'prices'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Price Data
            </button>
            <button
              onClick={() => setActiveTab('states')}
              className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'states'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              State Data
            </button>
            <button
              onClick={() => setActiveTab('nmeo')}
              className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'nmeo'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              NMEO Mission
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer ${
                      category.color === 'blue' ? 'border-l-4 border-blue-500' :
                      category.color === 'green' ? 'border-l-4 border-green-500' :
                      category.color === 'purple' ? 'border-l-4 border-purple-500' :
                      category.color === 'orange' ? 'border-l-4 border-orange-500' :
                      category.color === 'red' ? 'border-l-4 border-red-500' :
                      'border-l-4 border-indigo-500'
                    }`}
                    onClick={() => setActiveTab(category.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        category.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        category.color === 'green' ? 'bg-green-100 text-green-600' :
                        category.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        category.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                        category.color === 'red' ? 'bg-red-100 text-red-600' :
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                        {category.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        category.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        category.color === 'green' ? 'bg-green-100 text-green-800' :
                        category.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                        category.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        category.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {category.count} items
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="text-sm text-[#003366] font-medium hover:underline">
                        Edit Data →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-800">
                    {Object.keys(data).length}
                  </div>
                  <div className="text-sm text-gray-600">Total Data Sets</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {JSON.stringify(data).length.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Characters</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(data.stateWiseData || {}).length}
                  </div>
                  <div className="text-sm text-gray-600">States Covered</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {data.telanganaPriceData?.financialYear?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Years of Price Data</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dropdowns' && <DropdownManager />}
          {activeTab === 'prices' && <PriceDataEditor />}
          {activeTab === 'states' && <StateDataEditor />}
          {/* {activeTab === 'nmeo' && <NMEODataEditor />} */}
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Data Preview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Current FFB Price (Telangana)</h4>
            <div className="text-3xl font-bold text-green-600">
              ₹{data.liveMarket?.currentFFBPrice?.toLocaleString() || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-1">per metric ton</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">NMEO-OP Area Coverage</h4>
            <div className="text-3xl font-bold text-blue-600">
              {data.nmeoOpProgress?.areaCurrent || 0} lakh ha
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Target: {data.nmeoOpProgress?.areaTarget2030 || 0} lakh ha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}