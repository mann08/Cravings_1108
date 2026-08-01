import React from "react";
import loader from "../assets/runningLoader.gif";

const Loader = ({ height, width }) => {
  return (
    <div className="flex items-center justify-center" style={{ height: height || "100%", width: width || "100%" }}>
      <img src={loader} alt="Loading..." className="w-24 h-24" />
    </div>
  );
};

export default Loader;
