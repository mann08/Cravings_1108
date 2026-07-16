import React from "react";

const StatCard = ({ icon, label, value, sub, color = "primary", trend }) => {
  const colorMap = {
    primary: "text-(--color-primary) bg-(--color-primary)/10",
    success: "text-(--color-success) bg-(--color-success)/10",
    warning: "text-(--color-warning) bg-(--color-warning)/10",
    error: "text-(--color-error) bg-(--color-error)/10",
    info: "text-(--color-info) bg-(--color-info)/10",
    accent: "text-(--color-accent) bg-(--color-accent)/10",
  };

  return (
    <div className="bg-(--color-base-100) border border-(--color-base-300) rounded-lg p-4 shadow-md flex items-start gap-4">
      {icon && (
        <div className={`p-3 rounded-lg text-xl ${colorMap[color] || colorMap.primary}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-(--color-secondary) uppercase tracking-wide font-medium truncate">
          {label}
        </p>
        <p className="text-2xl font-bold text-(--color-base-content) mt-0.5">{value ?? "—"}</p>
        {sub && <p className="text-xs text-(--color-secondary) mt-1">{sub}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? "text-(--color-success)" : "text-(--color-error)"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
