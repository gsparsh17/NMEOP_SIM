import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { importsFXData } from "../../data/staticData";

export default function ImportsFXCharts() {
  return (
    <div className="flex flex-col gap-6">

      <div className="h-64">
        <h4 className="chart-explainer">
          Higher duties reduce import volume and foreign exchange spending.
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={importsFXData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Bar dataKey="baselineImports" name="Baseline" fill="#2F7F3E" />
            <Bar dataKey="scenarioImports" name="Scenario" fill="#F4A300" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={importsFXData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Line dataKey="baselineFx" name="Baseline FX" stroke="#2F7F3E" strokeWidth={2} dot={false} />
            <Line dataKey="scenarioFx" name="Scenario FX" stroke="#1E40AF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
