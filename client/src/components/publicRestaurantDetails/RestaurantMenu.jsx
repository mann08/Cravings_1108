import React, { useMemo, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { foodTypeDot } from "./helpers";

const RestaurantMenu = ({ menuItems }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFoodType, setActiveFoodType] = useState("All");

  const activeItems = useMemo(
    () =>
      (menuItems || []).filter(
        (item) => !item.isDeleted && item.status !== "discontinued",
      ),
    [menuItems],
  );

  const categories = useMemo(() => {
    const cats = [...new Set(activeItems.map((i) => i.category || "Other"))];
    return ["All", ...cats];
  }, [activeItems]);

  const foodTypes = useMemo(() => {
    const types = [...new Set(activeItems.map((i) => i.foodType || "Unknown"))];
    return ["All", ...types];
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    return activeItems.filter((item) => {
      const lowerSearch = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        item.itemName?.toLowerCase().includes(lowerSearch) ||
        item.description?.toLowerCase().includes(lowerSearch);
      const matchCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchFoodType =
        activeFoodType === "All" || item.foodType === activeFoodType;
      return matchSearch && matchCategory && matchFoodType;
    });
  }, [activeItems, searchQuery, activeCategory, activeFoodType]);

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MdOutlineRestaurantMenu /> Menu
            </h2>
            <p className="text-sm text-slate-500">{activeItems.length} items available</p>
          </div>
          <div className="relative max-w-sm w-full">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-300 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {foodTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFoodType(type)}
              className={`text-xs px-3 py-1 rounded-full transition ${
                activeFoodType === type
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full transition ${
                activeCategory === cat
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <p className="text-sm font-semibold">No items found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <div key={item._id || item.itemName} className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                <div className="relative h-44 bg-slate-200">
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <MdOutlineRestaurantMenu className="text-4xl" />
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 w-3 h-3 rounded-full border-2 border-white ${foodTypeDot(item.foodType)}`}
                    title={item.foodType}
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{item.itemName}</h3>
                      <p className="text-xs uppercase tracking-[0.18em] text-orange-600 font-semibold mt-1">
                        {item.category || "Main"}
                      </p>
                    </div>
                    <span className="text-base font-bold text-slate-900">₹{item.price}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {item.description || "Delicious dish from the kitchen."}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${item.status === "unavailable" ? "text-rose-600" : "text-emerald-700"}`}>
                      {item.status || (item.isAvailable ? "Available" : "Unavailable")}
                    </span>
                    <button className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 hover:text-orange-800 transition">
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
