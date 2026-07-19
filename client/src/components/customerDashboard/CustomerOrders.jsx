import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatusBadge from "../dashboard/shared/StatusBadge";
import Pagination from "../dashboard/shared/Pagination";
import EmptyState from "../dashboard/shared/EmptyState";
import ConfirmModal from "../dashboard/shared/ConfirmModal";
import { FaSearch, FaTimes, FaStar, FaPrint } from "react-icons/fa";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchId, setSearchId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [orderToReview, setOrderToReview] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer/orders", {
        params: { status: statusFilter, search: searchId || undefined, page, limit: 10 },
      });
      setOrders(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchId, page]);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const res = await api.patch(`/customer/orders/${orderToCancel}/cancel`);
      toast.success(res.data.message || "Order cancelled successfully");
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
      if (selectedOrder && selectedOrder._id === orderToCancel) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: "cancelled" }));
      }
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleReviewOrder = async () => {
    if (!orderToReview) return;
    try {
      await api.post(`/customer/orders/${orderToReview}/review`, { rating });
      toast.success("Review submitted successfully");
      setIsReviewModalOpen(false);
      setOrderToReview(null);
      if (selectedOrder && selectedOrder._id === orderToReview) {
        setSelectedOrder((prev) => ({ ...prev, rating }));
      }
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await api.get(`/customer/orders/${id}`);
      setSelectedOrder(res.data.data);
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  const printInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #2d1b10; }
            h2 { color: #c2410c; }
            .flex { display: flex; justify-content: space-between; }
            .divider { border-bottom: 1px solid #ddd; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 8px; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body onload="window.print()">
          <h2>Cravings Invoice</h2>
          <p>Order ID: ${order._id}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
          <div class="divider"></div>
          <p><strong>Restaurant:</strong> ${order.restaurantId?.restaurantName}</p>
          <p><strong>Address:</strong> ${order.restaurantId?.address}, ${order.restaurantId?.city}</p>
          <div class="divider"></div>
          <h3>Ordered Items</h3>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
            </thead>
            <tbody>
              ${order.orderItems
                .map(
                  (item) =>
                    `<tr><td>${item.details?.itemName || "Menu Item"}</td><td>${item.quantity}</td><td>₹${
                      item.details?.price || 0
                    }</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="flex"><p>Subtotal:</p><p>₹${order.billDetails?.totalAmount}</p></div>
          <div class="flex"><p>Platform Fee:</p><p>₹${order.billDetails?.platformFee}</p></div>
          <div class="flex"><p>Delivery Charge:</p><p>₹${order.billDetails?.deliveryCharge}</p></div>
          <div class="flex"><h3>Final Total:</h3><h3>₹${order.billDetails?.finalAmount}</h3></div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-(--color-base-content)">My Orders</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Order ID..."
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
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" message="You don't have any orders matching the selection." />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-bold">
                <tr>
                  <th className="p-4 text-xs uppercase">Order ID</th>
                  <th className="p-4 text-xs uppercase">Restaurant</th>
                  <th className="p-4 text-xs uppercase">Total Amount</th>
                  <th className="p-4 text-xs uppercase">Status</th>
                  <th className="p-4 text-xs uppercase">Date</th>
                  <th className="p-4 text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4 font-mono text-xs">{order._id}</td>
                    <td className="p-4 font-medium">{order.restaurantId?.restaurantName || "Restaurant"}</td>
                    <td className="p-4 font-bold">₹{order.billDetails?.finalAmount}</td>
                    <td className="p-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-4 text-xs text-(--color-secondary)">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetails(order._id)}
                        className="bg-(--color-primary) text-white font-semibold px-3 py-1 rounded hover:bg-orange-700 text-xs shadow-sm transition-colors"
                      >
                        Details
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

      {/* Details Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-(--color-base-300)">
            <div className="p-5 border-b border-(--color-base-300) flex justify-between items-center bg-(--color-base-100)">
              <div>
                <h3 className="font-bold text-lg text-(--color-base-content)">Order Details</h3>
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
              {/* Order Status bar */}
              <div className="flex justify-between items-center bg-(--color-base-200) p-3 rounded-lg">
                <span className="font-semibold text-sm">Status:</span>
                <StatusBadge status={selectedOrder.orderStatus} />
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-sm text-(--color-base-content) mb-2">Items Ordered</h4>
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

              {/* Bill Details */}
              <div className="bg-(--color-base-200) p-4 rounded-lg space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--color-secondary)">Item Total:</span>
                  <span>₹{selectedOrder.billDetails?.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-secondary)">Delivery Charge:</span>
                  <span>₹{selectedOrder.billDetails?.deliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-secondary)">Platform Fee:</span>
                  <span>₹{selectedOrder.billDetails?.platformFee}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-(--color-base-300) pt-2">
                  <span>Grand Total:</span>
                  <span className="text-(--color-primary)">₹{selectedOrder.billDetails?.finalAmount}</span>
                </div>
              </div>

              {/* Restaurant & Rider details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-(--color-base-200) rounded-lg">
                  <h5 className="font-bold text-xs uppercase text-(--color-secondary) mb-1">Restaurant Details</h5>
                  <p className="font-bold text-sm">{selectedOrder.restaurantId?.restaurantName}</p>
                  <p className="text-xs text-(--color-neutral) mt-0.5">{selectedOrder.restaurantId?.address}</p>
                  <p className="text-xs text-(--color-neutral)">Phone: {selectedOrder.restaurantId?.contactDetails?.phone}</p>
                </div>
                <div className="p-3 bg-(--color-base-200) rounded-lg">
                  <h5 className="font-bold text-xs uppercase text-(--color-secondary) mb-1">Delivery Address</h5>
                  <p className="font-bold text-sm">{selectedOrder.deliveryAddress?.name}</p>
                  <p className="text-xs text-(--color-neutral) mt-0.5">{selectedOrder.deliveryAddress?.address}</p>
                  <p className="text-xs text-(--color-neutral)">{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.pinCode}</p>
                </div>
              </div>

              {selectedOrder.riderInfo && (
                <div className="p-3 bg-(--color-base-200) rounded-lg">
                  <h5 className="font-bold text-xs uppercase text-(--color-secondary) mb-1">Assigned Rider</h5>
                  <p className="font-bold text-sm">{selectedOrder.riderInfo?.riderId?.fullName}</p>
                  <p className="text-xs text-(--color-neutral)">Phone: {selectedOrder.riderInfo?.riderId?.phone}</p>
                </div>
              )}

              {/* Payment Details */}
              <div className="p-3 bg-(--color-base-200) rounded-lg text-sm flex justify-between items-center">
                <div>
                  <span className="font-bold text-xs uppercase text-(--color-secondary) block">Payment Method</span>
                  <span className="font-semibold uppercase">{selectedOrder.paymentDetails?.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs uppercase text-(--color-secondary) block">Payment Status</span>
                  <span className={`font-semibold capitalize ${selectedOrder.paymentDetails?.paymentStatus === "completed" ? "text-(--color-success)" : "text-(--color-error)"}`}>
                    {selectedOrder.paymentDetails?.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-(--color-base-300) flex flex-wrap gap-3 justify-between bg-(--color-base-100)">
              <button
                onClick={() => printInvoice(selectedOrder)}
                className="flex items-center gap-1.5 border border-(--color-secondary) text-(--color-secondary) px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-xs font-semibold"
              >
                <FaPrint /> Print Invoice
              </button>
              <div className="flex gap-2">
                {selectedOrder.orderStatus === "pending" && (
                  <button
                    onClick={() => {
                      setOrderToCancel(selectedOrder._id);
                      setIsCancelModalOpen(true);
                    }}
                    className="bg-(--color-error) text-white font-semibold px-4 py-1.5 rounded-md hover:bg-red-700 text-xs transition-colors shadow-sm"
                  >
                    Cancel Order
                  </button>
                )}
                {selectedOrder.orderStatus === "delivered" && !selectedOrder.rating && (
                  <button
                    onClick={() => {
                      setOrderToReview(selectedOrder._id);
                      setIsReviewModalOpen(true);
                    }}
                    className="bg-(--color-primary) text-white font-semibold px-4 py-1.5 rounded-md hover:bg-orange-700 text-xs transition-colors shadow-sm"
                  >
                    Rate Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmModal
        open={isCancelModalOpen}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        danger={true}
      />

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-(--color-base-content) mb-3">Rate and Review</h3>
            <p className="text-sm text-(--color-secondary) mb-4">Please rate your ordering experience (1 to 5 stars):</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  <FaStar className={star <= rating ? "text-(--color-warning)" : "text-gray-300"} />
                </button>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setOrderToReview(null);
                }}
                className="px-4 py-2 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) hover:bg-(--color-base-200)"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewOrder}
                className="px-4 py-2 bg-(--color-primary) text-white font-semibold rounded-md text-sm hover:bg-orange-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
