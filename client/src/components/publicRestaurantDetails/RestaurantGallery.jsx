import React from "react";

const RestaurantGallery = ({ images }) => {
  if (!images?.length) return null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
      <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-[0.24em]">Gallery</h2>
      <div className="grid grid-cols-2 gap-3">
        {images.map((img, idx) => (
          <img
            key={img.publicId || idx}
            src={img.url}
            alt={`Restaurant ${idx + 1}`}
            className="w-full h-28 object-cover rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
};

export default RestaurantGallery;
