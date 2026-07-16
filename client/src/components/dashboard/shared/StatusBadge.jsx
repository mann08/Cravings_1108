import React from "react";

const STATUS_MAP = {
  pending:        { label: "Pending",          bg: "bg-(--color-warning)/15",  text: "text-(--color-warning)",  dot: "bg-(--color-warning)" },
  accepted:       { label: "Confirmed",         bg: "bg-(--color-info)/15",     text: "text-(--color-info)",     dot: "bg-(--color-info)" },
  preparing:      { label: "Preparing",         bg: "bg-orange-100",            text: "text-orange-600",         dot: "bg-orange-500" },
  ready:          { label: "Ready for Pickup",  bg: "bg-purple-100",            text: "text-purple-700",         dot: "bg-purple-500" },
  pickedUp:       { label: "Picked Up",         bg: "bg-(--color-info)/15",     text: "text-(--color-info)",     dot: "bg-(--color-info)" },
  onTheWay:       { label: "On the Way",        bg: "bg-(--color-info)/15",     text: "text-(--color-info)",     dot: "bg-(--color-info)" },
  outForDelivery: { label: "Out for Delivery",  bg: "bg-(--color-info)/15",     text: "text-(--color-info)",     dot: "bg-(--color-info)" },
  delivered:      { label: "Delivered",         bg: "bg-(--color-success)/15",  text: "text-(--color-success)",  dot: "bg-(--color-success)" },
  cancelled:      { label: "Cancelled",         bg: "bg-(--color-error)/15",    text: "text-(--color-error)",    dot: "bg-(--color-error)" },
  failed:         { label: "Failed",            bg: "bg-(--color-error)/15",    text: "text-(--color-error)",    dot: "bg-(--color-error)" },
  rejected:       { label: "Rejected",          bg: "bg-(--color-error)/15",    text: "text-(--color-error)",    dot: "bg-(--color-error)" },
  undeliverable:  { label: "Undeliverable",     bg: "bg-(--color-error)/15",    text: "text-(--color-error)",    dot: "bg-(--color-error)" },
  active:         { label: "Active",            bg: "bg-(--color-success)/15",  text: "text-(--color-success)",  dot: "bg-(--color-success)" },
  inactive:       { label: "Inactive",          bg: "bg-(--color-secondary)/15",text: "text-(--color-secondary)",dot: "bg-(--color-secondary)" },
  blocked:        { label: "Blocked",           bg: "bg-(--color-error)/15",    text: "text-(--color-error)",    dot: "bg-(--color-error)" },
  verified:       { label: "Verified",          bg: "bg-(--color-success)/15",  text: "text-(--color-success)",  dot: "bg-(--color-success)" },
  suspended:      { label: "Suspended",         bg: "bg-(--color-error)/15",    text: "text-(--color-error)",    dot: "bg-(--color-error)" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
