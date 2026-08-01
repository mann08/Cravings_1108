import React from "react";
import { IoGlobeOutline } from "react-icons/io5";
import { platformIcon } from "./helpers";

const RestaurantSocialLinks = ({ socialMediaLinks }) => {
  if (!socialMediaLinks?.length) return null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.24em] mb-3">Social Media</h2>
      <div className="flex flex-col gap-3">
        {socialMediaLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 text-sm text-orange-700 hover:text-orange-900 transition"
          >
            <span className="flex items-center gap-2">
              {platformIcon(link.platform)}
              <span>{link.platform || "Website"}</span>
            </span>
            <IoGlobeOutline className="text-lg" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default RestaurantSocialLinks;
