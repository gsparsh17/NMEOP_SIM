import React from "react";
import {
  diagnosticsDataQuality,
  diagnosticsModelPerf,
  liveMarket,
} from "../data/staticData";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function Diagnostics() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header - Blue Header */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Data Control Room</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>TECHNICAL DASHBOARD</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Monitor data quality, model performance, and system health for evidence-based policy decisions
              </p>
              
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                <img 
                  src="/assets/ut.png" 
                  alt="Ministry Logo" 
                  className="w-6 h-6"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Technical Monitoring & Diagnostics</span>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="text-gray-600">Ministry of Agriculture</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Overview - Plain Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h3 className="text-lg font-bold text-gray-800">System Status Overview</h3>
          <p className="text-sm text-gray-600">Real-time monitoring of key system components</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatusCard 
              title="Data Feeds" 
              value="12/14" 
              status="operational"
              description="Active data connections"
            />
            <StatusCard 
              title="Model Accuracy" 
              value="94.2%" 
              status="good"
              description="Average forecast precision"
            />
            <StatusCard 
              title="Last Update" 
              value="2 hours ago" 
              status="operational"
              description="Data refresh cycle"
            />
            <StatusCard 
              title="System Load" 
              value="32%" 
              status="good"
              description="Current capacity usage"
            />
          </div>
        </div>
      </div>

      {/* Data Sources Panel - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Integrated Data Sources</h3>
              <p className="text-sm opacity-90">Real-time & periodic data feeds for policy modeling</p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded text-sm">
              DATA PIPELINE STATUS
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataSource 
              name="Global CPO Prices"
              sources={["Bursa Malaysia", "MCX", "FAO Indices"]}
              frequency="Real-time"
              status="Active"
            />
            <DataSource 
              name="Import Statistics"
              sources={["DGFT", "Customs Data"]}
              frequency="Daily"
              status="Active"
            />
            <DataSource 
              name="Domestic Prices"
              sources={["CPI/WPI", "Retail Market"]}
              frequency="Weekly"
              status="Active"
            />
            <DataSource 
              name="Production Data"
              sources={["NMEO-OP", "State Horticulture"]}
              frequency="Monthly"
              status="Active"
            />
            <DataSource 
              name="Weather Data"
              sources={["IMD", "Agro-climatic"]}
              frequency="Daily"
              status="Active"
            />
            <DataSource 
              name="Tariff History"
              sources={["CBIC", "Notification Archive"]}
              frequency="On-change"
              status="Active"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">ℹ</div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Implementation Note</p>
                <p className="text-xs text-blue-700">
                  In production implementation, each data feed would be connected via secure APIs 
                  with automated quality checks and alerting for data gaps or anomalies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality & Model Performance - Plain Header for Data Quality, Blue for Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Data Quality - Plain Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 bg-[#1e5c2a] rounded"></div>
                <h3 className="font-bold text-gray-800">Data Quality Metrics</h3>
              </div>
              <div className="text-sm text-gray-600">Compliance Standards</div>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              High completeness and low revision counts ensure reliable policy simulations
            </p>

            <div className="space-y-4">
              {diagnosticsDataQuality.map((row) => (
                <DataQualityRow 
                  key={row.series}
                  series={row.series}
                  completeness={row.completeness}
                  revisions={row.revisions}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Model Performance - Blue Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <h3 className="font-bold">Forecast Model Performance</h3>
            </div>
            <p className="text-sm opacity-90">Error metrics across prediction models</p>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Lower error rates (MAPE, RMSE) indicate more accurate policy impact predictions
            </p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnosticsModelPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="model" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mape" name="Mean Absolute % Error" fill="#1e5c2a" />
                  <Bar dataKey="rmse" name="Root Mean Square Error" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Model Accuracy Trends - Blue Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Model Accuracy Trends</h3>
              <p className="text-sm opacity-90">Continuous improvement tracking</p>
            </div>
            <div className="bg-white/20 px-2 py-1 rounded text-xs">
              6-MONTH TREND
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Tracking model performance improvements over time through continuous retraining
          </p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={modelTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpoPriceAccuracy" 
                  name="CPO Price Forecast Accuracy" 
                  stroke="#1e5c2a" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="importDemandAccuracy" 
                  name="Import Demand Accuracy" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Export & Admin Tools - Plain Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-[#1e5c2a] rounded"></div>
              <h3 className="font-bold text-gray-800">Data Export & Analysis Tools</h3>
            </div>
            <div className="text-sm text-gray-600">Technical Utilities</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Download cleaned datasets and simulation outputs for detailed analysis and reporting
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DownloadButton label="CPO Price Series (CSV)" type="primary" />
                <DownloadButton label="Import Volumes Dataset (CSV)" type="primary" />
                <DownloadButton label="Scenario Simulation Outputs (CSV)" type="primary" />
                <DownloadButton label="Model Performance Metrics (JSON)" type="secondary" />
                <DownloadButton label="Policy Recommendation History (PDF)" type="secondary" />
                <DownloadButton label="Full Data Archive (ZIP)" type="secondary" />
              </div>
            </div>
            
            {/* Admin Tools - Blue Header within Plain Header section */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
                  <h4 className="font-bold text-sm">Admin Actions</h4>
                  <p className="text-xs opacity-90">Restricted technical operations</p>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 p-2 rounded transition-colors border border-transparent hover:border-blue-200">
                      Retrain All Models
                    </button>
                    <button className="w-full text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 p-2 rounded transition-colors border border-transparent hover:border-blue-200">
                      Run Data Quality Audit
                    </button>
                    <button className="w-full text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 p-2 rounded transition-colors border border-transparent hover:border-blue-200">
                      Update Model Parameters
                    </button>
                    <button className="w-full text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 p-2 rounded transition-colors border border-transparent hover:border-blue-200">
                      System Health Check
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Note - Blue Header */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <h4 className="font-bold">Access Control & Governance</h4>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">ℹ</div>
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Restricted Access Notice</p>
              <p className="text-xs text-amber-700">
                This control room is typically restricted to technical users and economists. All model updates 
                and data pipeline changes require approval through established governance protocols before 
                being used for policy recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatusCard({ title, value, status, description }) {
  const statusColor = status === "good" ? "bg-green-500" : 
                     status === "operational" ? "bg-blue-500" : 
                     status === "warning" ? "bg-amber-500" : "bg-red-500";
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
      <div className="flex justify-center mb-3">
        <div className={`w-4 h-4 ${statusColor} rounded-full animate-pulse`}></div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-2">{value}</div>
      <div className="text-sm font-bold text-gray-700 mb-2">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

function DataSource({ name, sources, frequency, status }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#0072bc] hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="font-bold text-gray-800 text-sm">{name}</div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          status === "Active" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {status}
        </span>
      </div>
      <div className="text-xs text-gray-600 mb-2">
        <span className="font-medium">Sources:</span> {sources.join(", ")}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded">{frequency}</span>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
}

function DataQualityRow({ series, completeness, revisions }) {
  const qualityColor = completeness >= 95 ? "bg-green-500" :
                      completeness >= 85 ? "bg-amber-500" : "bg-red-500";
  
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-700 text-sm">{series}</span>
        <span className="text-xs text-gray-500">{revisions} revisions</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${qualityColor} transition-all duration-300`}
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded ${
          completeness >= 95 ? "bg-green-100 text-green-800" :
          completeness >= 85 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
        }`}>
          {completeness}%
        </div>
      </div>
    </div>
  );
}

function DownloadButton({ label, type = "primary" }) {
  const baseClasses = "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors flex items-center gap-2";
  const primaryClasses = "border-[#1e5c2a] bg-[#1e5c2a] text-white hover:bg-[#164523] hover:border-[#164523]";
  const secondaryClasses = "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400";
  
  return (
    <button className={`${baseClasses} ${type === "primary" ? primaryClasses : secondaryClasses}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </button>
  );
}

// Sample trend data
const modelTrendData = [
  { month: 'Jan', cpoPriceAccuracy: 88, importDemandAccuracy: 82 },
  { month: 'Feb', cpoPriceAccuracy: 89, importDemandAccuracy: 84 },
  { month: 'Mar', cpoPriceAccuracy: 91, importDemandAccuracy: 85 },
  { month: 'Apr', cpoPriceAccuracy: 92, importDemandAccuracy: 87 },
  { month: 'May', cpoPriceAccuracy: 94, importDemandAccuracy: 89 },
  { month: 'Jun', cpoPriceAccuracy: 95, importDemandAccuracy: 91 },
];