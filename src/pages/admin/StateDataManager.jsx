import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  TrendingUp, 
  Download, 
  Upload, 
  Edit2, 
  Eye,
  BarChart3,
  PieChart,
  Filter
} from "lucide-react";
import DataTable from "../../components/admin/DataTable";

const stateDataSchema = {
  fields: [
    { name: 'state', label: 'State/UT', type: 'text', required: true },
    { name: 'potentialArea', label: 'Potential Area (ha)', type: 'number', required: true },
    { name: 'areaCovered', label: 'Area Covered (ha)', type: 'number', required: true },
    { name: 'coveragePercentage', label: 'Coverage %', type: 'number', min: 0, max: 100, step: 0.1 },
    { name: 'currentFFBPrice', label: 'Current FFB Price (₹)', type: 'number' },
    { name: 'currentCPOPrice', label: 'Current CPO Price (₹)', type: 'number' },
    { name: 'processingMills', label: 'Processing Mills', type: 'number' },
    { name: 'crushingCapacity', label: 'Crushing Capacity (MT/hr)', type: 'number' },
    { name: 'OER', label: 'Oil Extraction Rate (%)', type: 'number', min: 0, max: 100, step: 0.01 }
  ]
};

export default function StateDataManager() {
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    loadStateData();
  }, []);

  const loadStateData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const sampleData = [
        {
          id: 1,
          state: "Andhra Pradesh",
          potentialArea: 531379,
          areaCovered: 185000,
          coveragePercentage: 34.8,
          currentFFBPrice: 17951,
          currentCPOPrice: 116159,
          processingMills: 19,
          crushingCapacity: 240,
          OER: 16.26,
          status: "leading",
          lastUpdated: "2024-01-15"
        },
        {
          id: 2,
          state: "Telangana",
          potentialArea: 436325,
          areaCovered: 21382,
          coveragePercentage: 4.9,
          currentFFBPrice: 19681,
          currentCPOPrice: 115715,
          processingMills: 2,
          crushingCapacity: 60,
          OER: 18.04,
          status: "growing",
          lastUpdated: "2024-01-14"
        },
        {
          id: 3,
          state: "Karnataka",
          potentialArea: 72642,
          areaCovered: 46954,
          coveragePercentage: 64.6,
          currentFFBPrice: 15306,
          currentCPOPrice: 110191,
          processingMills: 4,
          crushingCapacity: 21,
          OER: 17.0,
          status: "stable",
          lastUpdated: "2024-01-13"
        },
        {
          id: 4,
          state: "Tamil Nadu",
          potentialArea: 95719,
          areaCovered: 32982,
          coveragePercentage: 34.5,
          currentFFBPrice: 8126,
          currentCPOPrice: null,
          processingMills: 1,
          crushingCapacity: 2.5,
          OER: 14.29,
          status: "moderate",
          lastUpdated: "2024-01-12"
        },
        {
          id: 5,
          state: "Odisha",
          potentialArea: 34291,
          areaCovered: 23130,
          coveragePercentage: 67.5,
          currentFFBPrice: 17636,
          currentCPOPrice: null,
          processingMills: 0,
          crushingCapacity: null,
          OER: null,
          status: "growing",
          lastUpdated: "2024-01-11"
        }
      ];
      setStateData(sampleData);
      setLoading(false);
    }, 1500);
  };

  const filteredData = stateData.filter(item =>
    item.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (state) => {
    setSelectedState(state);
  };

  const handleSave = (updatedData) => {
    if (selectedState?.id) {
      setStateData(prev => prev.map(item =>
        item.id === selectedState.id ? { ...item, ...updatedData } : item
      ));
    } else {
      setStateData(prev => [...prev, { id: Date.now(), ...updatedData, lastUpdated: new Date().toISOString().split('T')[0] }]);
    }
    setSelectedState(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'leading': return 'bg-green-100 text-green-800';
      case 'growing': return 'bg-blue-100 text-blue-800';
      case 'stable': return 'bg-amber-100 text-amber-800';
      case 'moderate': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const summaryStats = {
    totalPotential: stateData.reduce((sum, item) => sum + item.potentialArea, 0),
    totalCovered: stateData.reduce((sum, item) => sum + item.areaCovered, 0),
    avgCoverage: Math.round(stateData.reduce((sum, item) => sum + item.coveragePercentage, 0) / stateData.length),
    totalMills: stateData.reduce((sum, item) => sum + (item.processingMills || 0), 0),
    totalCapacity: stateData.reduce((sum, item) => sum + (item.crushingCapacity || 0), 0),
    leadingState: stateData.reduce((max, item) => item.coveragePercentage > max.coveragePercentage ? item : max, { coveragePercentage: 0 }).state
  };

  return (
    <div className="space-y-6">
      {/* Government Header */}
      <div className="bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">State-wise Oil Palm Data</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>STATE ADMINISTRATION</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Manage state-level data including area coverage, processing infrastructure, and pricing
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download size={16} />
                Export Data
              </button>
              <button
                onClick={() => setSelectedState({})}
                className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
              >
                <Edit2 size={16} />
                Add State
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {viewMode === 'table' ? <PieChart size={16} /> : <BarChart3 size={16} />}
                {viewMode === 'table' ? 'Card View' : 'Table View'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Potential Area</div>
          <div className="text-xl font-bold text-gray-800 mt-1">
            {(summaryStats.totalPotential / 1000).toFixed(1)}K ha
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">Area Covered</div>
          <div className="text-xl font-bold text-green-700 mt-1">
            {(summaryStats.totalCovered / 1000).toFixed(1)}K ha
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">Avg Coverage</div>
          <div className="text-xl font-bold text-blue-700 mt-1">
            {summaryStats.avgCoverage}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-600">Processing Mills</div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {summaryStats.totalMills}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600">Crushing Capacity</div>
          <div className="text-xl font-bold text-purple-700 mt-1">
            {summaryStats.totalCapacity} MT/hr
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Leading State</div>
          <div className="text-lg font-bold text-gray-800 mt-1">
            {summaryStats.leadingState}
          </div>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
              <Filter size={16} />
              Filters
            </button>
            <select className="border border-gray-300 rounded-lg py-2 px-3">
              <option>Sort by Coverage</option>
              <option>Sort by Area</option>
              <option>Sort by State</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Display */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredData}
          columns={[
            { key: 'state', label: 'State/UT', sortable: true },
            { 
              key: 'potentialArea', 
              label: 'Potential Area (ha)', 
              sortable: true,
              render: (value) => value?.toLocaleString()
            },
            { 
              key: 'areaCovered', 
              label: 'Covered (ha)', 
              sortable: true,
              render: (value) => value?.toLocaleString()
            },
            { 
              key: 'coveragePercentage', 
              label: 'Coverage %', 
              sortable: true,
              render: (value) => (
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span>{value?.toFixed(1)}%</span>
                </div>
              )
            },
            { 
              key: 'processingMills', 
              label: 'Mills', 
              sortable: true
            },
            { 
              key: 'crushingCapacity', 
              label: 'Capacity', 
              sortable: true,
              render: (value) => value ? `${value} MT/hr` : 'N/A'
            },
            { 
              key: 'OER', 
              label: 'OER', 
              sortable: true,
              render: (value) => value ? `${value}%` : 'N/A'
            },
            { 
              key: 'status', 
              label: 'Status',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                  {value?.toUpperCase()}
                </span>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              )
            }
          ]}
          loading={loading}
          onRowClick={handleEdit}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((state) => (
            <StateCard
              key={state.id}
              state={state}
              onEdit={() => handleEdit(state)}
            />
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {selectedState && (
        <StateDataForm
          data={selectedState}
          schema={stateDataSchema}
          onSave={handleSave}
          onClose={() => setSelectedState(null)}
        />
      )}
    </div>
  );
}

// State Card Component
function StateCard({ state, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#003366] to-[#00509e] text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{state.state}</h3>
          <button
            onClick={onEdit}
            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
        <p className="text-sm opacity-90 mt-1">Oil Palm Implementation</p>
      </div>
      
      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Area Coverage</span>
            <span className="font-medium">{state.coveragePercentage?.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.coveragePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Potential Area</div>
            <div className="font-medium">{(state.potentialArea / 1000).toFixed(1)}K ha</div>
          </div>
          <div>
            <div className="text-gray-500">Covered Area</div>
            <div className="font-medium">{(state.areaCovered / 1000).toFixed(1)}K ha</div>
          </div>
          <div>
            <div className="text-gray-500">Processing Mills</div>
            <div className="font-medium">{state.processingMills || 0}</div>
          </div>
          <div>
            <div className="text-gray-500">OER</div>
            <div className="font-medium">{state.OER ? `${state.OER}%` : 'N/A'}</div>
          </div>
        </div>

        {/* Price Info */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Current Prices</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-blue-600">FFB</div>
              <div className="font-medium">₹{state.currentFFBPrice?.toLocaleString() || 'N/A'}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-xs text-green-600">CPO</div>
              <div className="font-medium">₹{state.currentCPOPrice?.toLocaleString() || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-xs text-gray-500">
          Updated: {new Date(state.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// State Data Form Component
function StateDataForm({ data, schema, onSave, onClose }) {
  const [formData, setFormData] = useState(data || {});
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    schema.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Calculate coverage percentage if both areas are provided
    if (formData.potentialArea && formData.areaCovered && formData.potentialArea > 0) {
      formData.coveragePercentage = parseFloat(((formData.areaCovered / formData.potentialArea) * 100).toFixed(2));
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#003366] to-[#00509e] text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {data.id ? `Edit ${data.state} Data` : 'Add New State Data'}
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schema.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className={`w-full border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366]`}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
                
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Auto-calculated fields preview */}
          {formData.potentialArea && formData.areaCovered && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">Calculated Values</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-600">Coverage Percentage</div>
                  <div className="font-bold">
                    {((formData.areaCovered / formData.potentialArea) * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-blue-600">Remaining Area</div>
                  <div className="font-bold">
                    {(formData.potentialArea - formData.areaCovered).toLocaleString()} ha
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
            >
              {data.id ? 'Update' : 'Save'} State Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}