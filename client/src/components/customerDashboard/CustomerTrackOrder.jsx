import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaCheckCircle, FaClock, FaMotorcycle, FaUtensils } from "react-icons/fa";

const STEPS = [
  { key: "pending", label: "Order Placed", desc: "Waiting for restaurant acceptance", icon: <FaClock /> },
  { key: "accepted", label: "Order Confirmed", desc: "Restaurant accepted your order", icon: <FaCheckCircle /> },
  { key: "preparing", label: "Preparing Food", desc: "Chef is preparing your delicious meal", icon: <FaUtensils /> },
  { key: "ready", label: "Ready for Pickup", desc: "Food is cooked and packed", icon: <FaCheckCircle /> },
  { key: "pickedUp", label: "Picked Up", desc: "Rider picked up your food", icon: <FaMotorcycle /> },
  { key: "onTheWay", label: "Rider Out", desc: "Rider is heading to your place", icon: <FaMotorcycle /> },
  { key: "outForDelivery", label: "Out for Delivery", desc: "Arriving shortly at your doorstep", icon: <FaMotorcycle /> },
  { key: "delivered", label: "Delivered", desc: "Enjoy your meal!", icon: <FaCheckCircle /> },
];

const CustomerTrackOrder = () => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrder = async () => {
    try {
      const res = await api.get("/customer/dashboard");
      setActiveOrder(res.data.data?.activeOrder || null);
    } catch (error) {
      toast.error("Failed to load tracking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrder();

    // Live polling every 8 seconds
    const interval = setInterval(fetchActiveOrder, 8000);
    return () => clearInterval(interval);
  }, []);

  const getStepIndex = (status) => {
    if (status === "cancelled") return -1;
    // Map existing status to timeline steps
    const indexMap = {
      pending: 0,
      accepted: 1,
      preparing: 2,
      ready: 3,
      pickedUp: 4,
      onTheWay: 5,
      outForDelivery: 6,
      delivered: 7,
    };
    return indexMap[status] !== undefined ? indexMap[status] : 0;
  };

  if (loading) return <LoadingSpinner message="Loading live tracker..." />;

  if (!activeOrder) {
    return (
      <EmptyState
        title="No active order to track"
        message="Place an order to see live tracking here."
      />
    );
  }

  const currentStepIdx = getStepIndex(activeOrder.orderStatus);

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <h2 className="text-xl font-bold text-(--color-base-content)">Live Order Tracking</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tracker Timeline */}
        <div className="lg:col-span-2 bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-(--color-base-300) mb-6">
            <div>
              <p className="text-xs text-(--color-secondary) font-mono">Order ID: {activeOrder._id}</p>
              <h3 className="font-bold text-sm text-(--color-base-content) mt-1">
                From {activeOrder.restaurantId?.restaurantName}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-(--color-secondary)">Est. Delivery Time</p>
              <p className="font-bold text-sm text-(--color-primary)">30 - 45 mins</p>
            </div>
          </div>

          <div className="relative pl-8 space-y-6 border-l-2 border-gray-200">
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isActive = idx === currentStepIdx;
              return (
                <div key={step.key} className="relative">
                  {/* Step Dot Icon */}
                  <span
                    className={`absolute -left-12 top-0.5 p-1.5 rounded-full border text-xs flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-(--color-primary) text-white border-(--color-primary) scale-110 shadow-md ring-4 ring-(--color-primary)/20 animate-pulse"
                        : isCompleted
                        ? "bg-(--color-success) text-white border-(--color-success)"
                        : "bg-white text-gray-400 border-gray-300"
                    }`}
                  >
                    {step.icon}
                  </span>

                  <div>
                    <h4
                      className={`font-bold text-sm transition-colors ${
                        isActive
                          ? "text-(--color-primary)"
                          : isCompleted
                          ? "text-(--color-base-content)"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className={`text-xs mt-0.5 ${isActive ? "text-(--color-neutral)" : "text-gray-400"}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick details info */}
        <div className="space-y-4">
          <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-(--color-base-content) border-b border-(--color-base-300) pb-2">
              Restaurant Info
            </h4>
            <p className="text-sm font-bold">{activeOrder.restaurantId?.restaurantName}</p>
            <p className="text-xs text-(--color-neutral)">{activeOrder.restaurantId?.address}</p>
          </div>

          {activeOrder.riderInfo && (
            <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-(--color-base-content) border-b border-(--color-base-300) pb-2">
                Delivery Executive
              </h4>
              <p className="text-sm font-bold">{activeOrder.riderInfo?.riderId?.fullName}</p>
              <p className="text-xs text-(--color-neutral)">Phone: {activeOrder.riderInfo?.riderId?.phone}</p>
            </div>
          )}

          <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-(--color-base-content) border-b border-(--color-base-300) pb-2">
              Delivery Address
            </h4>
            <p className="text-xs font-bold">{activeOrder.deliveryAddress?.name}</p>
            <p className="text-xs text-(--color-neutral)">{activeOrder.deliveryAddress?.address}</p>
            <p className="text-xs text-(--color-neutral)">
              {activeOrder.deliveryAddress?.city}, {activeOrder.deliveryAddress?.pinCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTrackOrder;
