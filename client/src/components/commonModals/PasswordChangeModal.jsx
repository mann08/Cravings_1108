import React, { useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { LuLoaderCircle } from "react-icons/lu";
import api from "../../config/api.config.js";
import toast from "react-hot-toast";

const PasswordChangeModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleCloseModal = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleChangePassword = async () => {
    if (!formData.oldPassword || !formData.newPassword) {
      toast.error("Please enter all required password fields.");
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await api.patch("/common/change-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully!");
      handleCloseModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden relative">
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-(--color-primary)">
            Change Password
          </h3>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <IoIosCloseCircleOutline className="text-2xl" />
          </button>
        </header>

        <main className="p-5 space-y-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="oldPassword"
              className="text-xs font-semibold text-gray-700"
            >
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-(--color-primary)"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="newPassword"
              className="text-xs font-semibold text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-(--color-primary)"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirmNewPassword"
              className="text-xs font-semibold text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-(--color-primary)"
              disabled={isLoading}
            />
          </div>
        </main>

        <footer className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg text-xs hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            className="flex items-center gap-1.5 px-4 py-2 bg-(--color-primary) text-white font-medium rounded-lg text-xs hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LuLoaderCircle className="animate-spin text-sm" /> Updating...
              </>
            ) : (
              "Save Password"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
