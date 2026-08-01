import { FaLeaf, FaDrumstickBite, FaInstagram, FaFacebookSquare, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { IoGlobeOutline } from "react-icons/io5";

export const foodTypeDot = (foodType) => {
  if (!foodType) return "bg-gray-400";
  const ft = foodType.toLowerCase();
  if (ft.includes("non")) return "bg-red-500";
  if (ft.includes("veg") || ft.includes("vegan")) return "bg-green-500";
  return "bg-yellow-500";
};

export const restaurantTypeLabel = (type) => {
  const map = {
    veg: {
      label: "Pure Veg",
      color: "text-green-700 bg-green-100",
      icon: <FaLeaf className="text-green-500" />,
    },
    "non-veg": {
      label: "Non-Veg",
      color: "text-red-700 bg-red-100",
      icon: <FaDrumstickBite className="text-red-500" />,
    },
    vegan: {
      label: "Vegan",
      color: "text-emerald-700 bg-emerald-100",
      icon: <FaLeaf className="text-emerald-500" />,
    },
    jain: {
      label: "Jain",
      color: "text-orange-700 bg-orange-100",
      icon: <FaLeaf className="text-orange-500" />,
    },
    both: {
      label: "Veg & Non-Veg",
      color: "text-violet-700 bg-violet-100",
      icon: <MdOutlineRestaurantMenu className="text-violet-500" />,
    },
  };

  return (
    map[type] || {
      label: type || "Restaurant",
      color: "text-slate-700 bg-slate-100",
      icon: null,
    }
  );
};

export const platformIcon = (platform) => {
  const p = (platform || "").toLowerCase();
  if (p.includes("instagram")) return <FaInstagram className="text-pink-500" />;
  if (p.includes("facebook")) return <FaFacebookSquare className="text-blue-500" />;
  if (p.includes("twitter") || p.includes("x")) return <FaXTwitter className="text-slate-800" />;
  if (p.includes("youtube")) return <FaYoutube className="text-red-500" />;
  if (p.includes("whatsapp")) return <FaWhatsapp className="text-emerald-500" />;
  return <IoGlobeOutline className="text-slate-500" />;
};
