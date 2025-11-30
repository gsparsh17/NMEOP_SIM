import React from "react";
import {
  diagnosticsDataQuality,
  diagnosticsModelPerf,
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
} from "recharts";

export default function Diagnostics() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">

      {/* Page Title */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-[#2F7F3E] mb-1">
          Data & Model Confidence
        </h2>
        <p className="text-xs text-slate-600">
          Check data completeness and model performance to ensure simulations are reliable.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Data Quality */}
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-2">
            Data Coverage & Reliability
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">
            How complete and stable the historical data is for each key indicator.
          </p>

          <div className="space-y-3">
            {diagnosticsDataQuality.map((row) => (
              <div key={row.series} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-700">{row.series}</span>
                  <span className="text-slate-500">
                    {row.completeness}% complete • {row.revisions} revisions
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2F7F3E]"
                    style={{ width: `${row.completeness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Performance */}
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-2">
            Model Accuracy (MAPE / RMSE)
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">
            Lower error means better forecasting for policy simulations.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosticsModelPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="model" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="mape" name="MAPE (%)" fill="#2F7F3E" />
                <Bar dataKey="rmse" name="RMSE" fill="#F4A300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Download section */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-xs">
        <p className="font-semibold text-slate-700 mb-2">
          Download Datasets & Model Outputs
        </p>
        <div className="flex flex-wrap gap-2">
          <DownloadBtn label="CPO Price Series (CSV)" />
          <DownloadBtn label="Imports Dataset (CSV)" />
          <DownloadBtn label="Scenario Results (CSV)" />
          <DownloadBtn label="Model Accuracy Report (JSON)" dashed />
        </div>
      </div>
    </div>
  );
}

/* Download button reusable */
function DownloadBtn({ label, dashed }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-lg border text-xs ${
        dashed ? "border-dashed" : "border-solid"
      } border-slate-300 hover:bg-slate-50 transition`}
    >
      {label}
    </button>
  );
}
