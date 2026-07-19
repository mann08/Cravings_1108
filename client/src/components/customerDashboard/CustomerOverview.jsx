import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatCard from "../dashboard/shared/StatCard";
import StatusBadge from "../dashboard/shared/StatusBadge";
import { FaShoppingBag, FaCheckCircle, FaTimesCircle, FaWallet, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";

const CustomerOverview = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/customer/dashboard");
        setData(res.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading customer dashboard..." />;

  const { stats, activeOrder, recentOrders, savedAddressCount } = data || {};

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      {/* Welcome Card */}
      <div className="bg-(--color-base-200) rounded-xl p-6 shadow-md flex items-center justify-between border border-(--color-base-300)">
        <div className="flex items-center gap-4">
          <img
            src={user?.photo?.url || "https://placehold.co/150?text=User"}
            alt={user?.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-(--color-primary)"
          />
          <div>
            <h2 className="text-xl font-bold text-(--color-base-content)">Welcome back, {user?.fullName}!</h2>
            <p className="text-sm text-(--color-secondary)">Ready to order some delicious food today?</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("orders")}
          className="bg-(--color-primary) text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm shadow"
        >
          View My Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaShoppingBag />}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          color="primary"
        />
        <StatCard
          icon={<FaCheckCircle />}
          label="Delivered"
          value={stats?.deliveredOrders || 0}
          color="success"
        />
        <StatCard
          icon={<FaTimesCircle />}
          label="Cancelled"
          value={stats?.cancelledOrders || 0}
          color="error"
        />
        <StatCard
          icon={<FaWallet />}
          label="Total Spent"
          value={`₹${stats?.totalSpent || 0}`}
          color="accent"
        />
      </div>

      {/* Active Order Banner / Tracker */}
      {activeOrder && (
        <div className="bg-orange-50 border border-(--color-primary)/30 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl text-(--color-primary) mt-1">🚚</span>
            <div>
              <h3 className="font-bold text-base text-(--color-base-content)">
                Active Order at {activeOrder.restaurantId?.restaurantName || "Restaurant"}
              </h3>
              <p className="text-xs text-(--color-secondary) mt-0.5">Order ID: {activeOrder._id}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-(--color-base-content)">Status:</span>
                <StatusBadge status={activeOrder.orderStatus} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("trackOrder")}
              className="bg-(--color-primary) text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 text-sm transition-colors shadow"
            >
              Track Order Live
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders & Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-(--color-base-200) rounded-xl p-5 border border-(--color-base-300) shadow-sm">
          <h3 className="font-bold text-base text-(--color-base-content) mb-4 flex items-center gap-2">
            <span>Recent Orders</span>
          </h3>
          {recentOrders?.length === 0 ? (
            <p className="text-sm text-(--color-secondary) text-center py-6">No recent orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-(--color-base-300) text-(--color-secondary) font-semibold">
                    <th className="pb-2">Restaurant</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-base-300)/40">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                      <td className="py-2.5 font-medium">{order.restaurantId?.restaurantName || "Restaurant"}</td>
                      <td className="py-2.5 text-xs text-(--color-secondary)">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 font-bold text-xs">₹{order.billDetails?.finalAmount}</td>
                      <td className="py-2.5">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Available Coupons & Quick Info */}
        <div className="space-y-4">
          <div className="bg-(--color-base-200) rounded-xl p-5 border border-(--color-base-300) shadow-sm">
            <h3 className="font-bold text-base text-(--color-base-content) mb-3 flex items-center gap-2">
              <FaTicketAlt className="text-(--color-primary)" />
              <span>Available Coupons</span>
            </h3>
            <div className="space-y-3">
              <div className="border border-dashed border-(--color-primary)/40 bg-orange-50/50 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-(--color-primary)">CRAVE50</p>
                  <p className="text-xxs text-(--color-secondary)">Get 50% off up to ₹100</p>
                </div>
                <span className="text-xxs font-bold text-(--color-secondary) bg-(--color-base-300) px-2 py-0.5 rounded">Copy</span>
              </div>
              <div className="border border-dashed border-(--color-primary)/40 bg-orange-50/50 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-(--color-primary)">FREEFEAST</p>
                  <p className="text-xxs text-(--color-secondary)">Free delivery on orders over ₹300</p>
                </div>
                <span className="text-xxs font-bold text-(--color-secondary) bg-(--color-base-300) px-2 py-0.5 rounded">Copy</span>
              </div>
            </div>
          </div>

          <div className="bg-(--color-base-200) rounded-xl p-5 border border-(--color-base-300) shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-xl text-(--color-secondary)" />
              <div>
                <h4 className="font-bold text-sm text-(--color-base-content)">Saved Addresses</h4>
                <p className="text-xs text-(--color-secondary)">Manage delivery locations</p>
              </div>
            </div>
            <span className="bg-(--color-primary) text-white font-bold text-xs px-2.5 py-1 rounded-full">
              {savedAddressCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
