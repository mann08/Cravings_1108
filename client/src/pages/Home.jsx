import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaStar, FaMapMarkerAlt, FaUtensils } from "react-icons/fa";
import { LuLoaderCircle } from "react-icons/lu";
import api from "../config/api.config";

import bg1 from "../assets/carousel/bgImage1-BgVBBcls.jpg";
import bg2 from "../assets/carousel/bgImage2-CSvQeVNX.jpg";
import bg3 from "../assets/carousel/bgImage3-BTY6Sz_K.jpg";
import bg4 from "../assets/carousel/bgImage4-L1QELaMd.jpg";

const carouselImages = [bg1, bg2, bg3, bg4];

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto carousel slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real restaurants from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const res = await api.get("/public/restaurants");
        setRestaurants(res.data.data || []);
      } catch (error) {
        try {
          const fallbackRes = await api.get("/customer/restaurants");
          setRestaurants(fallbackRes.data.data || []);
        } catch {
          setRestaurants([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.restaurantName?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      (Array.isArray(r.cuisineTypes) && r.cuisineTypes.some((c) => c.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── HERO BANNER WITH AUTOMATIC CAROUSEL ── */}
      <section className="h-[90vh] relative overflow-hidden flex items-center justify-center text-center text-white px-4">
        {carouselImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-95 scale-100" : "opacity-5 scale-105"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/* Carousel Arrow Navigation */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-3 md:left-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/35 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-all shadow-md cursor-pointer"
          aria-label="Previous Slide"
        >
          <FaChevronLeft className="text-lg md:text-xl" />
        </button>

        <button
          onClick={handleNextSlide}
          className="absolute right-3 md:right-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/35 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-all shadow-md cursor-pointer"
          aria-label="Next Slide"
        >
          <FaChevronRight className="text-lg md:text-xl" />
        </button>

        {/* Hero Central Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-white leading-tight drop-shadow-md">
            Your Favorite Food,
            <br />
            Delivered Fast
          </h1>

          <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-100 font-normal max-w-2xl mx-auto drop-shadow-sm">
            Order from thousands of restaurants and get it delivered to your doorstep.
          </p>

          <div className="flex justify-center items-center gap-4 mb-10 flex-wrap">
            <Link
              to="/register"
              className="bg-[#c84511] hover:bg-[#b03a0d] text-white font-bold px-8 py-3 rounded-lg shadow-md transition-colors duration-200"
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className="bg-[#fffdfa] hover:bg-white text-gray-900 font-bold px-8 py-3 rounded-lg shadow-md transition-colors duration-200"
            >
              Order Now
            </Link>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-3xl mx-auto bg-[#fffbf7] rounded-xl flex items-center px-4 py-3 shadow-lg border border-[#ffdccb]/60 transition-shadow"
          >
            <span className="text-gray-700 text-lg mr-3 pl-1">🔍</span>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or dishes..."
              className="w-full outline-none text-gray-800 text-base placeholder-[#d88863] bg-transparent"
              aria-label="Search restaurants or dishes"
            />
          </form>
        </div>

        {/* Carousel Bottom Dots Indicator */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? "w-8 h-2 bg-white shadow-sm"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── FEATURED RESTAURANTS SECTION ── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs block mb-1">
              Top Partners
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Featured Restaurants
            </h2>
          </div>
          <p className="text-gray-500 text-base mt-2 md:mt-0">
            Real restaurants available on Cravings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-orange-600 gap-3">
            <LuLoaderCircle className="animate-spin text-3xl" />
            <span className="font-semibold text-lg">Fetching top restaurants...</span>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <FaUtensils className="text-5xl text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Restaurants Available</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `No restaurants match "${searchQuery}". Try a different search term!`
                : "No restaurants have registered yet. Be the first restaurant partner to join!"}
            </p>
            <Link
              to="/register"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Register Your Restaurant
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => {
              const coverImg =
                restaurant.coverImage?.url ||
                (restaurant.restaurantImage?.length ? restaurant.restaurantImage[0].url : null) ||
                `https://picsum.photos/seed/${restaurant._id}/600/400`;

              return (
                <div
                  key={restaurant._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300 border border-gray-100 group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={coverImg}
                        alt={restaurant.restaurantName}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 text-green-700">
                        <FaStar className="text-amber-400 text-xs" />
                        <span>{restaurant.averageRating ? restaurant.averageRating.toFixed(1) : "New"}</span>
                      </div>
                      {restaurant.isOpen !== undefined && (
                        <div
                          className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full text-white backdrop-blur-md shadow-md ${
                            restaurant.isOpen ? "bg-green-600/90" : "bg-red-600/90"
                          }`}
                        >
                          {restaurant.isOpen ? "Open Now" : "Closed"}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                        {restaurant.restaurantName}
                      </h3>

                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                        <FaMapMarkerAlt className="text-orange-500" />
                        <span>
                          {restaurant.address ? `${restaurant.address}, ` : ""}
                          {restaurant.city || "Location available"}
                        </span>
                      </div>

                      {Array.isArray(restaurant.cuisineTypes) && restaurant.cuisineTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {restaurant.cuisineTypes.map((c, i) => (
                            <span
                              key={i}
                              className="bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-md border border-orange-200/60"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <Link
                      to="/login"
                      className="w-full text-center block bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-orange-500/20"
                    >
                      Explore Menu
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-bold mb-12">
            Cravings By The Numbers
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h3 className="text-4xl font-bold text-orange-600">2.5M+</h3>
              <p>Successful Deliveries</p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h3 className="text-4xl font-bold text-pink-500">500K+</h3>
              <p>Happy Customers</p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h3 className="text-4xl font-bold text-orange-600">5K+</h3>
              <p>Partner Restaurants</p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h3 className="text-4xl font-bold text-pink-500">1K+</h3>
              <p>Delivery Partners</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-bold mb-12">
            What Our Customers Say
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 mb-4">
                Amazing service and super fast delivery. Highly recommended.
              </p>
              <h4 className="font-bold">Khushi Kumari</h4>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 mb-4">
                Great variety of restaurants and easy ordering experience.
              </p>
              <h4 className="font-bold">Mann Verma</h4>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 mb-4">
                Food arrived hot and fresh. Loved the experience.
              </p>
              <h4 className="font-bold">Mahi</h4>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">Download Our Mobile App</h2>

          <p className="text-gray-600 mb-8">
            Order food anytime, anywhere with the Cravings mobile app.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium">
              Google Play
            </button>

            <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium">
              App Store
            </button>
          </div>
        </div>
      </section>

      <section className="bg-orange-600 text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Become a Restaurant Partner</h2>

        <p className="text-lg mb-8">
          Grow your business with Cravings and reach thousands of customers.
        </p>

        <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200\">
          Partner With Us
        </button>
      </section>
    </div>
  );
}

export default Home;
