import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaHeart, FaTrash } from "react-icons/fa";

const CustomerFavourites = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer/favourites");
      setItems(res.data.data);
    } catch (error) {
      toast.error("Failed to load favourite items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/customer/favourites/${id}`);
      toast.success("Removed from favourites");
      fetchFavourites();
    } catch (error) {
      toast.error("Failed to remove favourite item");
    }
  };

  if (loading) return <LoadingSpinner message="Loading your favourites..." />;

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <h2 className="text-xl font-bold text-(--color-base-content)">Favourite Food Items</h2>

      {items.length === 0 ? (
        <EmptyState title="No favourites saved" message="Save dishes as favourites to access them quickly here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 transition duration-200"
            >
              <div className="h-40 relative bg-gray-100">
                <img
                  src={item.image?.url || "https://placehold.co/600x400?text=Food"}
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-(--color-error) hover:bg-white shadow hover:scale-105 transition duration-150"
                  title="Remove from Favourites"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-(--color-base-content) truncate">{item.itemName}</h3>
                    <span className="text-xs font-bold text-(--color-primary) shrink-0">₹{item.price}</span>
                  </div>
                  <p className="text-xxs text-(--color-secondary) mt-0.5 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex justify-between items-center border-t border-(--color-base-300) pt-2">
                  <span className="text-xxs text-(--color-secondary) italic truncate">
                    From {item.restaurantName || "Restaurant"}
                  </span>
                  <button className="bg-(--color-primary) text-white font-semibold text-xs px-2.5 py-1 rounded hover:bg-orange-700 transition-colors shadow-sm">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerFavourites;
