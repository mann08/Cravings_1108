import React from "react";
import { MdDashboard, MdListAlt, MdRestaurantMenu } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

const RestaurantSidebar = ({ activeTab, setActiveTab }) => {

  const tabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard /> },
    { name: "Orders", value: "orders", icon: <MdListAlt /> },
    { name: "Menu", value: "menu", icon: <MdRestaurantMenu /> },
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-1">
        <div className="mb-4 px-2 py-3 bg-(--color-base-300)/40 rounded-lg text-center">
          <p className="text-xs text-(--color-secondary) uppercase tracking-wider font-semibold">Role</p>
          <p className="text-sm font-bold text-(--color-primary) uppercase">Rest. Manager</p>
        </div>
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li
              key={tab.value}
              className={`cursor-pointer p-2.5 rounded text-sm flex items-center gap-3 transition-colors duration-200 ${
                activeTab === tab.value
                  ? "bg-(--color-primary) text-white font-semibold shadow-sm"
                  : "text-(--color-neutral) hover:bg-(--color-base-300) hover:text-(--color-base-content)"
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-(--color-base-300) pt-2">
        <li
          className={`list-none cursor-pointer p-2.5 rounded text-sm flex items-center gap-3 transition-colors duration-200 ${
            activeTab === "settings"
              ? "bg-(--color-primary) text-white font-semibold shadow-sm"
              : "text-(--color-neutral) hover:bg-(--color-base-300) hover:text-(--color-base-content)"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <span className="text-lg"><IoMdSettings /></span>
          <span>Settings</span>
        </li>
      </div>
    </div>
  );
};

export default RestaurantSidebar;
