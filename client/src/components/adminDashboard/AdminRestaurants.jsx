import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatusBadge from "../dashboard/shared/StatusBadge";
import Pagination from "../dashboard/shared/Pagination";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaSearch, FaToggleOn, FaToggleOff } from "react-icons/fa";

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/restaurants", {
        params: { search, status: statusFilter, page, limit: 10 },
      });
      setRestaurants(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load restaurant directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [search, statusFilter, page]);

  const toggleOpenStatus = async (id, currentOpen) => {
    try {
      await api.patch(`/admin/restaurants/${id}`, { isOpen: !currentOpen });
      toast.success("Restaurant serving hours toggled");
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to toggle open status");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/restaurants/${id}`, { status });
      toast.success(`Restaurant status set to ${status}`);
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-(--color-base-content)">Restaurant Management</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
            <option value="active">Active</option>
            <option value="inactive">Inactive / Pending</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading restaurants list..." />
      ) : restaurants.length === 0 ? (
        <EmptyState title="No restaurants" message="No restaurant records matched." />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-bold">
                <tr>
                  <th className="p-4 text-xs uppercase">Restaurant</th>
                  <th className="p-4 text-xs uppercase">Location</th>
                  <th className="p-4 text-xs uppercase">Type</th>
                  <th className="p-4 text-xs uppercase">Rating</th>
                  <th className="p-4 text-xs uppercase">Live Status</th>
                  <th className="p-4 text-xs uppercase">Status</th>
                  <th className="p-4 text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {restaurants.map((res) => (
                  <tr key={res._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={res.coverImage?.url || "https://placehold.co/100?text=Rest"}
                        alt={res.restaurantName}
                        className="w-10 h-7 rounded object-cover border border-(--color-base-300)"
                      />
                      <div>
                        <p className="font-semibold">{res.restaurantName}</p>
                        <p className="text-xxs text-(--color-secondary)">{res.contactDetails?.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      {res.address}, {res.city}
                    </td>
                    <td className="p-4 text-xs uppercase font-medium text-(--color-secondary)">
                      {res.restaurantType}
                    </td>
                    <td className="p-4 text-xs font-bold">⭐ {res.averageRating || "—"}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleOpenStatus(res._id, res.isOpen)}
                        className={`text-xl ${res.isOpen ? "text-(--color-success)" : "text-gray-400"}`}
                        title="Toggle Open/Close status"
                      >
                        {res.isOpen ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {res.status === "inactive" && (
                        <button
                          onClick={() => updateStatus(res._id, "active")}
                          className="bg-(--color-success) text-white text-xs px-2.5 py-1 rounded hover:bg-green-700 font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {res.status === "active" ? (
                        <button
                          onClick={() => updateStatus(res._id, "blocked")}
                          className="text-(--color-error) font-bold text-xs hover:underline"
                        >
                          Block
                        </button>
                      ) : res.status === "blocked" ? (
                        <button
                          onClick={() => updateStatus(res._id, "active")}
                          className="text-(--color-success) font-bold text-xs hover:underline"
                        >
                          Activate
                        </button>
                      ) : null}
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

export default AdminRestaurants;
