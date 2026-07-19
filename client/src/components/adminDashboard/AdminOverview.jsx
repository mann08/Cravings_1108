import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatCard from "../dashboard/shared/StatCard";
import { FaUsers, FaMotorcycle, FaStore, FaShoppingBag, FaWallet } from "react-icons/fa";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setData(res.data.data);
      } catch (error) {
        toast.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading admin dashboard stats..." />;

  const { stats, charts } = data || {};

  // Custom colors matching Cravings theme
  const PIE_COLORS = ["#c2410c", "#d9468f", "#f59e0b", "#22c55e", "#ef4444", "#3f3f46"];

  const pieData = charts?.ordersByStatus?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  const lineData = charts?.dailyOrders?.map((item) => ({
    date: item._id,
    Orders: item.count,
    Revenue: item.revenue,
  })) || [];

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <h2 className="text-xl font-bold text-(--color-base-content)">Dashboard Overview</h2>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FaUsers />} label="Total Customers" value={stats?.totalCustomers || 0} color="info" />
        <StatCard icon={<FaMotorcycle />} label="Total Riders" value={stats?.totalRiders || 0} color="success" />
        <StatCard icon={<FaStore />} label="Active Restaurants" value={stats?.totalRestaurants || 0} color="warning" />
        <StatCard icon={<FaShoppingBag />} label="Total Orders" value={stats?.totalOrders || 0} color="primary" />
      </div>

      {/* Revenue Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FaWallet />} label="Total Revenue" value={`₹${stats?.totalRevenue || 0}`} color="accent" />
        <StatCard icon={<FaWallet />} label="Today's Revenue" value={`₹${stats?.todayRevenue || 0}`} color="success" />
        <StatCard icon={<FaWallet />} label="Monthly Revenue" value={`₹${stats?.monthRevenue || 0}`} color="primary" />
        <StatCard icon={<FaShoppingBag />} label="Avg Order Value" value={`₹${stats?.avgOrderValue || 0}`} color="info" />
      </div>

      {/* Status Breakdown Mini Cards */}
      <div className="bg-(--color-base-200) p-4 rounded-xl border border-(--color-base-300) shadow-sm">
        <h3 className="font-bold text-xs uppercase text-(--color-secondary) tracking-wider mb-3">Order Status Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-white p-3 rounded-lg border border-(--color-base-300)">
            <p className="text-xxs text-(--color-secondary) uppercase">Pending</p>
            <p className="text-lg font-bold text-(--color-warning) mt-1">{stats?.pendingOrders || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-(--color-base-300)">
            <p className="text-xxs text-(--color-secondary) uppercase">Active</p>
            <p className="text-lg font-bold text-(--color-info) mt-1">{stats?.activeOrders || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-(--color-base-300)">
            <p className="text-xxs text-(--color-secondary) uppercase">Delivered</p>
            <p className="text-lg font-bold text-(--color-success) mt-1">{stats?.deliveredOrders || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-(--color-base-300)">
            <p className="text-xxs text-(--color-secondary) uppercase">Cancelled</p>
            <p className="text-lg font-bold text-(--color-error) mt-1">{stats?.cancelledOrders || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-(--color-base-300) col-span-2 sm:col-span-1">
            <p className="text-xxs text-(--color-secondary) uppercase">Today Sales</p>
            <p className="text-lg font-bold text-(--color-primary) mt-1">₹{stats?.todayRevenue || 0}</p>
          </div>
        </div>
      </div>

      {/* Recharts Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Orders Area Chart */}
        <div className="lg:col-span-2 bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm">
          <h3 className="font-bold text-sm text-(--color-base-content) mb-4">Daily Sales & Orders</h3>
          {lineData.length === 0 ? (
            <p className="text-xs text-(--color-secondary) text-center py-20">No daily order activity records found.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c2410c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#c2410c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Orders" stroke="#c2410c" fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm text-(--color-base-content) mb-3">Order Status Share</h3>
          {pieData.length === 0 ? (
            <p className="text-xs text-(--color-secondary) text-center py-20">No order status breakdown records.</p>
          ) : (
            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-xxs text-(--color-secondary) mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="capitalize truncate">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
