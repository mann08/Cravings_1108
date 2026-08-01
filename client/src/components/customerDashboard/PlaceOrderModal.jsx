import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import { FaStore, FaTimes, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";

const PlaceOrderModal = ({ onClose, onOrderPlaced }) => {
  const [step, setStep] = useState(1); // 1: pick restaurant, 2: browse menu, 3: confirm
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [cart, setCart] = useState({}); // { itemId: { item, qty } }
  const [searchMenu, setSearchMenu] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [restRes, addrRes] = await Promise.all([
          api.get("/customer/restaurants"),
          api.get("/customer/addresses"),
        ]);
        setRestaurants(restRes.data.data || []);
        const addrs = addrRes.data.data || [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else if (addrs.length) setSelectedAddressId(addrs[0]._id);
      } catch {
        toast.error("Failed to load restaurants");
      } finally {
        setLoadingRestaurants(false);
      }
    };
    load();
  }, []);

  const selectRestaurant = async (rest) => {
    setSelectedRestaurant(rest);
    setLoadingMenu(true);
    setStep(2);
    try {
      const res = await api.get(`/customer/restaurants/${rest._id}/menu`);
      setMenuItems(res.data.data?.menuItems || []);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoadingMenu(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item._id]: { item, qty: (prev[item._id]?.qty || 0) + 1 },
    }));
  };

  const removeFromCart = (item) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[item._id]?.qty > 1) {
        updated[item._id] = { ...updated[item._id], qty: updated[item._id].qty - 1 };
      } else {
        delete updated[item._id];
      }
      return updated;
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  const cartCount = cartItems.reduce((sum, { qty }) => sum + qty, 0);

  const categories = ["All", ...new Set(menuItems.map((i) => i.category))];
  const filteredMenu = menuItems.filter((item) => {
    const matchCat = categoryFilter === "All" || item.category === categoryFilter;
    const matchSearch = !searchMenu || item.itemName.toLowerCase().includes(searchMenu.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error("Please select a delivery address"); return; }
    if (!cartItems.length) { toast.error("Cart is empty"); return; }
    try {
      setPlacingOrder(true);
      await api.post("/customer/order", {
        restaurantId: selectedRestaurant._id,
        deliveryAddressId: selectedAddressId,
        orderItems: cartItems.map(({ item, qty }) => ({ itemId: item._id, quantity: qty })),
        paymentMethod: "upi",
      });
      toast.success("🎉 Order placed successfully!");
      onOrderPlaced();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center gap-2">
            <MdRestaurantMenu className="text-xl text-(--color-primary)" />
            <h2 className="font-bold text-base text-(--color-primary)">
              {step === 1 ? "Select a Restaurant" : step === 2 ? selectedRestaurant?.restaurantName : "Confirm Order"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {step === 2 && cartCount > 0 && (
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 bg-(--color-primary) text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow"
              >
                <FaShoppingCart /> Cart ({cartCount}) — ₹{cartTotal}
              </button>
            )}
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="text-xs text-(--color-secondary) font-semibold hover:text-(--color-primary)">← Back</button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><FaTimes className="text-xl" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Restaurant list */}
          {step === 1 && (
            loadingRestaurants ? <LoadingSpinner message="Loading restaurants..." /> :
            restaurants.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-12">No active restaurants available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {restaurants.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => selectRestaurant(r)}
                    className="text-left bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-(--color-primary) rounded-xl p-3 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={r.coverImage?.url || `https://placehold.co/100x100/F97316/ffffff?text=${encodeURIComponent(r.restaurantName.charAt(0))}`}
                        alt={r.restaurantName}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 group-hover:text-(--color-primary) truncate">{r.restaurantName}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{r.cuisineTypes?.join(", ")}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{r.city}</span>
                          <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${r.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {r.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {/* Step 2: Menu */}
          {step === 2 && (
            loadingMenu ? <LoadingSpinner message="Loading menu..." /> : (
              <div className="space-y-3">
                {/* Search & Category */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchMenu}
                      onChange={(e) => setSearchMenu(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        categoryFilter === cat ? "bg-(--color-primary) text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {filteredMenu.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No items available.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredMenu.map((item) => (
                      <div key={item._id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <img
                          src={item.image?.url || `https://placehold.co/80x80/F97316/ffffff?text=${encodeURIComponent(item.itemName.charAt(0))}`}
                          alt={item.itemName}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">{item.itemName}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                          <p className="font-bold text-(--color-primary) text-sm mt-0.5">₹{item.price}</p>
                        </div>
                        {cart[item._id] ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => removeFromCart(item)} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-xs hover:bg-red-100 hover:text-red-600">
                              <FaMinus />
                            </button>
                            <span className="font-bold text-sm w-5 text-center">{cart[item._id].qty}</span>
                            <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-(--color-primary) text-white rounded-full text-xs hover:bg-orange-700">
                              <FaPlus />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="flex items-center gap-1 bg-(--color-primary) text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <FaPlus className="text-xxs" /> Add
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Cart items */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-gray-700">Order Summary</h3>
                {cartItems.map(({ item, qty }) => (
                  <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.itemName}</p>
                      <p className="text-xs text-gray-400">₹{item.price} × {qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">₹{item.price * qty}</p>
                      <button onClick={() => { const c = { ...cart }; delete c[item._id]; setCart(c); }} className="text-red-400 hover:text-red-600"><FaTrash className="text-xs" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Summary */}
              <div className="bg-orange-50 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-600">Item Total</span><span className="font-semibold">₹{cartTotal}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="font-semibold">₹{cartTotal < 200 ? 40 : 20}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">GST (5%)</span><span className="font-semibold">₹{Math.round(cartTotal * 0.05)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Platform Fee</span><span className="font-semibold">₹7</span></div>
                <div className="flex justify-between pt-2 border-t border-orange-200 font-bold text-sm"><span>Total</span><span className="text-(--color-primary)">₹{cartTotal + (cartTotal < 200 ? 40 : 20) + Math.round(cartTotal * 0.05) + 7}</span></div>
              </div>

              {/* Address Selection */}
              <div>
                <h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-1.5"><FaMapMarkerAlt className="text-(--color-primary)" /> Delivery Address</h3>
                {addresses.length === 0 ? (
                  <p className="text-xs text-red-500">No addresses saved. Please add an address in settings.</p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label key={addr._id} className={`flex items-start gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr._id ? "border-(--color-primary) bg-orange-50" : "border-gray-200"}`}>
                        <input type="radio" name="deliveryAddr" value={addr._id} checked={selectedAddressId === addr._id} onChange={() => setSelectedAddressId(addr._id)} className="mt-1 accent-(--color-primary)" />
                        <div>
                          <p className="font-bold text-xs">{addr.name} <span className="font-normal text-gray-400 capitalize">({addr.addressType})</span></p>
                          <p className="text-xs text-gray-500">{addr.address}, {addr.city} — {addr.pinCode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 3 && (
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg">← Edit Cart</button>
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId}
              className="px-5 py-2 bg-(--color-primary) text-white text-xs font-bold rounded-lg shadow hover:bg-orange-700 transition-colors disabled:opacity-60"
            >
              {placingOrder ? "Placing Order..." : "🍽️ Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrderModal;
