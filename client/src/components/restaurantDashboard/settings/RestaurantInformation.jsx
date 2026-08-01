import React, { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../config/api.config";
import toast from "react-hot-toast";
import { MdOutlineAddAPhoto, MdOutlineLockReset } from "react-icons/md";
import PasswordChangeModal from "../../commonModals/PasswordChangeModal";
import RunningLoader from "../../../assets/runningLoader.gif";

const RestaurantInformation = () => {
  const { user, setUser } = useAuth();

  // Common State variables
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
    useState(false);

  // User Profile State & Handlers
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user) {
      setProfileFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData({ ...profileFormData, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      const payload = new FormData();
      payload.append("fullName", profileFormData.fullName);
      payload.append("email", profileFormData.email.toLowerCase());
      payload.append("phone", profileFormData.phone);
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
    setProfileFormData({
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

  // Restaurant Information State & Handlers
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [loadingRestaurantError, setLoadingRestaurantError] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [editingLegal, setEditingLegal] = useState(false);
  const [isSavingLegal, setIsSavingLegal] = useState(false);
  const [legalFormData, setLegalFormData] = useState({
    legalName: "",
    companyType: "",
    panCard: "",
    gstCertificate: "",
    fssaiCertificate: "",
  });
  const [restaurantFormData, setRestaurantFormData] = useState({
    restaurantName: "",
    description: "",
    restaurantType: "both",
    cuisineTypes: "",
    isOpen: false,
    contactEmail: "",
    contactPhone: "",
    openingTime: "",
    closingTime: "",
  });

  const fetchRestaurantData = async () => {
    try {
      setIsLoadingRestaurant(true);
      const res = await api.get("/restaurant/get-data");
      const data = res.data.data?.[0] || null;
      setRestaurantData(data);
      if (data) {
        sessionStorage.setItem("cravingRestaurant", JSON.stringify(data));
        setRestaurantFormData({
          restaurantName: data.restaurantName || "",
          description: data.description || "",
          restaurantType: data.restaurantType || data.restaurantDietaryType || "both",
          cuisineTypes: data.cuisineTypes ? data.cuisineTypes.join(", ") : "",
          isOpen: data.isOpen || false,
          contactEmail: data.contactDetails?.email || "",
          contactPhone: data.contactDetails?.phone || "",
          openingTime: data.servingHours?.openingTime || "",
          closingTime: data.servingHours?.closingTime || "",
        });
        setLegalFormData({
          legalName: data.documents?.legalName || "",
          companyType: data.documents?.companyType || "",
          panCard: data.documents?.panCard || "",
          gstCertificate: data.documents?.gstCertificate || "",
          fssaiCertificate: data.documents?.fssaiCertificate || "",
        });
      }
    } catch (error) {
      setLoadingRestaurantError(
        error.response?.data?.message || "Failed to load restaurant details.",
      );
    } finally {
      setIsLoadingRestaurant(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const handleRestaurantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRestaurantFormData({
      ...restaurantFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLegalChange = (e) => {
    const { name, value } = e.target;
    setLegalFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveLegal = async () => {
    try {
      setIsSavingLegal(true);
      const res = await api.put(
        "/restaurant/update-banking-document",
        legalFormData,
      );
      setRestaurantData(res.data.data);
      setLegalFormData({
        legalName: res.data.data.documents?.legalName || "",
        companyType: res.data.data.documents?.companyType || "",
        panCard: res.data.data.documents?.panCard || "",
        gstCertificate: res.data.data.documents?.gstCertificate || "",
        fssaiCertificate: res.data.data.documents?.fssaiCertificate || "",
      });
      setEditingLegal(false);
      toast.success(res.data.message || "Legal information saved!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save legal information",
      );
    } finally {
      setIsSavingLegal(false);
    }
  };

  const handleCancelLegal = () => {
    setLegalFormData({
      legalName: restaurantData?.documents?.legalName || "",
      companyType: restaurantData?.documents?.companyType || "",
      panCard: restaurantData?.documents?.panCard || "",
      gstCertificate: restaurantData?.documents?.gstCertificate || "",
      fssaiCertificate: restaurantData?.documents?.fssaiCertificate || "",
    });
    setEditingLegal(false);
  };

  const handleSaveRestaurant = async () => {
    try {
      setIsLoading(true);

      const cuisinesArray = restaurantFormData.cuisineTypes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        restaurantName: restaurantFormData.restaurantName,
        description: restaurantFormData.description,
        restaurantType: restaurantFormData.restaurantType,
        cuisineTypes: cuisinesArray,
        isOpen: restaurantFormData.isOpen,
        contactDetails: {
          email: restaurantFormData.contactEmail,
          phone: restaurantFormData.contactPhone,
        },
        servingHours: {
          openingTime: restaurantFormData.openingTime,
          closingTime: restaurantFormData.closingTime,
        },
      };

      const res = await api.put("/restaurant/update-profile", payload);
      toast.success(res.data.message || "Restaurant information saved!");
      setRestaurantData(res.data.data);
      sessionStorage.setItem("cravingRestaurant", JSON.stringify(res.data.data));
      setEditingRestaurant(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update restaurant",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRestaurant = () => {
    if (restaurantData) {
      setRestaurantFormData({
        restaurantName: restaurantData.restaurantName || "",
        description: restaurantData.description || "",
        restaurantType:
          restaurantData.restaurantType ||
          restaurantData.restaurantDietaryType ||
          "both",
        cuisineTypes: restaurantData.cuisineTypes
          ? restaurantData.cuisineTypes.join(", ")
          : "",
        isOpen: restaurantData.isOpen || false,
        contactEmail: restaurantData.contactDetails?.email || "",
        contactPhone: restaurantData.contactDetails?.phone || "",
        openingTime: restaurantData.servingHours?.openingTime || "",
        closingTime: restaurantData.servingHours?.closingTime || "",
      });
    }
    setEditingRestaurant(false);
  };

  return (
    <>
      <div className="overflow-y-auto h-full p-2 space-y-3">
        {/* User Profile Section */}
        <div className="bg-(--color-base-100) rounded-lg p-4 flex items-center gap-4 shadow-xs">
          <div className="relative">
            <div className="w-24 h-24">
              <img
                src={
                  profilePicPreview ||
                  user?.photo?.url ||
                  "https://placehold.co/150?text=User"
                }
                alt="Profile"
                className="w-full h-full rounded-xl object-cover border-2 border-(--color-primary)"
              />
            </div>

            {editingProfile && (
              <div
                className="absolute cursor-pointer bottom-0.5 right-0.5 p-1.5 rounded-ee-xl w-fit bg-(--color-base-100) border border-(--color-primary)"
                title="Change Photo"
              >
                <label htmlFor="profilePic" className="cursor-pointer">
                  <MdOutlineAddAPhoto className="text-sm text-(--color-primary)" />
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="profilePic"
                  id="profilePic"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="flex justify-between items-center mb-3 border-b border-(--color-secondary)/30 pb-2">
              <h3 className="text-sm font-semibold text-(--color-primary)">
                Manager Profile Information
              </h3>
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
                <div className="flex gap-2 justify-end">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileFormData.fullName}
                  onChange={handleProfileChange}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingProfile ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingProfile}
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileChange}
                  className="w-full px-2 py-1 border border-(--color-secondary)/40 bg-(--color-base-200) cursor-not-allowed rounded text-sm mt-0.5"
                  disabled
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileFormData.phone}
                  onChange={handleProfileChange}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingProfile ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingProfile}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Information Section */}
        {isLoadingRestaurant ? (
          <div className="flex flex-col justify-center items-center h-48 bg-(--color-base-100) rounded-lg p-4">
            <img src={RunningLoader} alt="Loading..." className="w-24 h-24" />
            <span className="text-sm text-(--color-primary) font-semibold mt-2 animate-pulse">
              Loading Restaurant Details...
            </span>
          </div>
        ) : loadingRestaurantError ? (
          <div className="flex flex-col justify-center items-center h-32 bg-(--color-base-100) rounded-lg p-4">
            <span className="text-sm text-(--color-error) font-semibold">
              {loadingRestaurantError}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-(--color-base-100) rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-(--color-secondary)/30 pb-2">
              <h3 className="text-sm font-semibold text-(--color-primary)">
                Restaurant General Information
              </h3>

              {!editingRestaurant ? (
                <button
                  onClick={() => setEditingRestaurant(true)}
                  className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs hover:opacity-90 transition-opacity"
                >
                  <MdEdit /> Edit Info
                </button>
              ) : (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSaveRestaurant}
                    className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelRestaurant}
                    className="flex items-center gap-1.5 bg-(--color-secondary) text-white px-2.5 py-1 rounded text-xs"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={restaurantFormData.restaurantName}
                  onChange={handleRestaurantChange}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingRestaurant}
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Restaurant Dietary Type
                </label>
                <select
                  name="restaurantType"
                  value={restaurantFormData.restaurantType}
                  onChange={handleRestaurantChange}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingRestaurant}
                >
                  <option value="both">Both (Veg & Non-Veg)</option>
                  <option value="veg">Pure Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="jain">Jain</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Cuisine Types{" "}
                  <span className="font-normal text-(--color-secondary)">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  name="cuisineTypes"
                  value={restaurantFormData.cuisineTypes}
                  onChange={handleRestaurantChange}
                  placeholder="e.g. Indian, Chinese, Italian"
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingRestaurant}
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={restaurantFormData.contactEmail}
                  onChange={handleRestaurantChange}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingRestaurant}
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={restaurantFormData.contactPhone}
                  onChange={handleRestaurantChange}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  disabled={!editingRestaurant}
                />
              </div>

              <div className="w-full grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-(--color-neutral)">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    name="openingTime"
                    value={restaurantFormData.openingTime}
                    onChange={handleRestaurantChange}
                    className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                    disabled={!editingRestaurant}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-(--color-neutral)">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    name="closingTime"
                    value={restaurantFormData.closingTime}
                    onChange={handleRestaurantChange}
                    className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                    disabled={!editingRestaurant}
                  />
                </div>
              </div>

              <div className="w-full col-span-1 md:col-span-3">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Description
                </label>
                <textarea
                  name="description"
                  value={restaurantFormData.description}
                  onChange={handleRestaurantChange}
                  rows={3}
                  placeholder="Tell customers about your restaurant..."
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingRestaurant ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5 resize-none`}
                  disabled={!editingRestaurant}
                />
              </div>
            </div>
            </div>

            <div className="bg-(--color-base-100) rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-(--color-secondary)/30 pb-2">
              <h3 className="text-sm font-semibold text-(--color-primary)">
                Legal Information
              </h3>
              {!editingLegal ? (
                <button
                  onClick={() => setEditingLegal(true)}
                  className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs hover:opacity-90 transition-opacity"
                >
                  <MdEdit /> Edit Legal Info
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLegal}
                    disabled={isSavingLegal}
                    className="bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs"
                  >
                    {isSavingLegal ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelLegal}
                    disabled={isSavingLegal}
                    className="bg-(--color-secondary) text-white px-2.5 py-1 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                ["legalName", "Legal Name", "e.g. Cravings Foods Pvt. Ltd."],
                ["panCard", "PAN Card Number", "e.g. ABCDE1234F"],
                ["gstCertificate", "GST Number", "e.g. 23AAAAA0000A1Z5"],
                ["fssaiCertificate", "FSSAI License Number", "e.g. 10019022009876"],
              ].map(([name, label, placeholder]) => (
                <div className="w-full" key={name}>
                  <label className="text-xs font-semibold text-(--color-neutral)">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={legalFormData[name]}
                    onChange={handleLegalChange}
                    placeholder={placeholder}
                    disabled={!editingLegal}
                    className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingLegal ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                  />
                </div>
              ))}
              <div className="w-full">
                <label className="text-xs font-semibold text-(--color-neutral)">
                  Company Type
                </label>
                <select
                  name="companyType"
                  value={legalFormData.companyType}
                  onChange={handleLegalChange}
                  disabled={!editingLegal}
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingLegal ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                >
                  <option value="">Select company type</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="private-limited">Private Limited</option>
                  <option value="llp">LLP</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            </div>
          </div>
        )}
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

export default RestaurantInformation;
