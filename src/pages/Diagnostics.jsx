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
    <div className="max-w-7xl mx-auto px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Control Room</h2>
        <p className="text-gray-600 mt-2">
          Monitor data quality, model performance, and system health for evidence-based policy decisions
        </p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Data Sources Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-8 bg-[#1e5c2a] rounded"></div>
          <h3 className="text-lg font-semibold text-gray-800">Integrated Data Sources</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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

        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> In production implementation, each data feed would be connected via secure APIs 
            with automated quality checks and alerting for data gaps or anomalies.
          </p>
        </div>
      </div>

      {/* Data Quality & Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Data Quality */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-6 bg-[#1e5c2a] rounded"></div>
            <h3 className="font-semibold text-gray-800">Data Quality Metrics</h3>
          </div>
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

        {/* Model Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-6 bg-[#1e5c2a] rounded"></div>
            <h3 className="font-semibold text-gray-800">Forecast Model Performance</h3>
          </div>
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

      {/* Model Accuracy Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-6 bg-[#1e5c2a] rounded"></div>
          <h3 className="font-semibold text-gray-800">Model Accuracy Trends</h3>
        </div>
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

      {/* Data Export & Admin Tools */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-6 bg-[#1e5c2a] rounded"></div>
          <h3 className="font-semibold text-gray-800">Data Export & Analysis Tools</h3>
        </div>
        
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
          
          <div className="lg:w-64">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 text-sm mb-3">Admin Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-gray-700 hover:bg-white hover:text-[#1e5c2a] p-2 rounded transition-colors">
                  Retrain All Models
                </button>
                <button className="w-full text-left text-sm text-gray-700 hover:bg-white hover:text-[#1e5c2a] p-2 rounded transition-colors">
                  Run Data Quality Audit
                </button>
                <button className="w-full text-left text-sm text-gray-700 hover:bg-white hover:text-[#1e5c2a] p-2 rounded transition-colors">
                  Update Model Parameters
                </button>
                <button className="w-full text-left text-sm text-gray-700 hover:bg-white hover:text-[#1e5c2a] p-2 rounded transition-colors">
                  System Health Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Note */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">ℹ</div>
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Access Control & Governance</p>
            <p className="text-xs text-amber-700">
              This control room is typically restricted to technical users and economists. All model updates 
              and data pipeline changes require approval through established governance protocols before 
              being used for policy recommendations.
            </p>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
      <div className="flex justify-center mb-2">
        <div className={`w-3 h-3 ${statusColor} rounded-full`}></div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

function DataSource({ name, sources, frequency, status }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-[#1e5c2a] transition-colors">
      <div className="font-medium text-gray-800 text-sm mb-2">{name}</div>
      <div className="text-xs text-gray-600 mb-2">
        <strong>Sources:</strong> {sources.join(", ")}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">{frequency}</span>
        <span className={`px-2 py-1 rounded-full ${
          status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function DataQualityRow({ series, completeness, revisions }) {
  const qualityColor = completeness >= 95 ? "bg-green-500" :
                      completeness >= 85 ? "bg-amber-500" : "bg-red-500";
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-gray-700 text-sm">{series}</span>
        <span className="text-xs text-gray-500">{completeness}% complete • {revisions} revisions</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${qualityColor} transition-all duration-300`}
          style={{ width: `${completeness}%` }}
        ></div>
      </div>
    </div>
  );
}

function DownloadButton({ label, type = "primary" }) {
  const baseClasses = "w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors";
  const primaryClasses = "border-[#1e5c2a] bg-[#1e5c2a] text-white hover:bg-[#164523]";
  const secondaryClasses = "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400";
  
  return (
    <button className={`${baseClasses} ${type === "primary" ? primaryClasses : secondaryClasses}`}>
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