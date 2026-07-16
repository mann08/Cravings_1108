import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import Pagination from "../dashboard/shared/Pagination";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaSearch } from "react-icons/fa";

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/foods", {
        params: { search, page, limit: 10 },
      });
      setFoods(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load food directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [search, page]);

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-(--color-base-content)">Food Catalog Administration</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search food item name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 pr-3 py-1.5 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--color-primary) w-60"
          />
          <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading food items..." />
      ) : foods.length === 0 ? (
        <EmptyState title="No food items" message="No food records found matching." />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-bold">
                <tr>
                  <th className="p-4 text-xs uppercase">Dish Photo</th>
                  <th className="p-4 text-xs uppercase">Dish Name</th>
                  <th className="p-4 text-xs uppercase">Restaurant</th>
                  <th className="p-4 text-xs uppercase">Category</th>
                  <th className="p-4 text-xs uppercase">Price</th>
                  <th className="p-4 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {foods.map((food) => (
                  <tr key={food._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4">
                      <img
                        src={food.image?.url || "https://placehold.co/100?text=Food"}
                        alt={food.itemName}
                        className="w-10 h-8 rounded object-cover border border-(--color-base-300)"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-sm">{food.itemName}</p>
                      <p className="text-xxs text-(--color-secondary) line-clamp-1">{food.description}</p>
                    </td>
                    <td className="p-4 font-medium">{food.restaurantName || "—"}</td>
                    <td className="p-4 text-xs text-(--color-neutral) capitalize">{food.category}</td>
                    <td className="p-4 font-bold">₹{food.price}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold ${food.isAvailable ? "text-(--color-success)" : "text-(--color-error)"}`}>
                        {food.isAvailable ? "Available" : "Unavailable"}
                      </span>
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

export default AdminFoods;
