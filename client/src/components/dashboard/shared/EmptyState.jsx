import React from "react";

const EmptyState = ({ icon, title = "Nothing here yet", message, action }) => (
  <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-center">
    {icon && <div className="text-5xl text-(--color-base-300) mb-2">{icon}</div>}
    <h3 className="text-lg font-semibold text-(--color-neutral)">{title}</h3>
    {message && <p className="text-sm text-(--color-secondary) max-w-xs">{message}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md text-sm hover:bg-orange-700 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
