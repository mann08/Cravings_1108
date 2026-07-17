import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatCard from "../dashboard/shared/StatCard";
import StatusBadge from "../dashboard/shared/StatusBadge";
import { FaShoppingBag, FaCheckCircle, FaClock, FaWallet } from "react-icons/fa";

const RestaurantOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.get("/restaurant/dashboard-stats"),
        api.get("/restaurant/orders", { params: { limit: 5 } }),
      ]);
      setStats(statsRes.data.data.stats);
      setRecentOrders(ordersRes.data.data);
    } catch (error) {
      toast.error("Failed to load restaurant metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <LoadingSpinner message="Loading restaurant overview..." />;

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <h2 className="text-xl font-bold text-(--color-base-content)">Restaurant Overview</h2>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FaShoppingBag />} label="Total Orders" value={stats?.totalOrders || 0} color="primary" />
        <StatCard icon={<FaCheckCircle />} label="Delivered" value={stats?.deliveredOrders || 0} color="success" />
        <StatCard icon={<FaClock />} label="Pending" value={stats?.pendingOrders || 0} color="warning" />
        <StatCard icon={<FaWallet />} label="Total Revenue" value={`₹${stats?.totalRevenue || 0}`} color="accent" />
      </div>

      {/* Recent Orders */}
      <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm">
        <h3 className="font-bold text-sm text-(--color-base-content) mb-4">Recent Incoming Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-xs text-(--color-secondary) text-center py-6">No order requests received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-(--color-secondary) font-bold">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Items Count</th>
                  <th className="pb-2">Total Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="py-2.5 font-mono text-xs">{order._id.slice(-8)}</td>
                    <td className="py-2.5 font-semibold">{order.customerId?.customerId?.fullName || "Guest"}</td>
                    <td className="py-2.5 font-mono">{order.orderItems?.length || 0} items</td>
                    <td className="py-2.5 font-bold">₹{order.billDetails?.finalAmount}</td>
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
    </div>
  );
};

export default RestaurantOverview;
