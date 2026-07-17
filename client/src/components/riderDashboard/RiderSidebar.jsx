import React from "react";
import { MdDashboard, MdOutlinePlaylistPlay, MdOutlineLocationOn, MdPayment, MdOutlineStarBorder, MdNotificationsNone, MdOutlineLock } from "react-icons/md";
import { FaHistory, FaSignOutAlt } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../config/api.config";

const RiderSidebar = ({ activeTab, setActiveTab }) => {
  const { setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await api.get("/auth/logout");
      toast.success(res.data.message);
      sessionStorage.removeItem("cravingUser");
      setUser(null);
      setIsLogin(false);
      setRole(null);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const tabs = [
    { name: "Dashboard", value: "overview", icon: <MdDashboard /> },
    { name: "Available Orders", value: "available", icon: <MdOutlinePlaylistPlay /> },
    { name: "Current Delivery", value: "currentDelivery", icon: <MdOutlineLocationOn /> },
    { name: "Delivery History", value: "history", icon: <FaHistory /> },
    { name: "Earnings", value: "earnings", icon: <MdPayment /> },
    { name: "Ratings", value: "ratings", icon: <MdOutlineStarBorder /> },
    { name: "Notifications", value: "notifications", icon: <MdNotificationsNone /> },
    { name: "Profile Settings", value: "settings", icon: <IoSettingsOutline /> },
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="overflow-y-auto pr-1 flex-1 space-y-1">
        <div className="mb-4 px-2 py-3 bg-(--color-base-300)/40 rounded-lg text-center">
          <p className="text-xs text-(--color-secondary) uppercase tracking-wider font-semibold">Role</p>
          <p className="text-sm font-bold text-(--color-primary) uppercase font-mono">Delivery Exec</p>
        </div>
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li
              key={tab.value}
              className={`cursor-pointer p-2 rounded text-sm flex items-center gap-3 transition-colors duration-200 ${
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-2 rounded text-sm text-(--color-error) hover:bg-(--color-error)/15 font-semibold transition-colors duration-200"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default RiderSidebar;
