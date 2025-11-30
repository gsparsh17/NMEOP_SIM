import {
  AreaChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function VPFPVGPChart({ data }) {
  return (
    <div className="h-64">
      <h4 className="chart-explainer">
        VP protects farmer income; VGP fills the gap when FP falls.
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Legend />
          <Area dataKey="vp" name="VP (Govt assured)" stroke="#2F7F3E" fillOpacity={0.06} fill="#2F7F3E" />
          <Area dataKey="fp" name="FP (Market price)" stroke="#F4A300" fillOpacity={0.12} fill="#F4A300" />
          <Bar dataKey="vgp" name="VGP Subsidy" fill="#1E40AF" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
