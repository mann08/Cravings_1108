import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import EmptyState from "../dashboard/shared/EmptyState";
import Pagination from "../dashboard/shared/Pagination";

const RiderEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rider/earnings", { params: { page, limit: 10 } });
      setData(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load earnings profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [page]);

  if (loading) return <LoadingSpinner message="Calculating payouts..." />;

  const { earnings, totalEarnings, totalDeliveries } = data || {};

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <h2 className="text-xl font-bold text-(--color-base-content)">Earnings Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm text-center">
          <p className="text-xs text-(--color-secondary) uppercase tracking-wider font-semibold">Total Payouts Earned</p>
          <p className="text-3xl font-extrabold text-(--color-primary) mt-1">₹{totalEarnings || 0}</p>
        </div>
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm text-center">
          <p className="text-xs text-(--color-secondary) uppercase tracking-wider font-semibold">Deliveries Done</p>
          <p className="text-3xl font-extrabold text-(--color-base-content) mt-1">{totalDeliveries || 0}</p>
        </div>
      </div>

      {/* Earnings Table Ledger */}
      <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
        <div className="p-4 border-b border-(--color-base-300) bg-(--color-base-300)/20">
          <h3 className="font-bold text-sm text-(--color-base-content)">Earnings Ledger</h3>
        </div>

        {earnings?.length === 0 ? (
          <p className="text-xs text-(--color-secondary) text-center py-12">No payouts recorded yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-semibold">
                  <tr>
                    <th className="p-4 text-xs uppercase">Order Reference ID</th>
                    <th className="p-4 text-xs uppercase">Pay Date</th>
                    <th className="p-4 text-xs uppercase">Payout Status</th>
                    <th className="p-4 text-xs uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-base-300)/40">
                  {earnings?.map((e) => (
                    <tr key={e._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                      <td className="p-4 font-mono text-xs">{e.orderId || "—"}</td>
                      <td className="p-4 text-xs text-(--color-secondary)">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold capitalize ${e.status === "settled" ? "text-(--color-success)" : "text-(--color-warning)"}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-(--color-primary)">₹{e.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-(--color-base-300)">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages || 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiderEarnings;
