import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { fiscalImpactData } from "../../data/staticData";

export default function FiscalImpactChart() {
  return (
    <div className="h-72">
      <h4 className="chart-explainer">
        Govt absorbs the gap as VGP subsidy when FP {"<"} VP.
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={fiscalImpactData} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="actor" stroke="#64748b" />
          <YAxis stroke="#64748b" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
          <Legend />
          <Bar dataKey="baseline" name="Baseline" fill="#2F7F3E" stackId="a" />
          <Bar dataKey="scenario" name="Scenario" fill="#F4A300" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
