import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatusBadge from "../dashboard/shared/StatusBadge";
import Pagination from "../dashboard/shared/Pagination";
import EmptyState from "../dashboard/shared/EmptyState";
import ConfirmModal from "../dashboard/shared/ConfirmModal";
import { FaSearch, FaTimes, FaUserCheck, FaMapMarkerAlt } from "react-icons/fa";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchId, setSearchId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [riders, setRiders] = useState([]);
  const [riderSelectOpen, setRiderSelectOpen] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedRider, setSelectedRider] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders", {
        params: { status: statusFilter, search: searchId || undefined, page, limit: 10 },
      });
      setOrders(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const res = await api.get("/admin/riders", { params: { limit: 100 } });
      // Only keep active riders
      const activeRiders = res.data.data?.filter((r) => r.profile?.status === "active") || [];
      setRiders(activeRiders);
    } catch (error) {
      console.log("Riders load error", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchId, page]);

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success("Order status updated");
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: status }));
      }
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleAssignRiderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRider) return;
    try {
      const res = await api.patch(`/admin/orders/${assigningOrder}/assign-rider`, { riderId: selectedRider });
      toast.success("Rider assigned successfully");
      setRiderSelectOpen(false);
      setAssigningOrder(null);
      setSelectedRider("");
      if (selectedOrder && selectedOrder._id === assigningOrder) {
        // reload details
        openDetails(selectedOrder._id);
      }
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign rider");
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await api.get(`/admin/orders/${id}`);
      setSelectedOrder(res.data.data);
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-(--color-base-content)">Order Administration</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Order ID..."
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--color-primary) w-48 sm:w-60"
            />
            <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready for Pickup</option>
            <option value="pickedUp">Picked Up</option>
            <option value="outForDelivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading order data..." />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" message="No customer orders were found." />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-bold">
                <tr>
                  <th className="p-4 text-xs uppercase">Order ID</th>
                  <th className="p-4 text-xs uppercase">Customer</th>
                  <th className="p-4 text-xs uppercase">Restaurant</th>
                  <th className="p-4 text-xs uppercase">Amount</th>
                  <th className="p-4 text-xs uppercase">Status</th>
                  <th className="p-4 text-xs uppercase">Rider Assignment</th>
                  <th className="p-4 text-xs uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4 font-mono text-xs">{order._id}</td>
                    <td className="p-4 font-semibold">{order.customerId?.customerId?.fullName || "—"}</td>
                    <td className="p-4 font-medium">{order.restaurantId?.restaurantName || "—"}</td>
                    <td className="p-4 font-bold">₹{order.billDetails?.finalAmount}</td>
                    <td className="p-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-4 text-xs text-(--color-secondary)">
                      {order.riderId ? (
                        <span className="text-(--color-success) font-semibold">Assigned</span>
                      ) : order.orderStatus === "ready" ? (
                        <button
                          onClick={() => {
                            setAssigningOrder(order._id);
                            setRiderSelectOpen(true);
                          }}
                          className="text-(--color-primary) font-bold hover:underline"
                        >
                          Assign Rider
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetails(order._id)}
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

      {/* Details / Manage Popup Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-(--color-base-300)">
            <div className="p-5 border-b border-(--color-base-300) flex justify-between items-center bg-(--color-base-100)">
              <div>
                <h3 className="font-bold text-lg text-(--color-base-content)">Manage Order</h3>
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
              {/* Order Status Action controller */}
              <div className="bg-(--color-base-200) p-4 rounded-lg flex flex-col gap-2">
                <span className="font-bold text-xs uppercase text-(--color-secondary)">Update Order Status:</span>
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
                        Cancel Order
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
                  {["accepted", "preparing", "ready"].includes(selectedOrder.orderStatus) && !selectedOrder.riderId && (
                    <button
                      onClick={() => {
                        setAssigningOrder(selectedOrder._id);
                        setRiderSelectOpen(true);
                      }}
                      className="bg-(--color-info) text-white font-semibold text-xs px-3 py-1.5 rounded hover:bg-sky-600"
                    >
                      Assign Rider Exec
                    </button>
                  )}
                  {selectedOrder.orderStatus === "ready" && selectedOrder.riderId && (
                    <span className="text-xs text-(--color-secondary) font-semibold italic">Waiting for Rider pickup...</span>
                  )}
                  {["pickedUp", "onTheWay", "outForDelivery"].includes(selectedOrder.orderStatus) && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "delivered")}
                      className="bg-(--color-success) text-white font-semibold text-xs px-3 py-1.5 rounded hover:bg-green-700"
                    >
                      Force Mark Delivered
                    </button>
                  )}
                  {["delivered", "cancelled"].includes(selectedOrder.orderStatus) && (
                    <span className="text-xs text-(--color-secondary) italic font-semibold">Order is in terminal state ({selectedOrder.orderStatus})</span>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-sm text-(--color-base-content) mb-2">Items Overview</h4>
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

              {/* Delivery Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-(--color-base-200) rounded-lg">
                  <h5 className="font-bold text-xs uppercase text-(--color-secondary) mb-1">Customer info</h5>
                  <p className="font-bold text-sm">{selectedOrder.customerId?.customerId?.fullName || "—"}</p>
                  <p className="text-xs text-(--color-neutral)">Phone: {selectedOrder.customerId?.customerId?.phone}</p>
                  <p className="text-xs text-(--color-neutral)">Email: {selectedOrder.customerId?.customerId?.email}</p>
                </div>
                <div className="p-3 bg-(--color-base-200) rounded-lg">
                  <h5 className="font-bold text-xs uppercase text-(--color-secondary) mb-1">Rider Assigned</h5>
                  {selectedOrder.riderInfo ? (
                    <>
                      <p className="font-bold text-sm">{selectedOrder.riderInfo?.riderId?.fullName}</p>
                      <p className="text-xs text-(--color-neutral)">Phone: {selectedOrder.riderInfo?.riderId?.phone}</p>
                    </>
                  ) : (
                    <p className="text-xs text-(--color-error) font-semibold italic">Unassigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Rider Dialog Form */}
      {riderSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-(--color-base-content) mb-3">Assign Rider Executive</h3>
            <form onSubmit={handleAssignRiderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-(--color-neutral)">Select Active Rider</label>
                <select
                  required
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="w-full px-3 py-2 border border-(--color-base-300) rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                >
                  <option value="">Choose Rider...</option>
                  {riders.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.riderId?.fullName} ({r.vehicleDetails?.vehicleType || "No Vehicle"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRiderSelectOpen(false);
                    setAssigningOrder(null);
                    setSelectedRider("");
                  }}
                  className="px-4 py-2 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) hover:bg-(--color-base-200)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-(--color-primary) text-white font-semibold rounded-md text-sm hover:bg-orange-700"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
