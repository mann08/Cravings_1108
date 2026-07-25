import React, { useState, useEffect } from "react";
import RestaurantInformation from "./settings/RestaurantInformation";
import RestaurantCoreDetails from "./settings/RestaurantCoreDetails";
import RestaurantPhotos from "./settings/RestaurantPhotos";
import api from "../../config/api.config.js";
import toast from "react-hot-toast";

const RestaurantSetting = () => {
  const Tabs = [
    { id: "information", label: "Information" },
    { id: "coreDetails", label: "Core Details" },
    { id: "photos", label: "Photos" },
  ];
  const [activeTab, setActiveTab] = useState("information");
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/restaurant/get-data");
        if (res.data.data?.[0]) {
          setIsRestaurantOpen(res.data.data[0].isOpen || false);
        }
      } catch (err) {
      }
    };
    fetchStatus();
  }, []);

  const handleToggleOpen = async () => {
    try {
      setLoadingToggle(true);
      const nextState = !isRestaurantOpen;
      const res = await api.patch("/restaurant/status", {
        isOpen: nextState,
      });
      setIsRestaurantOpen(res.data.data?.isOpen ?? nextState);
      toast.success(
        `Restaurant status set to ${nextState ? "OPEN" : "CLOSED"}`,
      );
    } catch (err) {
      toast.error("Failed to update restaurant open status");
    } finally {
      setLoadingToggle(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-(--color-secondary)/50 flex justify-between items-center mb-2 w-full px-1">
        <div className="flex gap-4">
          {Tabs.map((tab) => (
            <div
              key={tab.id}
              className={`py-2 text-xs font-bold uppercase cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "text-(--color-primary) border-b-2 border-(--color-primary)"
                  : "text-(--color-neutral) hover:text-(--color-primary)"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-(--color-base-100) px-3 py-1 rounded-full border border-(--color-secondary)/30 shadow-xs">
          <span className="text-xs font-semibold text-(--color-neutral)">
            Store Status:{" "}
            <span
              className={
                isRestaurantOpen
                  ? "text-emerald-600 font-bold"
                  : "text-rose-600 font-bold"
              }
            >
              {isRestaurantOpen ? "ONLINE (OPEN)" : "OFFLINE (CLOSED)"}
            </span>
          </span>
          <input
            type="checkbox"
            name="isOpen"
            checked={isRestaurantOpen}
            onChange={handleToggleOpen}
            disabled={loadingToggle}
            className="w-4 h-4 accent-(--color-primary) cursor-pointer"
          />
        </div>
      </div>

      <div className="h-full rounded-lg bg-(--color-base-200) p-2 overflow-hidden">
        {activeTab === "information" && <RestaurantInformation />}
        {activeTab === "coreDetails" && <RestaurantCoreDetails />}
        {activeTab === "photos" && <RestaurantPhotos />}
      </div>
    </div>
  );
};

export default RestaurantSetting;
