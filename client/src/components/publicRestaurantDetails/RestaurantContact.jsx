import React from "react";
import { IoCallOutline, IoMailOutline, IoLocationOutline } from "react-icons/io5";

const RestaurantContact = ({ restaurant }) => {
  const { contactDetails, address, city, state, pinCode, country } = restaurant;
  const hasContact = contactDetails?.phone || contactDetails?.email;
  const hasAddress = address || city;

  if (!hasContact && !hasAddress) return null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.24em]">Contact & Location</h2>
      {contactDetails?.phone && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <IoCallOutline className="text-orange-600" />
          {contactDetails.phone}
        </div>
      )}
      {contactDetails?.email && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <IoMailOutline className="text-orange-600" />
          {contactDetails.email}
        </div>
      )}
      {hasAddress && (
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <IoLocationOutline className="text-orange-600 mt-0.5" />
          <span>{[address, city, state, pinCode, country].filter(Boolean).join(", ")}</span>
        </div>
      )}
    </div>
  );
};

export default RestaurantContact;
