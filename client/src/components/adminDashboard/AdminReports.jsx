import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import { FaPrint, FaRegCalendarAlt } from "react-icons/fa";

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reports", { params: { range } });
      setReports(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Generating reports..." />;

  const { dailyRevenue, topRestaurants, orderStatusBreakdown, newCustomers } = reports || {};

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1 print:p-8 print:bg-white">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-xl font-bold text-(--color-base-content)">System Analytics & Reports</h2>
        
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-1.5 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-(--color-primary) text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 text-sm shadow-sm transition-colors"
          >
            <FaPrint /> Print Report
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-orange-600">Cravings System Report</h1>
        <p className="text-xs text-gray-500 mt-1">Generated for past {range} Days on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performing Restaurants */}
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm">
          <h3 className="font-bold text-sm text-(--color-base-content) mb-3 pb-2 border-b border-(--color-base-300)/60">
            Top Performing Restaurants
          </h3>
          {topRestaurants?.length === 0 ? (
            <p className="text-xs text-(--color-secondary) text-center py-6">No top restaurant records.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-(--color-secondary) font-bold">
                  <th className="pb-2">Restaurant</th>
                  <th className="pb-2 text-right">Orders</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topRestaurants?.map((item, idx) => (
                  <tr key={idx} className="border-t border-(--color-base-300)/40">
                    <td className="py-2.5 font-semibold">{item.name}</td>
                    <td className="py-2.5 text-right font-mono">{item.totalOrders}</td>
                    <td className="py-2.5 text-right font-bold">₹{item.totalRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Orders by Status Summary */}
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm">
          <h3 className="font-bold text-sm text-(--color-base-content) mb-3 pb-2 border-b border-(--color-base-300)/60">
            Order Lifecycle Distribution
          </h3>
          {orderStatusBreakdown?.length === 0 ? (
            <p className="text-xs text-(--color-secondary) text-center py-6">No lifecycle distribution records.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-(--color-secondary) font-bold">
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {orderStatusBreakdown?.map((item, idx) => (
                  <tr key={idx} className="border-t border-(--color-base-300)/40">
                    <td className="py-2.5 capitalize font-semibold">{item._id}</td>
                    <td className="py-2.5 text-right font-bold font-mono">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Daily Revenue Summary */}
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm md:col-span-2">
          <h3 className="font-bold text-sm text-(--color-base-content) mb-3 pb-2 border-b border-(--color-base-300)/60">
            Daily Revenue Breakdown
          </h3>
          {dailyRevenue?.length === 0 ? (
            <p className="text-xs text-(--color-secondary) text-center py-6">No daily sales logs found.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-(--color-secondary) font-bold sticky top-0 bg-(--color-base-200)">
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Orders</th>
                    <th className="pb-2 text-right">Delivered Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-base-300)/40">
                  {dailyRevenue?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-mono">{item._id}</td>
                      <td className="py-2.5 text-right font-mono">{item.orders}</td>
                      <td className="py-2.5 text-right font-bold text-(--color-primary)">₹{item.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
