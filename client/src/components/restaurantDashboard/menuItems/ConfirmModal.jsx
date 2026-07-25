import React from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { LuTrash2, LuStar, LuThumbsUp, LuSparkles } from "react-icons/lu";

const modeConfig = {
  delete: {
    title: "Delete Item",
    icon: <LuTrash2 className="text-red-500 text-3xl" />,
    description: (name) => `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    confirmLabel: "Delete",
    confirmCls: "bg-red-500 hover:bg-red-600 text-white",
  },
  topRated: {
    title: "Toggle Top Rated",
    icon: <LuStar className="text-amber-500 text-3xl" />,
    description: (name, item) =>
      item?.isTopRated
        ? `Remove "${name}" from Top Rated items?`
        : `Mark "${name}" as a Top Rated item?`,
    confirmLabel: (item) => (item?.isTopRated ? "Remove" : "Mark as Top Rated"),
    confirmCls: "bg-(--color-primary) hover:opacity-90 text-white",
  },
  recommended: {
    title: "Toggle Recommended",
    icon: <LuThumbsUp className="text-blue-500 text-3xl" />,
    description: (name, item) =>
      item?.isRecommended
        ? `Remove "${name}" from Recommended items?`
        : `Mark "${name}" as a Recommended item?`,
    confirmLabel: (item) => (item?.isRecommended ? "Remove" : "Mark as Recommended"),
    confirmCls: "bg-(--color-primary) hover:opacity-90 text-white",
  },
  new: {
    title: "Toggle New Item",
    icon: <LuSparkles className="text-emerald-500 text-3xl" />,
    description: (name, item) =>
      item?.isNew
        ? `Remove the "New" badge from "${name}"?`
        : `Mark "${name}" as a New item?`,
    confirmLabel: (item) => (item?.isNew ? "Remove" : "Mark as New"),
    confirmCls: "bg-(--color-primary) hover:opacity-90 text-white",
  },
};

const ConfirmModal = ({ selectedItem, modalMode, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !selectedItem || !modalMode) return null;

  const config = modeConfig[modalMode];
  if (!config) return null;

  const name = selectedItem.itemName;
  const description =
    typeof config.description === "function"
      ? config.description(name, selectedItem)
      : config.description;
  const confirmLabel =
    typeof config.confirmLabel === "function"
      ? config.confirmLabel(selectedItem)
      : config.confirmLabel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-(--color-secondary) pb-3">
          <h1 className="text-lg font-bold text-(--color-primary)">{config.title}</h1>
          <button className="text-red-300 hover:text-red-500 transition-colors" onClick={onClose}>
            <IoMdCloseCircleOutline size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-4 py-2">
          {config.icon}
          <p className="text-center text-sm text-gray-600">{description}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-(--color-secondary) text-(--color-secondary) hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedItem, modalMode);
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${config.confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
