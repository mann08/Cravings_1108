import React, { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../config/api.config";
import toast from "react-hot-toast";
import RunningLoader from "../../../assets/runningLoader.gif";

const RestaurantCoreDetails = () => {
  const { user } = useAuth();

  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [loadingRestaurantError, setLoadingRestaurantError] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);

  // Address Section State
  const [editingAddress, setEditingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
    geoLat: "",
    geoLon: "",
  });

  // Banking & Document Section State
  const [editingBanking, setEditingBanking] = useState(false);
  const [bankingForm, setBankingForm] = useState({
    legalName: "",
    companyType: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    panCard: "",
    gstCertificate: "",
    fssaiCertificate: "",
  });

  // Social Media Links State
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);

  // General loader state
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingBanking, setIsSavingBanking] = useState(false);
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  const fetchRestaurantData = async () => {
    try {
      setIsLoadingRestaurant(true);
      const res = await api.get("/restaurant/get-data");
      const data = res.data.data?.[0] || null;
      setRestaurantData(data);

      if (data) {
        setAddressForm({
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pinCode: data.pinCode || "",
          country: data.country || "",
          geoLat: data.geoLocation?.lat || "",
          geoLon: data.geoLocation?.lon || "",
        });

        setBankingForm({
          legalName: data.documents?.legalName || "",
          companyType: data.documents?.companyType || "",
          bankName: data.financialDetails?.bankName || "",
          accountNumber: data.financialDetails?.accountNumber || "",
          ifscCode: data.financialDetails?.ifscCode || "",
          panCard: data.documents?.panCard || "",
          gstCertificate: data.documents?.gstCertificate || "",
          fssaiCertificate: data.documents?.fssaiCertificate || "",
        });

        setSocialMediaLinks(data.socialMediaLinks || []);
      }
    } catch (error) {
      setLoadingRestaurantError(
        error.response?.data?.message ||
          "Error fetching restaurant details. Please try again.",
      );
    } finally {
      setIsLoadingRestaurant(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  // --- Handlers: Address ---
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddressForm((prev) => ({
          ...prev,
          geoLat: position.coords.latitude.toString(),
          geoLon: position.coords.longitude.toString(),
        }));
        setIsGettingLocation(false);
        toast.success("Location acquired!");
      },
      (err) => {
        setIsGettingLocation(false);
        toast.error("Could not retrieve current location");
      },
    );
  };

  const handleSaveAddress = async () => {
    try {
      setIsSavingAddress(true);
      const res = await api.put("/restaurant/update-address", addressForm);
      toast.success(res.data.message || "Address updated successfully!");
      setRestaurantData(res.data.data);
      setEditingAddress(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save restaurant address",
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    if (restaurantData) {
      setAddressForm({
        address: restaurantData.address || "",
        city: restaurantData.city || "",
        state: restaurantData.state || "",
        pinCode: restaurantData.pinCode || "",
        country: restaurantData.country || "",
        geoLat: restaurantData.geoLocation?.lat || "",
        geoLon: restaurantData.geoLocation?.lon || "",
      });
    }
    setEditingAddress(false);
  };

  // --- Handlers: Banking & Document ---
  const handleBankingChange = (e) => {
    const { name, value } = e.target;
    setBankingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBanking = async () => {
    try {
      setIsSavingBanking(true);
      const res = await api.put(
        "/restaurant/update-banking-document",
        bankingForm,
      );
      toast.success(
        res.data.message || "Banking and documents updated successfully!",
      );
      setRestaurantData(res.data.data);
      setEditingBanking(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update banking details",
      );
    } finally {
      setIsSavingBanking(false);
    }
  };

  const handleCancelBanking = () => {
    if (restaurantData) {
      setBankingForm({
        legalName: restaurantData.documents?.legalName || "",
        companyType: restaurantData.documents?.companyType || "",
        bankName: restaurantData.financialDetails?.bankName || "",
        accountNumber: restaurantData.financialDetails?.accountNumber || "",
        ifscCode: restaurantData.financialDetails?.ifscCode || "",
        panCard: restaurantData.documents?.panCard || "",
        gstCertificate: restaurantData.documents?.gstCertificate || "",
        fssaiCertificate: restaurantData.documents?.fssaiCertificate || "",
      });
    }
    setEditingBanking(false);
  };

  // --- Handlers: Social Media Links ---
  const handleSocialMediaChange = (index, field, value) => {
    const updated = socialMediaLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link,
    );
    setSocialMediaLinks(updated);
  };

  const addSocialMediaLink = () => {
    setSocialMediaLinks([...socialMediaLinks, { platform: "", url: "" }]);
    setEditingSocial(true);
  };

  const removeSocialMediaLink = (index) => {
    setSocialMediaLinks(socialMediaLinks.filter((_, i) => i !== index));
  };

  const handleSaveSocial = async () => {
    try {
      setIsSavingSocial(true);
      const validLinks = socialMediaLinks.filter(
        (l) => l.platform.trim() && l.url.trim(),
      );
      const res = await api.put("/restaurant/update-social-links", {
        socialMediaLinks: validLinks,
      });
      toast.success(
        res.data.message || "Social media links updated successfully!",
      );
      setRestaurantData(res.data.data);
      setEditingSocial(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update social links",
      );
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleCancelSocial = () => {
    if (restaurantData) {
      setSocialMediaLinks(restaurantData.socialMediaLinks || []);
    }
    setEditingSocial(false);
  };

  if (isLoadingRestaurant) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-(--color-base-100) rounded-lg p-4">
        <img src={RunningLoader} alt="Loading..." className="w-32 h-32" />
        <span className="text-sm text-(--color-primary) font-semibold mt-2 animate-pulse">
          Fetching Restaurant Core Details...
        </span>
      </div>
    );
  }

  if (loadingRestaurantError) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-(--color-base-100) rounded-lg p-4">
        <span className="text-sm text-(--color-error) font-semibold">
          {loadingRestaurantError}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full p-2 space-y-3">
      {/* Address Information Card */}
      <div className="bg-(--color-base-100) rounded-lg p-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-(--color-secondary)/30 pb-2 mb-3">
          <h3 className="text-sm font-semibold text-(--color-primary)">
            Location & Address
          </h3>

          {!editingAddress ? (
            <button
              onClick={() => setEditingAddress(true)}
              className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs hover:opacity-90 transition-opacity"
            >
              <MdEdit /> Edit Address
            </button>
          ) : (
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleGetLocation}
                className="flex items-center gap-1 bg-(--color-secondary) text-white px-2 py-1 rounded text-xs"
                disabled={isGettingLocation}
              >
                {isGettingLocation ? "Locating..." : "📍 Get Location"}
              </button>
              <button
                onClick={handleSaveAddress}
                className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs"
                disabled={isSavingAddress}
              >
                {isSavingAddress ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancelAddress}
                className="flex items-center gap-1.5 bg-(--color-secondary) text-white px-2.5 py-1 rounded text-xs"
                disabled={isSavingAddress}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              Legal Business Name
            </label>
            <input
              type="text"
              name="legalName"
              value={bankingForm.legalName}
              onChange={handleBankingChange}
              placeholder="e.g. Cravings Foods Pvt. Ltd."
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              Company Type
            </label>
            <select
              name="companyType"
              value={bankingForm.companyType}
              onChange={handleBankingChange}
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            >
              <option value="">Select company type</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="private-limited">Private Limited</option>
              <option value="llp">LLP</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              Address Street
            </label>
            <input
              type="text"
              name="address"
              value={addressForm.address}
              onChange={handleAddressChange}
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingAddress ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingAddress}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              City
            </label>
            <input
              type="text"
              name="city"
              value={addressForm.city}
              onChange={handleAddressChange}
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingAddress ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingAddress}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              State
            </label>
            <input
              type="text"
              name="state"
              value={addressForm.state}
              onChange={handleAddressChange}
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingAddress ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingAddress}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              Pin Code
            </label>
            <input
              type="text"
              name="pinCode"
              value={addressForm.pinCode}
              onChange={handleAddressChange}
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingAddress ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingAddress}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={addressForm.country}
              onChange={handleAddressChange}
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingAddress ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingAddress}
            />
          </div>

          <div className="w-full grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-(--color-neutral)">
                Latitude
              </label>
              <input
                type="text"
                name="geoLat"
                value={addressForm.geoLat}
                onChange={handleAddressChange}
                placeholder="e.g. 23.2599"
                className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingAddress ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                disabled={!editingAddress}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-(--color-neutral)">
                Longitude
              </label>
              <input
                type="text"
                name="geoLon"
                value={addressForm.geoLon}
                onChange={handleAddressChange}
                placeholder="e.g. 77.4126"
                className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingAddress ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
                disabled={!editingAddress}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banking and Document Section Card */}
      <div className="bg-(--color-base-100) rounded-lg p-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-(--color-secondary)/30 pb-2 mb-3">
          <h3 className="text-sm font-semibold text-(--color-primary)">
            Banking & Regulatory Certificates
          </h3>

          {!editingBanking ? (
            <button
              onClick={() => setEditingBanking(true)}
              className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs hover:opacity-90 transition-opacity"
            >
              <MdEdit /> Edit Details
            </button>
          ) : (
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSaveBanking}
                className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs"
                disabled={isSavingBanking}
              >
                {isSavingBanking ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancelBanking}
                className="flex items-center gap-1.5 bg-(--color-secondary) text-white px-2.5 py-1 rounded text-xs"
                disabled={isSavingBanking}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={bankingForm.bankName}
              onChange={handleBankingChange}
              placeholder="e.g. HDFC Bank"
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={bankingForm.accountNumber}
              onChange={handleBankingChange}
              placeholder="e.g. 5010023456789"
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifscCode"
              value={bankingForm.ifscCode}
              onChange={handleBankingChange}
              placeholder="e.g. HDFC0001234"
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              PAN Card Number
            </label>
            <input
              type="text"
              name="panCard"
              value={bankingForm.panCard}
              onChange={handleBankingChange}
              placeholder="e.g. ABCDE1234F"
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              GST Number
            </label>
            <input
              type="text"
              name="gstCertificate"
              value={bankingForm.gstCertificate}
              onChange={handleBankingChange}
              placeholder="e.g. 23AAAAA0000A1Z5"
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-(--color-neutral)">
              FSSAI License Number
            </label>
            <input
              type="text"
              name="fssaiCertificate"
              value={bankingForm.fssaiCertificate}
              onChange={handleBankingChange}
              placeholder="e.g. 10019022009876"
              className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingBanking ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm mt-0.5`}
              disabled={!editingBanking}
            />
          </div>
        </div>
      </div>

      {/* Social Media Links Card */}
      <div className="bg-(--color-base-100) rounded-lg p-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-(--color-secondary)/30 pb-2 mb-3">
          <h3 className="text-sm font-semibold text-(--color-primary)">
            Social Media Handles
          </h3>

          {!editingSocial ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addSocialMediaLink}
                className="text-xs bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded"
              >
                + Add Link
              </button>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={addSocialMediaLink}
                className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
              >
                + Add Row
              </button>
              <button
                onClick={handleSaveSocial}
                className="flex items-center gap-1.5 bg-(--color-primary) text-(--color-primary-content) px-2.5 py-1 rounded text-xs"
                disabled={isSavingSocial}
              >
                {isSavingSocial ? "Saving..." : "Save Links"}
              </button>
              <button
                onClick={handleCancelSocial}
                className="flex items-center gap-1.5 bg-(--color-secondary) text-white px-2.5 py-1 rounded text-xs"
                disabled={isSavingSocial}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {socialMediaLinks.map((link, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
            >
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Platform (e.g. Instagram)"
                  value={link.platform}
                  onChange={(e) =>
                    handleSocialMediaChange(index, "platform", e.target.value)
                  }
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingSocial ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm`}
                  disabled={!editingSocial}
                />
              </div>
              <div className="md:col-span-3 flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={link.url}
                  onChange={(e) =>
                    handleSocialMediaChange(index, "url", e.target.value)
                  }
                  className={`w-full px-2 py-1 border border-(--color-secondary)/40 ${editingSocial ? "bg-white" : "bg-(--color-base-200)"} rounded text-sm`}
                  disabled={!editingSocial}
                />

                {editingSocial && (
                  <button
                    type="button"
                    onClick={() => removeSocialMediaLink(index)}
                    className="text-red-500 text-sm font-bold px-2 py-1 hover:bg-red-50 rounded"
                    title="Remove link"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

          {socialMediaLinks.length === 0 && (
            <p className="text-xs text-(--color-secondary) italic py-2">
              No social media links added yet. Click "+ Add Link" to add handles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCoreDetails;
