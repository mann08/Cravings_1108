import React from "react";

const ConfirmModal = ({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, danger = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-(--color-base-content) mb-2">{title}</h3>
        {message && <p className="text-sm text-(--color-secondary) mb-6">{message}</p>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) hover:bg-(--color-base-200) transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-sm text-white font-semibold transition-colors ${
              danger
                ? "bg-(--color-error) hover:bg-red-700"
                : "bg-(--color-primary) hover:bg-orange-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
