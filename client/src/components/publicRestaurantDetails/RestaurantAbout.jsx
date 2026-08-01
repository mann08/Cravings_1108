import React from "react";

const RestaurantAbout = ({ description }) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
    <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-[0.24em]">About</h2>
    <p className="text-sm text-slate-600 leading-relaxed">
      {description || "No description available."}
    </p>
  </div>
);

export default RestaurantAbout;
