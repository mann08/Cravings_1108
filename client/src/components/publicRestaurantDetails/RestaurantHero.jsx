import React from "react";
import { IoArrowBack, IoStar } from "react-icons/io5";
import { restaurantTypeLabel } from "./helpers";

const RestaurantHero = ({ restaurant, onBack }) => {
  const typeInfo = restaurantTypeLabel(restaurant.restaurantType);

  return (
    <div className="relative w-full h-72 md:h-96 overflow-hidden">
      {restaurant.coverImage?.url ? (
        <img
          src={restaurant.coverImage.url}
          alt={restaurant.restaurantName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-700/80 to-slate-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm hover:bg-white/30 transition"
      >
        <IoArrowBack /> Back
      </button>

      <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-6 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{restaurant.restaurantName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${typeInfo.color}`}>
                {typeInfo.icon}
                {typeInfo.label}
              </span>
              {restaurant.cuisineTypes?.slice(0, 3).map((c) => (
                <span key={c} className="text-xs px-2 py-1 rounded-full bg-white/20">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${restaurant.isOpen ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
              {restaurant.isOpen ? "● Open Now" : "● Closed"}
            </span>
            {restaurant.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm">
                <IoStar />
                {restaurant.averageRating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHero;
