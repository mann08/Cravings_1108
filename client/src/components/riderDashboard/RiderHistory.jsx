import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import EmptyState from "../dashboard/shared/EmptyState";
import Pagination from "../dashboard/shared/Pagination";

const RiderHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rider/delivery-history", { params: { page, limit: 10 } });
      setHistory(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load delivery logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  if (loading) return <LoadingSpinner message="Loading delivery history..." />;

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <h2 className="text-xl font-bold text-(--color-base-content)">Delivery History</h2>

      {history.length === 0 ? (
        <EmptyState
          title="No deliveries yet"
          message="Complete orders to build up your delivery history."
        />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-bold">
                <tr>
                  <th className="p-4 text-xs uppercase">Order ID</th>
                  <th className="p-4 text-xs uppercase">Restaurant</th>
                  <th className="p-4 text-xs uppercase">Payout</th>
                  <th className="p-4 text-xs uppercase">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {history.map((order) => (
                  <tr key={order._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4 font-mono text-xs">{order._id}</td>
                    <td className="p-4 font-medium">{order.restaurantId?.restaurantName}</td>
                    <td className="p-4 font-bold text-(--color-success)">₹{order.billDetails?.deliveryCharge || 0}</td>
                    <td className="p-4 text-xs text-(--color-secondary)">
                      {new Date(order.updatedAt).toLocaleString()}
                    </td>
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
        </div>
      )}
    </div>
  );
};

export default RiderHistory;
