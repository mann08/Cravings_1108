import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api.config";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import NoDataFound from "../components/NoDataFound";
import heroBg from "../assets/hero.png";
import defaultRestaurantImage from "../assets/foodTable.webp";
import {
  IoSearch,
  IoLocationOutline,
  IoTimeOutline,
  IoStar,
  IoStorefrontOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { FaLeaf, FaDrumstickBite } from "react-icons/fa";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { TbToolsKitchen2 } from "react-icons/tb";

const RESTAURANT_TYPES = [
  { value: "all", label: "All" },
  { value: "veg", label: "Veg", icon: <FaLeaf className="text-green-500" /> },
  {
    value: "non-veg",
    label: "Non-Veg",
    icon: <FaDrumstickBite className="text-red-500" />,
  },
  {
    value: "vegan",
    label: "Vegan",
    icon: <FaLeaf className="text-green-600" />,
  },
  {
    value: "jain",
    label: "Jain",
    icon: <FaLeaf className="text-orange-500" />,
  },
  {
    value: "both",
    label: "Veg & Non-Veg",
    icon: <MdOutlineRestaurantMenu className="text-purple-500" />,
  },
];

const OrderNow = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/public/restaurants");
      setRestaurants(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to fetch restaurants. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        restaurant.restaurantName?.toLowerCase().includes(q) ||
        restaurant.description?.toLowerCase().includes(q) ||
        restaurant.city?.toLowerCase().includes(q) ||
        restaurant.cuisineTypes?.some((c) => c.toLowerCase().includes(q));

      const matchesType =
        selectedType === "all" || restaurant.restaurantType === selectedType;
      const matchesOpen = !showOpenOnly || restaurant.isOpen;

      return matchesSearch && matchesType && matchesOpen;
    });
  }, [restaurants, searchQuery, selectedType, showOpenOnly]);

  if (isLoading) return <Loader height="100vh" width="100%" />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden min-h-[28rem] flex items-center justify-center text-center px-5 py-16">
        <img
          src={heroBg}
          alt="Food background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] bg-white/10 border border-white/20 px-4 py-2 rounded-full text-white/90 mb-5">
            <TbToolsKitchen2 /> Order Now
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Hungry? We&apos;ve got you.
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-3xl mx-auto">
            Discover the best restaurants in your city and browse menus freely. Login only when you&apos;re ready to order.
          </p>

          <div className="mt-8 relative max-w-xl mx-auto">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants, cuisine or city..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-white/30 bg-white/90 text-slate-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-white/80">
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <IoStorefrontOutline /> {restaurants.length} restaurants
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <IoCheckmarkCircleOutline /> {restaurants.filter((r) => r.isOpen).length} open now
            </span>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-20 bg-slate-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-wrap items-center gap-3">
          {RESTAURANT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-full border transition ${
                selectedType === type.value
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-orange-400"
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}

          <label className="ml-auto flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={showOpenOnly}
              onChange={(e) => setShowOpenOnly(e.target.checked)}
              className="accent-orange-600"
            />
            Open only
          </label>

          <span className="text-xs text-slate-500 ml-auto md:ml-0">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {filteredRestaurants.length === 0 ? (
          <NoDataFound height="60vh" width="100%" text="No restaurants found." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                onClick={() => navigate(`/restaurant-details/${restaurant._id}`)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={restaurant.coverImage?.url || restaurant.restaurantImage?.[0]?.url || defaultRestaurantImage}
                    alt={restaurant.restaurantName}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-bold ${restaurant.isOpen ? "bg-emerald-500 text-white" : "bg-slate-800 text-white"}`}>
                    {restaurant.isOpen ? "Open" : "Closed"}
                  </span>
                  {restaurant.averageRating > 0 && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-900">
                      <IoStar /> {restaurant.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{restaurant.restaurantName}</h2>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">{restaurant.description || "Tasty food from a top kitchen."}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">₹{restaurant.averageRating ? restaurant.averageRating.toFixed(0) : "-"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                    {restaurant.cuisineTypes?.slice(0, 3).map((c) => (
                      <span key={c} className="rounded-full bg-slate-100 px-2 py-1">{c}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <IoLocationOutline />
                      <span>{restaurant.city || "Unknown city"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoTimeOutline />
                      <span>{restaurant.isOpen ? "Open now" : "Closed"}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                  <button className="w-full rounded-full bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
                    View menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderNow;
