import React from "react";
import { IoLocationOutline, IoTimeOutline, IoCallOutline, IoMailOutline } from "react-icons/io5";

const RestaurantInfoStrip = ({ restaurant }) => {
  const { contactDetails, address, city, state, servingHours } = restaurant;

  return (
    <div className="bg-orange-600 text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-3 flex flex-wrap gap-4 text-sm">
        {(address || city || state) && (
          <span className="flex items-center gap-2">
            <IoLocationOutline />
            {[address, city, state].filter(Boolean).join(", ")}
          </span>
        )}
        {servingHours?.openingTime && (
          <span className="flex items-center gap-2">
            <IoTimeOutline />
            {servingHours.openingTime} – {servingHours.closingTime}
          </span>
        )}
        {contactDetails?.phone && (
          <span className="flex items-center gap-2">
            <IoCallOutline />
            {contactDetails.phone}
          </span>
        )}
        {contactDetails?.email && (
          <span className="flex items-center gap-2">
            <IoMailOutline />
            {contactDetails.email}
          </span>
        )}
      </div>
    </div>
  );
};

export default RestaurantInfoStrip;
