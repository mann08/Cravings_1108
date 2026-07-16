import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
    <div className="w-10 h-10 border-4 border-(--color-base-300) border-t-(--color-primary) rounded-full animate-spin" />
    <p className="text-(--color-secondary) text-sm">{message}</p>
  </div>
);

export default LoadingSpinner;
