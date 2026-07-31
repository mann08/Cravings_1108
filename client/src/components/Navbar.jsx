import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logoLight from "../assets/transparentLogoLight.png";
import { useAuth } from "../context/AuthContext";
import { FaPowerOff } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../config/api.config";

const Navbar = () => {
  const { user, isLogin, role, setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = () => {
    //console.log("Handle Navigate", role);

    if (role === "restaurant") {
      navigate("/restaurant-dashboard");
    } else if (role === "rider") {
      navigate("/rider-dashboard");
    } else if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await api.get("/auth/logout");
      toast.success(res.data.message);

      sessionStorage.removeItem("cravingUser");
      setUser(null);
      setIsLogin(false);
      setRole(null);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during registration. Please try again.",
      );
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoLight} alt="Cravings" className="h-10 w-auto" />
          <span className="text-lg font-bold tracking-tight text-slate-900">Cravings</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link to="/contact" className="hover:text-slate-900 transition-colors">
            Contact
          </Link>
        </div>

        {isLogin ? (
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 hover:border-slate-300 transition"
              title="Go to Dashboard"
              onClick={handleNavigate}
            >
              <img
                src={user?.photo?.url || "https://via.placeholder.com/48"}
                alt={user?.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">{user?.fullName || "User"}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{role || "Member"}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              title="Logout"
            >
              <FaPowerOff className="mr-2" /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-700 hover:text-slate-900 transition"
            >
              Login
            </Link>
            <Link
              to="/register/customer"
              className="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
