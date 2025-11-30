import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2F7F3E", "#F4A300", "#1E40AF", "#6B7280"];

export default function ImportShareDonut({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
