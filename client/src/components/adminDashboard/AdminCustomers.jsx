import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import StatusBadge from "../dashboard/shared/StatusBadge";
import Pagination from "../dashboard/shared/Pagination";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaSearch, FaUserSlash, FaUserCheck } from "react-icons/fa";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/customers", { params: { search, page, limit: 10 } });
      setCustomers(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to load customer list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const toggleBlockStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "suspended" ? "verified" : "suspended";
    try {
      await api.patch(`/admin/customers/${userId}/status`, { status: nextStatus });
      toast.success(nextStatus === "suspended" ? "Customer suspended" : "Customer activated");
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-(--color-base-content)">Customers Management</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search name, email, phone..."
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
        <LoadingSpinner message="Loading customer base..." />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers" message="No customer users matched the query." />
      ) : (
        <div className="bg-(--color-base-200) rounded-xl border border-(--color-base-300) shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--color-base-300)/50 border-b border-(--color-base-300) text-(--color-base-content) font-bold">
                <tr>
                  <th className="p-4 text-xs uppercase">Photo</th>
                  <th className="p-4 text-xs uppercase">Name</th>
                  <th className="p-4 text-xs uppercase">Email</th>
                  <th className="p-4 text-xs uppercase">Phone</th>
                  <th className="p-4 text-xs uppercase">Joined</th>
                  <th className="p-4 text-xs uppercase">Status</th>
                  <th className="p-4 text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/40">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-(--color-base-100)/40 transition-colors">
                    <td className="p-4">
                      <img
                        src={c.photo?.url || "https://placehold.co/100?text=User"}
                        alt={c.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-(--color-base-300)"
                      />
                    </td>
                    <td className="p-4 font-semibold">{c.fullName}</td>
                    <td className="p-4">{c.email}</td>
                    <td className="p-4 text-xs font-mono">{c.phone}</td>
                    <td className="p-4 text-xs text-(--color-secondary)">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.profile?.status || "verified"} />
                    </td>
                    <td className="p-4 text-right">
                      {c.profile?.status === "suspended" ? (
                        <button
                          onClick={() => toggleBlockStatus(c._id, c.profile?.status)}
                          className="text-(--color-success) hover:underline font-bold text-xs flex items-center gap-1.5 justify-end ml-auto"
                        >
                          <FaUserCheck /> Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleBlockStatus(c._id, c.profile?.status)}
                          className="text-(--color-error) hover:underline font-bold text-xs flex items-center gap-1.5 justify-end ml-auto"
                        >
                          <FaUserSlash /> Block Customer
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

export default AdminCustomers;
