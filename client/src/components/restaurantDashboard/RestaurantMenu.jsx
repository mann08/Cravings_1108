import React, { useEffect, useState } from "react";
import api from "../../config/api.config.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import EmptyState from "../dashboard/shared/EmptyState";
import ConfirmModal from "../dashboard/shared/ConfirmModal";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSearch, FaStar, FaTag } from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";

const CATEGORIES = ["All", "Starters", "Main Course", "Breads & Rice", "Desserts", "Beverages", "Snacks", "Soups", "Salads"];

const defaultForm = {
  itemName: "",
  description: "",
  price: "",
  category: "Main Course",
  isRecommended: false,
  isTopRated: false,
  isNew: true,
};

const RestaurantMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get("/restaurant/menu");
      setMenuItems(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      price: item.price,
      category: item.category,
      isRecommended: item.isRecommended || false,
      isTopRated: item.isTopRated || false,
      isNew: item.isNew || false,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!formData.itemName || !formData.description || !formData.price || !formData.category) {
      toast.error("All fields are required");
      return;
    }
    try {
      setIsSaving(true);
      if (editingItem) {
        const res = await api.put(`/restaurant/menu/${editingItem._id}`, formData);
        setMenuItems(res.data.data);
        toast.success("Item updated!");
      } else {
        const res = await api.post("/restaurant/menu", formData);
        setMenuItems(res.data.data);
        toast.success("Item added to menu!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (itemId, currentState) => {
    try {
      const res = await api.patch(`/restaurant/menu/${itemId}/toggle`);
      setMenuItems(res.data.data);
      toast.success(currentState ? "Item marked unavailable" : "Item marked available");
    } catch (err) {
      toast.error("Failed to toggle availability");
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await api.delete(`/restaurant/menu/${itemToDelete._id}`);
      setMenuItems(res.data.data);
      toast.success("Item deleted");
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchSearch = !searchQuery || item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <LoadingSpinner message="Loading your menu..." />;

  return (
    <div className="overflow-y-auto h-full space-y-4 pr-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MdRestaurantMenu className="text-2xl text-(--color-primary)" />
          <h2 className="text-xl font-bold text-(--color-base-content)">Menu Management</h2>
          <span className="bg-(--color-primary)/10 text-(--color-primary) text-xs font-bold px-2 py-0.5 rounded-full">
            {menuItems.length} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--color-secondary) text-xs" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1.5 border border-(--color-base-300) rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-(--color-primary) bg-white"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-(--color-primary) text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors shadow-sm"
          >
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              categoryFilter === cat
                ? "bg-(--color-primary) text-white shadow-sm"
                : "bg-(--color-base-200) text-(--color-neutral) hover:bg-(--color-base-300)"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No menu items found"
          message={
            menuItems.length === 0
              ? "Your menu is empty. Add your first item!"
              : "No items match your filter."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`bg-(--color-base-200) rounded-xl border shadow-sm overflow-hidden transition-all ${
                item.isAvailable
                  ? "border-(--color-base-300)"
                  : "border-red-200 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={item.image?.url || `https://placehold.co/400x200/F97316/ffffff?text=${encodeURIComponent(item.itemName)}`}
                  alt={item.itemName}
                  className="w-full h-32 object-cover"
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {item.isNew && (
                    <span className="bg-blue-500 text-white text-xxs font-bold px-1.5 py-0.5 rounded">NEW</span>
                  )}
                  {item.isTopRated && (
                    <span className="bg-yellow-500 text-white text-xxs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <FaStar className="text-xxs" /> TOP
                    </span>
                  )}
                  {item.isRecommended && (
                    <span className="bg-green-500 text-white text-xxs font-bold px-1.5 py-0.5 rounded">REC</span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                      item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isAvailable ? "In Stock" : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-(--color-base-content) leading-tight">{item.itemName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FaTag className="text-xxs text-(--color-secondary)" />
                      <span className="text-xxs text-(--color-secondary)">{item.category}</span>
                    </div>
                  </div>
                  <p className="font-extrabold text-(--color-primary) text-sm shrink-0">₹{item.price}</p>
                </div>
                <p className="text-xxs text-(--color-neutral) leading-relaxed line-clamp-2">{item.description}</p>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-(--color-base-300)/50">
                  <button
                    onClick={() => handleToggle(item._id, item.isAvailable)}
                    className={`text-xl transition-transform active:scale-95 ${
                      item.isAvailable ? "text-(--color-success)" : "text-gray-400"
                    }`}
                    title={item.isAvailable ? "Mark unavailable" : "Mark available"}
                  >
                    {item.isAvailable ? <FaToggleOn /> : <FaToggleOff />}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="bg-(--color-base-300) text-(--color-neutral) px-2 py-1 rounded text-xs hover:bg-(--color-primary) hover:text-white transition-colors flex items-center gap-1"
                    >
                      <FaEdit className="text-xxs" /> Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="bg-red-50 text-red-500 px-2 py-1 rounded text-xs hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <FaTrash className="text-xxs" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-orange-50">
              <h3 className="font-bold text-lg text-(--color-primary)">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-700">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleFormChange}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full mt-0.5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="e.g. 280"
                    min="0"
                    className="w-full mt-0.5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full mt-0.5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe the dish..."
                  rows={3}
                  className="w-full mt-0.5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) resize-none"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleFormChange}
                    className="accent-(--color-primary)"
                  />
                  New Item
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isRecommended"
                    checked={formData.isRecommended}
                    onChange={handleFormChange}
                    className="accent-(--color-primary)"
                  />
                  Recommended
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isTopRated"
                    checked={formData.isTopRated}
                    onChange={handleFormChange}
                    className="accent-(--color-primary)"
                  />
                  Top Rated
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg text-xs hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-(--color-primary) text-white font-medium rounded-lg text-xs hover:bg-orange-700 transition-colors shadow"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingItem ? "Update Item" : "Add to Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Menu Item"
        message={`Are you sure you want to remove "${itemToDelete?.itemName}" from your menu? This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => { setIsDeleteOpen(false); setItemToDelete(null); }}
      />
    </div>
  );
};

export default RestaurantMenu;
