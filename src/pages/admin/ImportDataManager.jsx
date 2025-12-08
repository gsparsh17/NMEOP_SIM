import React, { useState } from "react";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  FileSpreadsheet,
  Database
} from "lucide-react";

const importTemplates = [
  { 
    name: "Price Data Template", 
    description: "FFB and CPO prices by state and month",
    format: "CSV/XLSX",
    size: "25KB",
    icon: FileText,
    color: "blue",
    url: "/templates/price-data-template.csv"
  },
  { 
    name: "State Data Template", 
    description: "State-wise area coverage and infrastructure",
    format: "CSV/XLSX",
    size: "32KB",
    icon: Database,
    color: "green",
    url: "/templates/state-data-template.csv"
  },
  { 
    name: "NMEO Targets Template", 
    description: "Mission targets and achievements",
    format: "CSV/XLSX",
    size: "28KB",
    icon: FileSpreadsheet,
    color: "purple",
    url: "/templates/nmeo-targets-template.csv"
  }
];

const importHistory = [
  {
    id: 1,
    filename: "price_data_jan_2024.csv",
    type: "Price Data",
    status: "completed",
    records: 125,
    importedAt: "2024-01-15 14:30",
    user: "Admin User"
  },
  {
    id: 2,
    filename: "state_update_dec_2023.xlsx",
    type: "State Data",
    status: "completed",
    records: 89,
    importedAt: "2024-01-14 11:20",
    user: "Data Editor"
  },
  {
    id: 3,
    filename: "targets_q4_2023.csv",
    type: "NMEO Targets",
    status: "failed",
    records: 0,
    importedAt: "2024-01-13 09:45",
    user: "Admin User",
    error: "Invalid date format in column C"
  },
  {
    id: 4,
    filename: "prices_nov_2023.csv",
    type: "Price Data",
    status: "processing",
    records: 0,
    importedAt: "2024-01-12 16:15",
    user: "System"
  }
];

export default function ImportDataManager() {
  const [activeTab, setActiveTab] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('price');
  const [validationResults, setValidationResults] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file) => {
    setSelectedFile(file);
    
    // Simulate validation
    setTimeout(() => {
      setValidationResults({
        valid: true,
        records: 125,
        errors: 2,
        warnings: 3,
        details: [
          { row: 5, column: 'FFB Price', issue: 'Price below minimum threshold', type: 'warning' },
          { row: 12, column: 'State', issue: 'Invalid state code', type: 'error' }
        ]
      });
    }, 1000);
  };

  const handleUpload = () => {
    setUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      setSelectedFile(null);
      setValidationResults(null);
      alert('File imported successfully! 125 records added.');
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Government Header */}
      <div className="bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Data Import Manager</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>BULK OPERATIONS</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Import and manage large datasets through CSV and Excel file uploads
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'upload' ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Upload Data
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'templates' ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'history' ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Data File</h3>
                <p className="text-gray-600">Select or drag & drop CSV or Excel files</p>
              </div>

              {/* File Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setImportType('price')}
                  className={`p-4 rounded-lg border ${importType === 'price' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <div className="text-blue-600 font-medium">Price Data</div>
                  <div className="text-sm text-gray-600">FFB & CPO prices</div>
                </button>
                <button
                  onClick={() => setImportType('state')}
                  className={`p-4 rounded-lg border ${importType === 'state' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                >
                  <div className="text-green-600 font-medium">State Data</div>
                  <div className="text-sm text-gray-600">Area & infrastructure</div>
                </button>
                <button
                  onClick={() => setImportType('targets')}
                  className={`p-4 rounded-lg border ${importType === 'targets' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}
                >
                  <div className="text-purple-600 font-medium">NMEO Targets</div>
                  <div className="text-sm text-gray-600">Mission targets</div>
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div
                className={`border-2 ${dragActive ? 'border-[#003366] bg-blue-50' : 'border-dashed border-gray-300'} rounded-xl p-8 transition-colors`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="max-w-md mx-auto">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Drop files here or click to browse'}
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Supports CSV, XLSX, XLS files up to 10MB
                  </p>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                    />
                    <div className="px-6 py-2.5 bg-[#003366] text-white rounded-lg inline-block hover:bg-[#002244]">
                      Browse Files
                    </div>
                  </label>
                </div>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="font-medium">{selectedFile.name}</div>
                        <div className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-2 text-gray-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Validation Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{validationResults.records}</div>
                  <div className="text-sm text-green-600">Valid Records</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">{validationResults.errors}</div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-700">{validationResults.warnings}</div>
                  <div className="text-sm text-amber-600">Warnings</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {Math.round((validationResults.records / (validationResults.records + validationResults.errors)) * 100)}%
                  </div>
                  <div className="text-sm text-blue-600">Success Rate</div>
                </div>
              </div>

              {/* Issues List */}
              {validationResults.details.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                    Found {validationResults.details.length} issues
                  </div>
                  <div className="divide-y divide-gray-200">
                    {validationResults.details.map((issue, index) => (
                      <div key={index} className="px-4 py-3 flex items-center gap-3">
                        {issue.type === 'error' ? (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">Row {issue.row}: {issue.column}</div>
                          <div className="text-sm text-gray-600">{issue.issue}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          issue.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {issue.type.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setValidationResults(null);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || validationResults.errors > 0}
                  className="px-6 py-2.5 bg-[#003366] text-white rounded-lg hover:bg-[#002244] disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Importing...
                    </div>
                  ) : (
                    'Import Data'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Download Templates</h3>
            <p className="text-gray-600 mb-6">
              Use these templates to ensure your data is formatted correctly before import
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {importTemplates.map((template, index) => {
                const Icon = template.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        template.color === 'blue' ? 'bg-blue-100' :
                        template.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          template.color === 'blue' ? 'text-blue-600' :
                          template.color === 'green' ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        {template.format}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{template.size}</span>
                      <a
                        href={template.url}
                        download
                        className="text-[#003366] hover:text-[#002244] font-medium flex items-center gap-1"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Template Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Template Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1 ml-5 list-disc">
                <li>Do not modify column headers in the template</li>
                <li>Ensure date formats are consistent (DD/MM/YYYY)</li>
                <li>Use numeric values without currency symbols</li>
                <li>Keep file size under 10MB for optimal performance</li>
                <li>Save files as UTF-8 encoded CSV for best compatibility</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Import History</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imported By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{item.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className={`font-medium ${
                            item.status === 'completed' ? 'text-green-700' :
                            item.status === 'failed' ? 'text-red-700' :
                            'text-blue-700'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.records > 0 ? (
                          <span className="font-medium">{item.records} records</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(item.importedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* History Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Imports</div>
                <div className="text-xl font-bold text-gray-800 mt-1">{importHistory.length}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Successful</div>
                <div className="text-xl font-bold text-green-700 mt-1">
                  {importHistory.filter(i => i.status === 'completed').length}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600">Failed</div>
                <div className="text-xl font-bold text-red-700 mt-1">
                  {importHistory.filter(i => i.status === 'failed').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}