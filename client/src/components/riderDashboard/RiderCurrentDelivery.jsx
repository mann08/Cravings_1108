import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import EmptyState from "../dashboard/shared/EmptyState";
import StatusBadge from "../dashboard/shared/StatusBadge";
import { FaPhoneAlt, FaMapMarkedAlt, FaStore, FaUser, FaArrowCircleRight } from "react-icons/fa";

const STEP_LABELS = {
  accepted: "Confirm Reached Restaurant",
  preparing: "Confirm Food Picked Up",
  pickedUp: "Confirm Start Transit",
  onTheWay: "Confirm Out for Delivery",
  outForDelivery: "Confirm Handed Over / Delivered",
};

const RiderCurrentDelivery = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentOrder = async () => {
    try {
      const res = await api.get("/rider/current-order");
      setOrder(res.data.data);
    } catch (error) {
      toast.error("Failed to load active delivery info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const handleUpdateStatus = async () => {
    if (!order) return;
    try {
      const res = await api.patch(`/rider/orders/${order._id}/status`);
      toast.success(res.data.message || "Status updated!");
      fetchCurrentOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to progress delivery state");
    }
  };

  const getGoogleMapsLink = (address) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (loading) return <LoadingSpinner message="Loading your current route..." />;

  if (!order) {
    return (
      <EmptyState
        title="No active deliveries"
        message="You don't have any ongoing deliveries right now. Go to Available Orders to pick up a job."
      />
    );
  }

  const nextActionLabel = STEP_LABELS[order.orderStatus];

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex justify-between items-center pb-2 border-b border-(--color-base-300)">
        <h2 className="text-xl font-bold text-(--color-base-content)">Active Delivery</h2>
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Pickup/Dropoff Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pickup Card */}
          <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-(--color-primary) font-bold text-xs uppercase">
              <FaStore /> Pickup Location
            </div>
            <div>
              <h3 className="font-bold text-base">{order.restaurantId?.restaurantName}</h3>
              <p className="text-xs text-(--color-neutral) mt-1">
                {order.restaurantId?.address}, {order.restaurantId?.city}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-(--color-base-300)/60">
              <a
                href={`tel:${order.restaurantId?.contactDetails?.phone}`}
                className="flex items-center gap-1.5 bg-white border border-(--color-base-300) text-(--color-neutral) text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                <FaPhoneAlt /> Call Restaurant
              </a>
              <a
                href={getGoogleMapsLink(`${order.restaurantId?.restaurantName}, ${order.restaurantId?.address}, ${order.restaurantId?.city}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white border border-(--color-base-300) text-(--color-neutral) text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                <FaMapMarkedAlt /> Open in Maps
              </a>
            </div>
          </div>

          {/* Dropoff Card */}
          <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-(--color-primary) font-bold text-xs uppercase">
              <FaUser /> Customer Dropoff
            </div>
            <div>
              <h3 className="font-bold text-base">{order.deliveryAddress?.name}</h3>
              <p className="text-xs text-(--color-neutral) mt-1">
                {order.deliveryAddress?.address}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pinCode}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-(--color-base-300)/60">
              <a
                href={`tel:${order.customerId?.customerId?.phone}`}
                className="flex items-center gap-1.5 bg-white border border-(--color-base-300) text-(--color-neutral) text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                <FaPhoneAlt /> Call Customer
              </a>
              <a
                href={getGoogleMapsLink(`${order.deliveryAddress?.address}, ${order.deliveryAddress?.city}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white border border-(--color-base-300) text-(--color-neutral) text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                <FaMapMarkedAlt /> Open in Maps
              </a>
            </div>
          </div>
        </div>

        {/* Right column: Action step update & summary details */}
        <div className="space-y-4">
          <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-(--color-base-content) border-b border-(--color-base-300) pb-2">
              Delivery Progress Action
            </h4>
            {nextActionLabel ? (
              <button
                onClick={handleUpdateStatus}
                className="w-full bg-(--color-primary) text-white font-semibold text-xs py-3 rounded-lg hover:bg-orange-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {nextActionLabel} <FaArrowCircleRight />
              </button>
            ) : (
              <p className="text-xs text-(--color-secondary) text-center py-4 font-semibold">
                No active progression actions available.
              </p>
            )}
          </div>

          <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-sm text-(--color-base-content) border-b border-(--color-base-300) pb-2 mb-2">
              Order Details
            </h4>
            <div className="flex justify-between">
              <span className="text-(--color-secondary)">Order ID:</span>
              <span className="font-mono">{order._id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-secondary)">Estimated Earnings:</span>
              <span className="font-bold text-(--color-primary)">₹{order.billDetails?.deliveryCharge || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderCurrentDelivery;
