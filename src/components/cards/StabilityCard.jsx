export default function StabilityCard({ label, value, desc }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-[#CFF3D6]">
      <p className="text-[11px] font-semibold text-slate-700">{label}</p>
      <p className="text-lg font-bold text-[#2F7F3E]">{value}</p>
      <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
    </div>
  );
}
