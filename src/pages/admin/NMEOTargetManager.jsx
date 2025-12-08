import React, { useState, useEffect } from "react";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  MapPin,
  BarChart3,
  FileText,
  Download,
  Edit2,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const targetSchema = {
  fields: [
    { name: 'state', label: 'State/UT', type: 'select', required: true, 
      options: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha', 'Kerala', 'Gujarat', 'Chhattisgarh', 'Goa'] },
    { name: 'year', label: 'Year', type: 'select', required: true, 
      options: ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'] },
    { name: 'areaTarget', label: 'Area Target (ha)', type: 'number', required: true },
    { name: 'areaAchieved', label: 'Area Achieved (ha)', type: 'number', required: true },
    { name: 'productionTarget', label: 'Production Target (MT)', type: 'number' },
    { name: 'productionAchieved', label: 'Production Achieved (MT)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', 
      options: ['On Track', 'Behind Schedule', 'Completed', 'Not Started'] },
    { name: 'notes', label: 'Notes', type: 'textarea' }
  ]
};

export default function NMEOTargetManager() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [viewType, setViewType] = useState('table'); // 'table' or 'chart'
  const [filterYear, setFilterYear] = useState('all');
  const [filterState, setFilterState] = useState('all');

  useEffect(() => {
    loadTargetData();
  }, []);

  const loadTargetData = () => {
    setLoading(true);
    setTimeout(() => {
      const sampleData = [
        {
          id: 1,
          state: "Andhra Pradesh",
          year: "2024-25",
          areaTarget: 25000,
          areaAchieved: 22000,
          productionTarget: 120000,
          productionAchieved: 108000,
          status: "On Track",
          progress: 88,
          notes: "Leading state in NMEO-OP implementation",
          lastUpdated: "2024-01-15"
        },
        {
          id: 2,
          state: "Telangana",
          year: "2024-25",
          areaTarget: 29300,
          areaAchieved: 18500,
          productionTarget: 85000,
          productionAchieved: 62000,
          status: "Behind Schedule",
          progress: 63,
          notes: "Focus on Bhadradri Kothagudem district",
          lastUpdated: "2024-01-14"
        },
        {
          id: 3,
          state: "Karnataka",
          year: "2024-25",
          areaTarget: 5000,
          areaAchieved: 4200,
          productionTarget: 35000,
          productionAchieved: 31000,
          status: "On Track",
          progress: 84,
          notes: "Good progress in Mysore region",
          lastUpdated: "2024-01-13"
        },
        {
          id: 4,
          state: "Tamil Nadu",
          year: "2024-25",
          areaTarget: 5000,
          areaAchieved: 3200,
          productionTarget: 28000,
          productionAchieved: 19000,
          status: "Behind Schedule",
          progress: 64,
          notes: "Need more farmer awareness programs",
          lastUpdated: "2024-01-12"
        },
        {
          id: 5,
          state: "Odisha",
          year: "2024-25",
          areaTarget: 2500,
          areaAchieved: 2100,
          productionTarget: 15000,
          productionAchieved: 12500,
          status: "On Track",
          progress: 84,
          notes: "Steady progress in coastal districts",
          lastUpdated: "2024-01-11"
        }
      ];
      setTargets(sampleData);
      setLoading(false);
    }, 1500);
  };

  const filteredTargets = targets.filter(target => {
    const matchesYear = filterYear === 'all' || target.year === filterYear;
    const matchesState = filterState === 'all' || target.state === filterState;
    return matchesYear && matchesState;
  });

  const handleSave = (updatedData) => {
    if (selectedTarget?.id) {
      // Update existing
      const progress = Math.round((updatedData.areaAchieved / updatedData.areaTarget) * 100);
      const status = progress >= 90 ? 'Completed' : 
                     progress >= 70 ? 'On Track' : 'Behind Schedule';
      
      setTargets(prev => prev.map(item =>
        item.id === selectedTarget.id ? { 
          ...item, 
          ...updatedData, 
          progress,
          status,
          lastUpdated: new Date().toISOString().split('T')[0]
        } : item
      ));
    } else {
      // Add new
      const progress = Math.round((updatedData.areaAchieved / updatedData.areaTarget) * 100);
      const status = progress >= 90 ? 'Completed' : 
                     progress >= 70 ? 'On Track' : 'Behind Schedule';
      
      setTargets(prev => [...prev, { 
        id: Date.now(), 
        ...updatedData, 
        progress,
        status,
        lastUpdated: new Date().toISOString().split('T')[0]
      }]);
    }
    setSelectedTarget(null);
  };

  const summaryStats = {
    totalTargets: targets.length,
    totalAreaTarget: targets.reduce((sum, t) => sum + t.areaTarget, 0),
    totalAreaAchieved: targets.reduce((sum, t) => sum + t.areaAchieved, 0),
    overallProgress: Math.round((targets.reduce((sum, t) => sum + t.areaAchieved, 0) / 
                                targets.reduce((sum, t) => sum + t.areaTarget, 0)) * 100),
    onTrack: targets.filter(t => t.status === 'On Track' || t.status === 'Completed').length,
    behindSchedule: targets.filter(t => t.status === 'Behind Schedule').length
  };

  return (
    <div className="space-y-6">
      {/* Government Header */}
      <div className="bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">NMEO-OP Mission Targets Management</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>MISSION TRACKING</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Monitor and manage National Mission on Edible Oils - Oil Palm targets and achievements
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download size={16} />
                Export Report
              </button>
              <button
                onClick={() => setSelectedTarget({})}
                className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
              >
                <Plus size={16} />
                Add Target
              </button>
              <button
                onClick={() => setViewType(viewType === 'table' ? 'chart' : 'table')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {viewType === 'table' ? <BarChart3 size={16} /> : <FileText size={16} />}
                {viewType === 'table' ? 'Chart View' : 'Table View'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#003366]">{summaryStats.totalTargets}</div>
            <div className="text-sm text-gray-600 mt-1">Active Targets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {(summaryStats.totalAreaTarget / 1000).toFixed(1)}K ha
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Area Target</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {(summaryStats.totalAreaAchieved / 1000).toFixed(1)}K ha
            </div>
            <div className="text-sm text-gray-600 mt-1">Area Achieved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">
              {summaryStats.overallProgress}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">{summaryStats.onTrack}</div>
              <div className="text-sm text-green-800 mt-1">On Track/Completed</div>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <div className="mt-4 text-sm text-green-700">
            Meeting or exceeding NMEO-OP mission expectations
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-700">{summaryStats.behindSchedule}</div>
              <div className="text-sm text-amber-800 mt-1">Behind Schedule</div>
            </div>
            <AlertCircle className="w-12 h-12 text-amber-400" />
          </div>
          <div className="mt-4 text-sm text-amber-700">
            Need intervention and additional support
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">2025-26</div>
              <div className="text-sm text-blue-800 mt-1">Mission Deadline</div>
            </div>
            <Calendar className="w-12 h-12 text-blue-400" />
          </div>
          <div className="mt-4 text-sm text-blue-700">
            Target: 10 lakh ha area coverage
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              <option value="all">All Years</option>
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by State</label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              <option value="all">All States</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterYear('all');
                setFilterState('all');
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Display */}
      {viewType === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Target (ha)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Achieved (ha)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTargets.map((target) => (
                  <tr key={target.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{target.state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{target.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{target.areaTarget.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{target.areaAchieved.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              target.progress >= 90 ? 'bg-green-500' :
                              target.progress >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${target.progress}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{target.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        target.status === 'On Track' ? 'bg-green-100 text-green-800' :
                        target.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {target.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTarget(target)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTargets.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onEdit={() => setSelectedTarget(target)}
            />
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {selectedTarget && (
        <TargetForm
          data={selectedTarget}
          schema={targetSchema}
          onSave={handleSave}
          onClose={() => setSelectedTarget(null)}
        />
      )}
    </div>
  );
}

// Target Card Component
function TargetCard({ target, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className={`p-4 text-white ${
        target.status === 'Completed' ? 'bg-green-600' :
        target.status === 'On Track' ? 'bg-blue-600' : 'bg-amber-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{target.state}</h3>
            <p className="text-sm opacity-90">{target.year} Targets</p>
          </div>
          <button
            onClick={onEdit}
            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Progress Circle */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={target.progress >= 90 ? '#10b981' : target.progress >= 70 ? '#3b82f6' : '#f59e0b'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${target.progress * 2.513} 251.3`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{target.progress}%</div>
                <div className="text-xs text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-600">Area Target</div>
              <div className="font-medium">{(target.areaTarget / 1000).toFixed(1)}K ha</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-xs text-green-600">Achieved</div>
              <div className="font-medium">{(target.areaAchieved / 1000).toFixed(1)}K ha</div>
            </div>
          </div>

          {target.productionTarget && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-xs text-blue-600">Production Target</div>
                <div className="font-medium">{(target.productionTarget / 1000).toFixed(1)}K MT</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-xs text-purple-600">Achieved</div>
                <div className="font-medium">{(target.productionAchieved / 1000).toFixed(1)}K MT</div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">Status: <span className="font-medium">{target.status}</span></div>
            {target.notes && (
              <div className="text-xs text-gray-600 mt-1">{target.notes}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Target Form Component
function TargetForm({ data, schema, onSave, onClose }) {
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

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#003366] to-[#00509e] text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {data.id ? 'Edit NMEO-OP Target' : 'Add New NMEO-OP Target'}
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schema.fields.map((field) => (
              <div key={field.name} className={field.name === 'notes' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3`}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={3}
                    className={`w-full border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Progress Preview */}
          {formData.areaTarget && formData.areaAchieved && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">Progress Preview</div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Achievement Rate</span>
                    <span className="font-medium">
                      {Math.round((formData.areaAchieved / formData.areaTarget) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(formData.areaAchieved / formData.areaTarget) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-600">Gap</div>
                  <div className="font-medium">
                    {(formData.areaTarget - formData.areaAchieved).toLocaleString()} ha
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
              {data.id ? 'Update' : 'Save'} Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}