import React, { useState } from "react";
import { MdEdit } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api.config";
import toast from "react-hot-toast";
import { MdOutlineAddAPhoto, MdOutlineLockReset } from "react-icons/md";
import PasswordChangeModal from "../commonModals/PasswordChangeModal";

const RiderSetting = () => {
  const { user, setUser } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Vehicle details state
  const [vehicleForm, setVehicleForm] = useState({
    vehicleType: "",
    vehicleNumber: "",
    vehicleModel: "",
    vehicleColor: "",
  });
  const [editingVehicle, setEditingVehicle] = useState(false);

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email.toLowerCase());
      payload.append("phone", formData.phone);
      if (profilePic) {
        payload.append("displayPic", profilePic);
      }

      const response = await api.put(`/common/edit-profile`, payload);

      setUser(response.data.data);
      sessionStorage.setItem("cravingUser", JSON.stringify(response.data.data));

      setEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setProfilePicPreview(null);
    setProfilePic(null);
    setEditingProfile(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicPreview(URL.createObjectURL(file));
      setProfilePic(file);
    }
  };

  const handleSaveVehicle = async () => {
    try {
      setIsLoading(true);
      const res = await api.patch("/rider/profile", vehicleForm);
      toast.success("Vehicle details updated!");
      setEditingVehicle(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-y-auto h-full p-4 space-y-4">
        {/* Profile Section */}
        <div className="bg-(--color-base-100) rounded-lg p-4 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-(--color-secondary)/30 pb-2">
            <h3 className="text-sm font-semibold text-(--color-primary)">Profile Information</h3>
            {!editingProfile ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs hover:opacity-90 transition-opacity"
                >
                  <MdEdit /> Edit Profile
                </button>
                <button
                  onClick={() => setIsPasswordChangeModalOpen(true)}
                  className="flex items-center gap-1.5 border border-(--color-primary) text-(--color-primary) px-2.5 py-1 rounded text-xs hover:bg-(--color-primary) hover:text-(--color-primary-content) transition-colors"
                >
                  <MdOutlineLockReset /> Change Password
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelProfile}
                  className="flex items-center gap-1.5 bg-(--color-secondary) text-white px-2.5 py-1 rounded text-xs"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={profilePicPreview || user?.photo?.url || `https://placehold.co/150?text=${user?.fullName?.charAt(0) || 'R'}`}
                alt="Profile"
                className="w-20 h-20 rounded-xl object-cover border-2 border-(--color-primary)"
              />
              {editingProfile && (
                <div className="absolute cursor-pointer bottom-0.5 right-0.5 p-1.5 rounded-ee-xl w-fit bg-(--color-base-100) border border-(--color-primary)">
                  <label htmlFor="profilePicRider" className="cursor-pointer">
                    <MdOutlineAddAPhoto className="text-sm text-(--color-primary)" />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="profilePicRider"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
              <div>
                <label className="text-xs font-semibold text-(--color-neutral)">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingProfile ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingProfile}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-(--color-neutral)">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-2 py-1 border border-(--color-secondary)/40 bg-(--color-base-200) cursor-not-allowed rounded text-sm mt-0.5"
                  disabled
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-(--color-neutral)">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingProfile ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingProfile}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div className="bg-(--color-base-100) rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-(--color-secondary)/30 pb-2">
            <h3 className="text-sm font-semibold text-(--color-primary)">Vehicle Details</h3>
            {!editingVehicle ? (
              <button
                onClick={() => setEditingVehicle(true)}
                className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs hover:opacity-90 transition-opacity"
              >
                <MdEdit /> Update Vehicle
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveVehicle}
                  className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Vehicle"}
                </button>
                <button
                  onClick={() => setEditingVehicle(false)}
                  className="flex items-center gap-1.5 bg-(--color-secondary) text-white px-2.5 py-1 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Vehicle Type", name: "vehicleType", placeholder: "e.g. Motorcycle" },
              { label: "Vehicle Number", name: "vehicleNumber", placeholder: "e.g. MP09AB1234" },
              { label: "Vehicle Model", name: "vehicleModel", placeholder: "e.g. Honda Activa" },
              { label: "Vehicle Color", name: "vehicleColor", placeholder: "e.g. Red" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-semibold text-(--color-neutral)">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={vehicleForm[field.name]}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingVehicle ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingVehicle}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {isPasswordChangeModalOpen && (
        <PasswordChangeModal
          open={isPasswordChangeModalOpen}
          onClose={() => setIsPasswordChangeModalOpen(false)}
        />
      )}
    </>
  );
};

export default RiderSetting;
