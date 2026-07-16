import React, { useEffect, useState } from "react";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import LoadingSpinner from "../dashboard/shared/LoadingSpinner";
import ConfirmModal from "../dashboard/shared/ConfirmModal";
import EmptyState from "../dashboard/shared/EmptyState";
import { FaPlus, FaTrash, FaEdit, FaHome, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";

const CustomerAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    addressType: "home",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer/addresses");
      setAddresses(res.data.data);
    } catch (error) {
      toast.error("Failed to load address book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.patch(`/customer/addresses/${editingAddress}`, formData);
        toast.success("Address updated");
      } else {
        await api.post("/customer/addresses", formData);
        toast.success("Address added");
      }
      setIsFormOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  const startEdit = (addr) => {
    setEditingAddress(addr._id);
    setFormData({
      name: addr.name,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      country: addr.country,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setIsFormOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await api.delete(`/customer/addresses/${addressToDelete}`);
      toast.success("Address deleted");
      setIsDeleteModalOpen(false);
      setAddressToDelete(null);
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "home":
        return <FaHome className="text-xl text-(--color-primary)" />;
      case "work":
        return <FaBriefcase className="text-xl text-(--color-primary)" />;
      default:
        return <FaMapMarkerAlt className="text-xl text-(--color-primary)" />;
    }
  };

  if (loading) return <LoadingSpinner message="Loading addresses..." />;

  return (
    <div className="overflow-y-auto h-full space-y-6 pr-1">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-(--color-base-content)">Saved Addresses</h2>
        <button
          onClick={() => {
            setEditingAddress(null);
            setFormData({
              name: "",
              address: "",
              city: "",
              state: "",
              pinCode: "",
              country: "India",
              addressType: "home",
              isDefault: false,
            });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-(--color-primary) text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm shadow-sm"
        >
          <FaPlus /> Add Address
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSaveAddress} className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) shadow-sm space-y-4 max-w-lg">
          <h3 className="font-bold text-sm text-(--color-base-content)">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--color-neutral)">Full Name / Label</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. My Home, Dad's Office"
                className="w-full px-3 py-2 border border-(--color-base-300) rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--color-neutral)">Address Type</label>
              <select
                name="addressType"
                value={formData.addressType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-(--color-base-300) rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              >
                <option value="home">Home</option>
                <option value="work">Work / Office</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-(--color-neutral)">Address Line</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="Flat/House No., Building, Area, Street"
              className="w-full px-3 py-2 border border-(--color-base-300) rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1 text-(--color-neutral)">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-(--color-base-300) rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--color-neutral)">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-(--color-base-300) rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--color-neutral)">Pincode</label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-(--color-base-300) rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              id="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="w-4 h-4 accent-(--color-primary) cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs font-semibold text-(--color-neutral) cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingAddress(null);
              }}
              className="px-4 py-2 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-(--color-primary) text-white font-semibold rounded-md text-sm hover:bg-orange-700"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <EmptyState title="No saved addresses" message="Add addresses to speed up checkout." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-(--color-base-200) p-5 rounded-xl border flex gap-4 relative shadow-sm hover:shadow-md transition-shadow ${
                addr.isDefault ? "border-(--color-primary)" : "border-(--color-base-300)"
              }`}
            >
              <div className="p-3 bg-(--color-base-100) rounded-full h-fit shadow-inner">
                {getIcon(addr.addressType)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-(--color-base-content)">{addr.name}</h4>
                  {addr.isDefault && (
                    <span className="text-xxs bg-(--color-primary)/10 text-(--color-primary) font-semibold px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-(--color-neutral) leading-relaxed">
                  {addr.address}, {addr.city}, {addr.state} - {addr.pinCode}
                </p>
                <p className="text-xs text-(--color-secondary)">{addr.country}</p>
                
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => startEdit(addr)}
                    className="flex items-center gap-1 text-xs text-(--color-primary) font-semibold hover:underline"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setAddressToDelete(addr._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs text-(--color-error) font-semibold hover:underline"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Delete Address?"
        message="Are you sure you want to delete this address from your address book?"
        onConfirm={handleDeleteAddress}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setAddressToDelete(null);
        }}
        danger={true}
      />
    </div>
  );
};

export default CustomerAddresses;
