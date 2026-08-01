import React from "react";

const NoDataFound = ({ height, width, text }) => {
  return (
    <div className="flex items-center justify-center" style={{ height: height || "100%", width: width || "100%" }}>
      <div className="text-center px-4">
        <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-4xl">
          😔
        </div>
        <p className="text-lg font-semibold text-slate-700">{text || "No data found."}</p>
      </div>
    </div>
  );
};

export default NoDataFound;
