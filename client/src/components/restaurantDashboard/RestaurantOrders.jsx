import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatusBadge from "../dashboard/shared/StatusBadge";
import Pagination from "../dashboard/shared/Pagination";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaTimes } from "react-icons/fa";

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/restaurant/orders", {
        params: { status: statusFilter, page, limit: 10 },
      });
      setOrders(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load restaurant orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/restaurant/orders/${id}/status`, { status });
      toast.success("Order status updated successfully");
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: status }));
      }
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-(--color-base-content)">Incoming Orders</h2>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="accepted">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready for Pickup</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading incoming orders..." />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" message="No orders received for this criteria yet." />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-semibold">
                <tr>
                  <th className="p-4 text-xs uppercase">Order ID</th>
                  <th className="p-4 text-xs uppercase">Customer</th>
                  <th className="p-4 text-xs uppercase">Items Count</th>
                  <th className="p-4 text-xs uppercase">Total Amount</th>
                  <th className="p-4 text-xs uppercase">Status</th>
                  <th className="p-4 text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4 font-mono text-xs">{order._id.slice(-8)}</td>
                    <td className="p-4 font-semibold">{order.customerId?.customerId?.fullName || "Guest"}</td>
                    <td className="p-4 text-xs text-(--color-secondary)">{order.orderItems?.length || 0} items</td>
                    <td className="p-4 font-bold">₹{order.billDetails?.finalAmount}</td>
                    <td className="p-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-(--color-primary) text-white px-3 py-1 rounded hover:bg-orange-700 text-xs font-semibold shadow-sm"
                      >
                        Manage
                      </button>
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

      {/* Details / Management Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-(--color-base-300)">
            <div className="p-5 border-b border-(--color-base-300) flex justify-between items-center bg-(--color-base-100)">
              <div>
                <h3 className="font-bold text-lg text-(--color-base-content)">Order Request Management</h3>
                <p className="text-xs text-(--color-secondary) font-mono">ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-(--color-secondary) hover:text-(--color-primary) text-xl p-1 rounded-full hover:bg-(--color-base-200) transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status Actions */}
              <div className="bg-(--color-base-200) p-4 rounded-lg flex flex-col gap-2">
                <span className="font-bold text-xs uppercase text-(--color-secondary)">Restaurant Actions:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedOrder.orderStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, "accepted")}
                        className="bg-(--color-primary) text-white font-semibold text-xs px-3 py-1.5 rounded hover:bg-orange-700"
                      >
                        Accept / Confirm Order
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, "cancelled")}
                        className="bg-(--color-error) text-white font-semibold text-xs px-3 py-1.5 rounded hover:bg-red-700"
                      >
                        Reject / Cancel Order
                      </button>
                    </>
                  )}
                  {selectedOrder.orderStatus === "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "preparing")}
                      className="bg-(--color-primary) text-white font-semibold text-xs px-3 py-1.5 rounded hover:bg-orange-700"
                    >
                      Start Food Preparation
                    </button>
                  )}
                  {selectedOrder.orderStatus === "preparing" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "ready")}
                      className="bg-(--color-primary) text-white font-semibold text-xs px-3 py-1.5 rounded hover:bg-orange-700"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                  {["delivered", "cancelled"].includes(selectedOrder.orderStatus) && (
                    <span className="text-xs text-(--color-secondary) italic font-semibold">Order processing complete ({selectedOrder.orderStatus})</span>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-sm text-(--color-base-content) mb-2">Order Items</h4>
                <div className="divide-y divide-(--color-base-300)/40">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold">{item.details?.itemName || "Menu Item"}</p>
                        <p className="text-xs text-(--color-secondary)">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-xs">₹{item.details?.price * item.quantity || 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer details */}
              <div className="p-3 bg-(--color-base-200) rounded-lg">
                <h5 className="font-bold text-xs uppercase text-(--color-secondary) mb-1">Customer Delivery details</h5>
                <p className="font-bold text-sm">{selectedOrder.deliveryAddress?.name}</p>
                <p className="text-xs text-(--color-neutral) mt-0.5">{selectedOrder.deliveryAddress?.address}</p>
                <p className="text-xs text-(--color-neutral)">{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.pinCode}</p>
                <p className="text-xs text-(--color-neutral)">Contact: {selectedOrder.customerId?.customerId?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
