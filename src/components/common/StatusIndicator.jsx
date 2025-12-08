import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

export default function StatusIndicator({ title, status, message, lastChecked }) {
  const getStatusConfig = (status) => {
    switch(status.toLowerCase()) {
      case 'online':
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-200'
        };
      case 'warning':
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          bg: 'bg-amber-100',
          border: 'border-amber-200'
        };
      case 'offline':
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          border: 'border-red-200'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          border: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 p-3 ${config.bg} ${config.border} border rounded-lg`}>
      <div className={`p-2 rounded-full ${config.bg}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-800">{title}</h4>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color} ${config.bg}`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
        {lastChecked && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Clock size={12} />
            Last checked: {lastChecked}
          </p>
        )}
      </div>
    </div>
  );
}