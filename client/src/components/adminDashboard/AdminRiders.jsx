import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatusBadge from "../dashboard/shared/StatusBadge";
import Pagination from "../dashboard/shared/Pagination";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaSearch, FaUserSlash, FaUserCheck, FaMotorcycle } from "react-icons/fa";

const AdminRiders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/riders", { params: { search, page, limit: 10 } });
      setRiders(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load rider directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, [search, page]);

  const updateStatus = async (riderId, status) => {
    try {
      await api.patch(`/admin/riders/${riderId}/status`, { status });
      toast.success(`Rider status set to ${status}`);
      fetchRiders();
    } catch (error) {
      toast.error("Failed to update rider status");
    }
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-(--color-base-content)">Riders Administration</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search riders by name..."
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
        <LoadingSpinner message="Loading rider squad..." />
      ) : riders.length === 0 ? (
        <EmptyState title="No riders registered" message="No rider records found matching." />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-bold">
                <tr>
                  <th className="p-4 text-xs uppercase">Rider</th>
                  <th className="p-4 text-xs uppercase">Vehicle Details</th>
                  <th className="p-4 text-xs uppercase">Rating</th>
                  <th className="p-4 text-xs uppercase">Availability</th>
                  <th className="p-4 text-xs uppercase">Status</th>
                  <th className="p-4 text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {riders.map((r) => (
                  <tr key={r._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={r.photo?.url || "https://placehold.co/100?text=Rider"}
                        alt={r.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-(--color-base-300)"
                      />
                      <div>
                        <p className="font-semibold">{r.fullName}</p>
                        <p className="text-xxs text-(--color-secondary) font-mono">{r.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      {r.profile?.vehicleDetails ? (
                        <div>
                          <p className="font-medium uppercase">{r.profile.vehicleDetails.vehicleType}</p>
                          <p className="text-xxs text-(--color-secondary) font-mono">{r.profile.vehicleDetails.vehicleNumber}</p>
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold">⭐ {r.profile?.averageRating || "—"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold ${r.profile?.isAvailable ? "text-(--color-success)" : "text-(--color-secondary)"}`}>
                        {r.profile?.isAvailable ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.profile?.status || "inactive"} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {r.profile?.status === "blocked" ? (
                        <button
                          onClick={() => updateStatus(r.profile._id, "inactive")}
                          className="text-(--color-success) font-bold text-xs hover:underline"
                        >
                          Unblock
                        </button>
                      ) : r.profile?.status === "inactive" ? (
                        <>
                          <button
                            onClick={() => updateStatus(r.profile._id, "active")}
                            className="bg-(--color-success) text-white font-semibold text-xs px-2.5 py-1 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(r.profile._id, "blocked")}
                            className="text-(--color-error) font-bold text-xs hover:underline"
                          >
                            Block
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateStatus(r.profile._id, "blocked")}
                          className="text-(--color-error) font-bold text-xs hover:underline"
                        >
                          Block Rider
                        </button>
                      )}
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

export default AdminRiders;
