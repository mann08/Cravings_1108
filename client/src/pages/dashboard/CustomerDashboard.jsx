import React from "react";
import CustomerOverview from "../../components/customerDashboard/CustomerOverview";
import CustomerOrders from "../../components/customerDashboard/CustomerOrders";
import CustomerSetting from "../../components/customerDashboard/CustomerSettings";
import CustomerSidebar from "../../components/customerDashboard/CustomerSidebar";
import CustomerAddresses from "../../components/customerDashboard/CustomerAddresses";
import CustomerFavourites from "../../components/customerDashboard/CustomerFavourites";
import CustomerTrackOrder from "../../components/customerDashboard/CustomerTrackOrder";
import PasswordChangeModal from "../../components/commonModals/PasswodChangeModal";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaTicketAlt, FaBell } from "react-icons/fa";

const CustomerDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");

  if (!isLogin || role !== "customer") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')] bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as a customer to view this page.
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
        return <CustomerOverview setActiveTab={setActiveTab} />;
      case "orders":
        return <CustomerOrders />;
      case "trackOrder":
        return <CustomerTrackOrder />;
      case "favourites":
        return <CustomerFavourites />;
      case "addresses":
        return <CustomerAddresses />;
      case "settings":
        return <CustomerSetting />;
      case "coupons":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-(--color-base-content)">Coupons and Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-dashed border-(--color-primary)/50 bg-white p-5 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <span className="bg-orange-100 text-(--color-primary) font-bold text-xs px-2.5 py-1 rounded-full uppercase">50% OFF</span>
                  <h3 className="font-bold text-base mt-2">CRAVE50</h3>
                  <p className="text-xs text-(--color-secondary) mt-1">Get 50% discount on your first order. Up to ₹100.</p>
                </div>
              </div>
              <div className="border border-dashed border-(--color-primary)/50 bg-white p-5 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <span className="bg-orange-100 text-(--color-primary) font-bold text-xs px-2.5 py-1 rounded-full uppercase">Free Delivery</span>
                  <h3 className="font-bold text-base mt-2">FREEFEAST</h3>
                  <p className="text-xs text-(--color-secondary) mt-1">Enjoy free delivery on all orders above ₹300.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-(--color-base-content)">Notifications</h2>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-(--color-base-300) shadow-sm flex gap-3 items-start">
                <FaBell className="text-(--color-primary) text-lg shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Welcome to Cravings!</p>
                  <p className="text-xs text-(--color-secondary) mt-0.5">Explore our wide range of menu items and track your delivery live.</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-(--color-base-300) shadow-sm flex gap-3 items-start">
                <FaBell className="text-(--color-primary) text-lg shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Rider assigned to order</p>
                  <p className="text-xs text-(--color-secondary) mt-0.5">A delivery rider has been assigned and is heading to the restaurant.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "changePassword":
        return (
          <div className="bg-(--color-base-200) p-6 rounded-xl border border-(--color-base-300) shadow-sm max-w-md">
            <h2 className="text-xl font-bold text-(--color-base-content) mb-4">Change Password</h2>
            <p className="text-xs text-(--color-secondary) mb-4">
              To update your account password, click the button below to launch the secure password reset flow.
            </p>
            <button
              onClick={() => setActiveTab("settings")}
              className="bg-(--color-primary) text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm shadow-sm"
            >
              Go to Profile & Settings
            </button>
          </div>
        );
      default:
        return <CustomerOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-[91vh] flex flex-col md:flex-row gap-4 p-4 bg-(--color-base-100)">
      {/* Sidebar Panel */}
      <div className="w-full md:w-1/4 lg:w-1/5 bg-(--color-base-200) p-4 rounded-xl shadow-md border border-(--color-base-300)">
        <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 bg-(--color-base-100) p-2 rounded-xl h-full min-h-[75vh]">
        {renderContent()}
      </div>
    </div>
  );
};

export default CustomerDashboard;
