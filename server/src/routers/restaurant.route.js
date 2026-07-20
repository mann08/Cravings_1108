import express from "express";
import multer from "multer";
import {
  RestaurantUpdateProfile,
  RestaurantGetData,
  getRestaurantDashboardStats,
  getRestaurantOrders,
  updateRestaurantOrderStatus,
  getRestaurantMenu,
  addRestaurantMenuItem,
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

router.get(
  "/dashboard-stats",
  RestaurantAuthProtect,
  getRestaurantDashboardStats,
);
router.get("/orders", RestaurantAuthProtect, getRestaurantOrders);
router.patch(
  "/orders/:orderId/status",
  RestaurantAuthProtect,
  updateRestaurantOrderStatus,
);
router.get("/menu", RestaurantAuthProtect, getRestaurantMenu);
router.post("/menu", RestaurantAuthProtect, addRestaurantMenuItem);

export default router;
