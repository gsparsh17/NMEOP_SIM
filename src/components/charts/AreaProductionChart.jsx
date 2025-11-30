import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function AreaProductionChart({ data }) {
  return (
    <div className="h-64">
      <h4 className="chart-explainer">
        NMEO-OP targets expansion in cultivation & domestic availability.
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Legend />
          <Line dataKey="area" name="Area (Mn ha)" stroke="#2F7F3E" strokeWidth={2} dot={false} />
          <Line dataKey="production" name="Production (Mn tn)" stroke="#F4A300" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
