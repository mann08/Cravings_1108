import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSetting from "../../components/adminDashboard/AdminSettings";
import AdminSidebar from "../../components/adminDashboard/AdminSidebar";
import AdminOverview from "../../components/adminDashboard/AdminOverview";
import AdminOrders from "../../components/adminDashboard/AdminOrders";
import AdminCustomers from "../../components/adminDashboard/AdminCustomers";
import AdminRiders from "../../components/adminDashboard/AdminRiders";
import AdminRestaurants from "../../components/adminDashboard/AdminRestaurants";
import AdminFoods from "../../components/adminDashboard/AdminFoods";
import AdminReports from "../../components/adminDashboard/AdminReports";
import { FaTag, FaStar, FaBell } from "react-icons/fa";

const AdminDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");

  if (!isLogin || role !== "admin") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')] bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as a Admin to view this page.
          </h1>
          <button
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "orders":
        return <AdminOrders />;
      case "restaurants":
        return <AdminRestaurants />;
      case "foods":
        return <AdminFoods />;
      case "customers":
        return <AdminCustomers />;
      case "riders":
        return <AdminRiders />;
      case "reports":
        return <AdminReports />;
      case "settings":
        return <AdminSetting />;
      case "categories":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">Food Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Indian", "Chinese", "Italian", "Desserts", "Beverages", "Burgers", "Pizza", "Salads"].map((cat) => (
                <div key={cat} className="bg-white p-4 rounded-xl border border-(--color-base-300) text-center shadow-sm font-semibold text-sm">
                  {cat}
                </div>
              ))}
            </div>
          </div>
        );
      case "coupons":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">Active Coupons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-(--color-base-300) shadow-sm flex items-start gap-3">
                <FaTag className="text-(--color-primary) mt-1 text-lg shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">CRAVE50</h3>
                  <p className="text-xs text-(--color-secondary) mt-0.5">50% off up to ₹100 for new customers.</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-(--color-base-300) shadow-sm flex items-start gap-3">
                <FaTag className="text-(--color-primary) mt-1 text-lg shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">FREEFEAST</h3>
                  <p className="text-xs text-(--color-secondary) mt-0.5">Free delivery for orders above ₹300.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "payments":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">Payments Ledger</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--color-base-300) text-(--color-secondary)">
                    <th className="pb-2">Txn ID</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-(--color-base-300)/40">
                    <td className="py-2.5 font-mono text-xs">TXN90283021</td>
                    <td className="py-2.5 uppercase text-xs">upi</td>
                    <td className="py-2.5 font-bold">₹350.00</td>
                    <td className="py-2.5 text-xs text-(--color-success) font-semibold">Completed</td>
                  </tr>
                  <tr className="border-t border-(--color-base-300)/40">
                    <td className="py-2.5 font-mono text-xs">TXN10823022</td>
                    <td className="py-2.5 uppercase text-xs">card</td>
                    <td className="py-2.5 font-bold">₹245.00</td>
                    <td className="py-2.5 text-xs text-(--color-success) font-semibold">Completed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">Customer Reviews</h2>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-(--color-base-300) shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Rahul Sharma</span>
                  <div className="flex text-xs text-(--color-warning)">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                </div>
                <p className="text-xs text-(--color-neutral)">Amazing food and exceptionally quick delivery!</p>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">Administrative Alerts</h2>
            <div className="bg-white p-4 rounded-xl border border-(--color-base-300) flex gap-3 items-start">
              <FaBell className="text-(--color-primary) text-lg mt-0.5" />
              <div>
                <p className="font-semibold text-sm">New Restaurant Registered</p>
                <p className="text-xs text-(--color-secondary) mt-0.5">Please review documents for approving the registration.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-[91vh] flex flex-col md:flex-row gap-4 p-4 bg-(--color-base-100)">
      {/* Sidebar Panel */}
      <div className="w-full md:w-1/4 lg:w-1/5 bg-(--color-base-200) p-4 rounded-xl shadow-md border border-(--color-base-300) print:hidden">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 bg-(--color-base-100) p-2 rounded-xl h-full min-h-[75vh]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
