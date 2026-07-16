import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatCard from "../dashboard/shared/StatCard";
import StatusBadge from "../dashboard/shared/StatusBadge";
import { FaCheckCircle, FaWallet, FaStar, FaToggleOn, FaToggleOff, FaBox } from "react-icons/fa";

const RiderOverview = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rider/dashboard");
      setData(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleOnline = async () => {
    try {
      const res = await api.patch("/rider/availability");
      toast.success(res.data.message);
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  if (loading) return <LoadingSpinner message="Loading delivery stats..." />;

  const { riderProfile, todayDeliveries, todayEarnings, currentDelivery } = data || {};

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      {/* Availability Card */}
      <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-(--color-base-content)">Working Status</h3>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            {riderProfile?.isAvailable ? "Online - Ready to receive orders" : "Offline - Taking a break"}
          </p>
        </div>
        <button
          onClick={handleToggleOnline}
          className={`text-3xl transition-transform active:scale-95 ${
            riderProfile?.isAvailable ? "text-(--color-success)" : "text-gray-400"
          }`}
        >
          {riderProfile?.isAvailable ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FaBox />} label="Today's Deliveries" value={todayDeliveries || 0} color="primary" />
        <StatCard icon={<FaWallet />} label="Today's Earnings" value={`₹${todayEarnings || 0}`} color="success" />
        <StatCard icon={<FaCheckCircle />} label="Total Deliveries" value={riderProfile?.totalDeliveries || 0} color="info" />
        <StatCard icon={<FaStar />} label="Avg Rating" value={`⭐ ${riderProfile?.averageRating || 0}`} color="warning" />
      </div>

      {/* Active Current Delivery Card Banner */}
      {currentDelivery ? (
        <div className="bg-orange-50 border border-(--color-primary)/30 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="bg-(--color-primary)/10 text-(--color-primary) font-bold text-xxs px-2 py-0.5 rounded-full">
                Active Job
              </span>
              <h4 className="font-bold text-base mt-2">
                Pickup from {currentDelivery.restaurantId?.restaurantName}
              </h4>
              <p className="text-xs text-(--color-secondary) mt-0.5">Order ID: {currentDelivery._id}</p>
            </div>
            <StatusBadge status={currentDelivery.orderStatus} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("currentDelivery")}
              className="bg-(--color-primary) text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
            >
              Update Status / Track Location
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) text-center py-12">
          <p className="text-sm text-(--color-neutral) font-semibold">No active deliveries</p>
          <p className="text-xs text-(--color-secondary) mt-1">Go online and visit "Available Orders" to accept requests.</p>
        </div>
      )}
    </div>
  );
};

export default RiderOverview;
