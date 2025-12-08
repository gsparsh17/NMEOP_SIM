import React from "react";

export default function StatCard({ title, value, icon: Icon, color, trend, loading = false }) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${currentColor.bg} ${currentColor.border} border rounded-lg p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${currentColor.text}`}>
            {loading ? '...' : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${currentColor.bg.replace('50', '100')}`}>
          <Icon className={`w-6 h-6 ${currentColor.text}`} />
        </div>
      </div>
      {trend && (
        <p className="text-xs text-gray-500 mt-3">
          {trend.startsWith('+') ? (
            <span className="text-green-600">↗ {trend}</span>
          ) : trend.startsWith('-') ? (
            <span className="text-red-600">↘ {trend}</span>
          ) : (
            <span>{trend}</span>
          )}
        </p>
      )}
    </div>
  );
}