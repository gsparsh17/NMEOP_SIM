import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function ImportsProdChart({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Legend />
          <Line dataKey="imports" name="Imports (mt)" stroke="#2F7F3E" strokeWidth={2} dot={false} />
          <Line dataKey="production" name="Domestic Production (mt)" stroke="#F4A300" strokeWidth={2} dot={false} />
          <Line dataKey="consumption" name="Consumption (mt)" stroke="#1E40AF" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
