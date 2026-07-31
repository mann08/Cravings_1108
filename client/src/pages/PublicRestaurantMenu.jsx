import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaMapMarkerAlt, FaStar, FaUtensils } from "react-icons/fa";
import { LuLoaderCircle } from "react-icons/lu";
import api from "../config/api.config";
import { useAuth } from "../context/AuthContext";

const PublicRestaurantMenu = () => {
  const { restaurantId } = useParams();
  const { isLogin, role } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/public/restaurants/${restaurantId}/menu`);
        setRestaurant(res.data.data.restaurant);
        setMenuItems(res.data.data.menuItems || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load restaurant menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <LuLoaderCircle className="text-5xl text-orange-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-xl text-center">
          <FaUtensils className="text-5xl text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to load menu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const coverImage =
    restaurant?.coverImage?.url ||
    restaurant?.restaurantImage?.[0]?.url ||
    `https://picsum.photos/seed/${restaurantId}/900/500`;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <section className="relative overflow-hidden">
        <div
          className="h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-6 md:px-12">
          <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/70">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                  {restaurant.restaurantName}
                </h1>
                <p className="text-gray-600 text-base md:text-lg max-w-3xl">
                  {restaurant.description || "Explore the menu and discover your next favorite dish."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-orange-50 p-5 border border-orange-100 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-700 font-semibold mb-2">
                    Rating
                  </p>
                  <div className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                    <FaStar className="text-orange-500" />
                    <span>{restaurant.averageRating?.toFixed(1) || "New"}</span>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">
                    Location
                  </p>
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-orange-500" />
                    {restaurant.address ? `${restaurant.address}, ${restaurant.city}` : restaurant.city || "Location not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(restaurant.cuisineTypes) && restaurant.cuisineTypes.map((type) => (
                  <span key={type} className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                    {type}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                  Menu browsing is public — login only to order.
                </span>
                {restaurant.isOpen ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-xs font-semibold">
                    Open Now
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-4 py-2 text-xs font-semibold">
                    Closed
                  </span>
                )}
                {!isLogin ? (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
                  >
                    Login to order
                  </Link>
                ) : role === "customer" ? (
                  <Link
                    to="/customer-dashboard"
                    className="inline-flex items-center justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
                  >
                    Start ordering
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
                    Login as a customer to order
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 md:px-0 mt-16">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu</h2>
              {menuItems.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center text-slate-500">
                  No menu items are available for this restaurant yet.
                </div>
              ) : (
                <div className="space-y-5">
                  {menuItems.map((item) => (
                    <div key={item._id} className="grid gap-4 md:grid-cols-[1fr_0.5fr] items-center rounded-3xl border border-slate-200 p-5 hover:shadow-sm transition-shadow bg-slate-50">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">{item.itemName}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-orange-700 font-semibold mt-1">
                              {item.category || "Main"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">₹{item.price}</p>
                            {item.isAvailable ? (
                              <span className="text-sm text-emerald-700">Available</span>
                            ) : (
                              <span className="text-sm text-rose-600">Unavailable</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{item.description || "Delicious dish from the kitchen."}</p>
                      </div>
                      <div className="h-36 w-full overflow-hidden rounded-3xl bg-slate-200">
                        <img
                          src={item.image || `https://picsum.photos/seed/${encodeURIComponent(item.itemName)}/520/360`}
                          alt={item.itemName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white shadow-lg border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Restaurant Info</h3>
              <dl className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-slate-700">Type</dt>
                  <dd>{restaurant.restaurantType || "Restaurant"}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-slate-700">Cuisine</dt>
                  <dd>{restaurant.cuisineTypes?.join(", ") || "Multiple"}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-slate-700">Phone</dt>
                  <dd>{restaurant.contactDetails?.phone || "Not available"}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-slate-700">Email</dt>
                  <dd>{restaurant.contactDetails?.email || "Not available"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl bg-orange-600 p-8 text-white shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Want to order?</h3>
              <p className="text-sm leading-relaxed mb-6">
                Browse the full menu now. Login or register only when you are ready to place your order.
              </p>
              <Link
                to={isLogin && role === "customer" ? "/customer-dashboard" : "/login"}
                className="inline-flex w-full items-center justify-center rounded-full bg-white text-orange-600 px-6 py-3 font-semibold hover:bg-slate-100 transition-colors"
              >
                {isLogin && role === "customer" ? "Continue to order" : "Login to order"}
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PublicRestaurantMenu;
