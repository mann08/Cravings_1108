import express from "express";
import multer from "multer";
import {
  RestaurantUpdateProfile,
  updateRestaurantStatus,
  RestaurantGetData,
  getRestaurantDashboardStats,
  getRestaurantOrders,
  updateRestaurantOrderStatus,
  getRestaurantMenu,
  addRestaurantMenuItem,
  updateRestaurantMenuItem,
  deleteRestaurantMenuItem,
  toggleMenuItemAvailability,
  RestaurantUpdateAddress,
  RestaurantUpdateBankingDocument,
  RestaurantUpdateSocialLinks,
} from "../controllers/restaurant.controller.js";
import { RestaurantAuthProtect } from "../middleware/auth.middleware.js";

const upload = multer();
const router = express.Router();

router.get("/get-data", RestaurantAuthProtect, RestaurantGetData);

router.post(
  "/update-profile",
  RestaurantAuthProtect,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "restaurantImage", maxCount: 10 },
  ]),
  RestaurantUpdateProfile,
);

router.put(
  "/update-profile",
  RestaurantAuthProtect,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "restaurantImage", maxCount: 10 },
  ]),
  RestaurantUpdateProfile,
);

router.put("/update-address", RestaurantAuthProtect, RestaurantUpdateAddress);
router.patch("/status", RestaurantAuthProtect, updateRestaurantStatus);
router.put("/update-banking-document", RestaurantAuthProtect, RestaurantUpdateBankingDocument);
router.put("/update-social-links", RestaurantAuthProtect, RestaurantUpdateSocialLinks);

router.get("/dashboard-stats", RestaurantAuthProtect, getRestaurantDashboardStats);
router.get("/orders", RestaurantAuthProtect, getRestaurantOrders);
router.patch("/orders/:orderId/status", RestaurantAuthProtect, updateRestaurantOrderStatus);

router.get("/menu", RestaurantAuthProtect, getRestaurantMenu);
router.post("/menu", RestaurantAuthProtect, upload.single("image"), addRestaurantMenuItem);
router.put("/menu/:itemId", RestaurantAuthProtect, upload.single("image"), updateRestaurantMenuItem);
router.delete("/menu/:itemId", RestaurantAuthProtect, deleteRestaurantMenuItem);
router.patch("/menu/:itemId/toggle", RestaurantAuthProtect, toggleMenuItemAvailability);

export default router;
