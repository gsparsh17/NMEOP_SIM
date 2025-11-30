export default function KpiCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
      <p className="text-lg font-semibold text-[#2F7F3E]">{value}</p>
      <p className="text-[11px] text-slate-500">{subtitle}</p>
    </div>
  );
}
