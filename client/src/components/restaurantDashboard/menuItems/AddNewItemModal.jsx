import React, { useState, useRef } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { LuLoaderCircle, LuUpload } from "react-icons/lu";
import toast from "react-hot-toast";
import api from "../../../config/api.config";

const defaultForm = {
  itemName: "",
  description: "",
  price: "",
  category: "",
  type: "Vegetarian",
  status: "available",
  isTopRated: false,
  isRecommended: false,
  isNew: false,
  image: null,
};

const CATEGORIES = [
  "Pizza",
  "Burger",
  "Wrap",
  "Dessert",
  "Beverages",
  "Biryani",
  "Main Course",
  "Seafood",
  "Rice",
  "Starter",
  "Other",
];

const AddNewItemModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setForm(defaultForm);
    setPreview(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName.trim()) return toast.error("Item name is required.");
    if (!form.category) return toast.error("Please select a category.");
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      return toast.error("Please enter a valid price.");

    setIsLoading(true);
    try {
      const payload = {
        itemName: form.itemName.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        type: form.type,
        status: form.status,
        isTopRated: form.isTopRated,
        isRecommended: form.isRecommended,
        isNew: form.isNew,
      };

      const res = await api.post("/restaurant/menu", payload);
      toast.success("Menu item added successfully!");
      if (onAdd) {
        onAdd(res.data.data);
      }
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "border border-(--color-secondary) rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-(--color-primary) disabled:bg-gray-100";
  const labelCls = "font-semibold text-xs text-(--color-secondary) uppercase tracking-wide mb-0.5 block";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl">

        {/* ── Header ── */}
        <header className="flex justify-between items-center px-5 py-3 border-b border-(--color-secondary)">
          <h2 className="font-bold text-lg text-(--color-primary)">Add New Menu Item</h2>
          <button onClick={handleClose} type="button">
            <IoIosCloseCircleOutline className="text-red-400 hover:text-red-600 text-2xl" />
          </button>
        </header>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-3">

            {/* ROW 1 — Image (left) + Name & Description (right) */}
            <div className="grid grid-cols-[130px_1fr] gap-4">

              {/* Image upload */}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Image</label>
                <div
                  className="border-2 border-dashed border-(--color-secondary) rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-(--color-primary) transition-colors"
                  style={{ height: "130px" }}
                  onClick={() => fileRef.current.click()}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <LuUpload className="text-2xl" />
                      <span className="text-[11px]">Click to upload</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              {/* Name + Description */}
              <div className="flex flex-col gap-2">
                <div>
                  <label htmlFor="itemName" className={labelCls}>
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="itemName" name="itemName" type="text"
                    value={form.itemName} onChange={handleChange}
                    placeholder="e.g. Classic Margherita Pizza"
                    disabled={isLoading} className={inputCls}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label htmlFor="description" className={labelCls}>Description</label>
                  <textarea
                    id="description" name="description" rows={3}
                    value={form.description} onChange={handleChange}
                    placeholder="Describe your menu item..."
                    disabled={isLoading}
                    className="border border-(--color-secondary) rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* ROW 2 — Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className={labelCls}>
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="price" name="price" type="number" min="0" step="0.01"
                  value={form.price} onChange={handleChange}
                  placeholder="e.g. 299" disabled={isLoading} className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="category" className={labelCls}>
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category" name="category"
                  value={form.category} onChange={handleChange}
                  disabled={isLoading} className={inputCls}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 3 — Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className={labelCls}>Type</label>
                <select
                  id="type" name="type"
                  value={form.type} onChange={handleChange}
                  disabled={isLoading} className={inputCls}
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className={labelCls}>Status</label>
                <select
                  id="status" name="status"
                  value={form.status} onChange={handleChange}
                  disabled={isLoading} className={inputCls}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* ROW 4 — Badges */}
            <div className="flex items-center gap-6 py-1">
              <span className={labelCls + " mb-0"}>Badges:</span>
              {[
                { name: "isTopRated",   label: "Top Rated" },
                { name: "isRecommended", label: "Recommended" },
                { name: "isNew",        label: "New Item" },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox" name={name}
                    checked={form[name]} onChange={handleChange}
                    disabled={isLoading}
                    className="accent-(--color-primary) w-4 h-4"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="flex justify-end gap-3 px-5 py-3 border-t border-(--color-secondary)">
            <button
              type="button" onClick={handleClose} disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-(--color-secondary) text-white text-sm hover:opacity-80 transition-opacity"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-(--color-primary) text-white text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              {isLoading ? <><LuLoaderCircle className="animate-spin" /> Adding...</> : "Add Item"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddNewItemModal;
