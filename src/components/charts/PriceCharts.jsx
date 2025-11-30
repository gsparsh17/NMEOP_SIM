import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { priceChartData } from "../../data/staticData";

export default function PricesTab() {
  return (
    <div className="flex flex-col gap-6">

      {/* Intl vs Landed */}
      <div className="h-64">
        <h4 className="chart-explainer mb-1">
          VP = minimum assured by Government; FP = price linked to market conditions.
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Line dataKey="intl" name="International Price" stroke="#2F7F3E" strokeWidth={2} dot={false} />
            <Line dataKey="landed" name="Landed Price" stroke="#F4A300" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* FP vs VP vs Realized */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="vp" stroke="#2F7F3E" fill="#2F7F3E" fillOpacity={0.06} />
            <Area type="monotone" dataKey="fp" stroke="#F4A300" fill="#F4A300" fillOpacity={0.12} />
            <Line type="monotone" dataKey="realized" stroke="#1E40AF" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
