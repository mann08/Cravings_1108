import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaMapMarkerAlt, FaStore, FaCoins } from "react-icons/fa";

const RiderOrders = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rider/delivery-requests");
      setRequests(res.data.data);
    } catch (error) {
      toast.error("Failed to load delivery requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (orderId) => {
    try {
      const res = await api.patch(`/rider/orders/${orderId}/accept`);
      toast.success(res.data.message || "Delivery accepted!");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept order");
    }
  };

  const handleReject = async (orderId) => {
    try {
      await api.patch(`/rider/orders/${orderId}/reject`);
      toast.success("Delivery request ignored");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  if (loading) return <LoadingSpinner message="Checking for available deliveries..." />;

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <h2 className="text-xl font-bold text-(--color-base-content)">Available Delivery Jobs</h2>

      {requests.length === 0 ? (
        <EmptyState
          title="No available orders"
          message="Check back soon! New orders show up when restaurants mark them ready."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 bg-orange-100 text-(--color-primary) text-xxs font-bold px-2 py-0.5 rounded-full">
                    <FaCoins /> Est. Pay: ₹{req.billDetails?.deliveryCharge || 0}
                  </div>
                  <span className="text-xxs text-(--color-secondary) font-mono">ID: {req._id.slice(-6)}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <FaStore className="text-(--color-secondary) shrink-0 mt-0.5 text-sm" />
                    <div>
                      <p className="font-bold text-(--color-base-content)">{req.restaurantId?.restaurantName}</p>
                      <p className="text-xxs text-(--color-secondary)">{req.restaurantId?.address}, {req.restaurantId?.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <FaMapMarkerAlt className="text-(--color-primary) shrink-0 mt-0.5 text-sm" />
                    <div>
                      <p className="font-bold text-(--color-base-content)">Customer Dropoff</p>
                      <p className="text-xxs text-(--color-secondary)">
                        {req.deliveryAddress?.address}, {req.deliveryAddress?.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleReject(req._id)}
                  className="flex-1 px-4 py-2 border border-(--color-base-300) hover:bg-white text-xs font-semibold rounded-lg text-(--color-neutral) transition-colors"
                >
                  Ignore
                </button>
                <button
                  onClick={() => handleAccept(req._id)}
                  className="flex-1 px-4 py-2 bg-(--color-primary) text-white hover:bg-orange-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Accept Delivery
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderOrders;
