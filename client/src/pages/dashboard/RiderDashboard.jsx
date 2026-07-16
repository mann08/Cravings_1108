import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RiderSetting from "../../components/riderDashboard/RiderSettings";
import RiderSidebar from "../../components/riderDashboard/RiderSidebar";
import RiderOverview from "../../components/riderDashboard/RiderOverview";
import RiderOrders from "../../components/riderDashboard/RiderOrders";
import RiderCurrentDelivery from "../../components/riderDashboard/RiderCurrentDelivery";
import RiderHistory from "../../components/riderDashboard/RiderHistory";
import RiderEarnings from "../../components/riderDashboard/RiderEarnings";
import { FaStar, FaBell } from "react-icons/fa";

const RiderDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");

  if (!isLogin || role !== "rider") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')] bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as a Rider to view this page.
          </h1>
          <button
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <RiderOverview setActiveTab={setActiveTab} />;
      case "available":
        return <RiderOrders />;
      case "currentDelivery":
        return <RiderCurrentDelivery />;
      case "history":
        return <RiderHistory />;
      case "earnings":
        return <RiderEarnings />;
      case "ratings":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">My Ratings</h2>
            <div className="bg-white p-6 rounded-xl border border-(--color-base-300) shadow-sm text-center max-w-sm">
              <FaStar className="text-5xl text-(--color-warning) mx-auto mb-2" />
              <h3 className="text-lg font-bold">5.0 / 5.0 Rating</h3>
              <p className="text-xs text-(--color-secondary) mt-1">Customers appreciate your friendly service and on-time deliveries.</p>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">Delivery Alerts</h2>
            <div className="bg-white p-4 rounded-xl border border-(--color-base-300) flex gap-3 items-start">
              <FaBell className="text-(--color-primary) text-lg shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">New Orders Available</p>
                <p className="text-xs text-(--color-secondary) mt-0.5">Please check the available tab to accept new deliveries.</p>
              </div>
            </div>
          </div>
        );
      case "settings":
        return <RiderSetting />;
      default:
        return <RiderOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-[91vh] flex flex-col md:flex-row gap-4 p-4 bg-(--color-base-100)">
      {/* Sidebar Panel */}
      <div className="w-full md:w-1/4 lg:w-1/5 bg-(--color-base-200) p-4 rounded-xl shadow-md border border-(--color-base-300)">
        <RiderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 bg-(--color-base-100) p-2 rounded-xl h-full min-h-[75vh]">
        {renderContent()}
      </div>
    </div>
  );
};

export default RiderDashboard;
