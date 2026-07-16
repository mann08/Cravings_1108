import express from "express";
import { AdminProtect } from "../middleware/auth.middleware.js";
import {
  getAdminDashboard,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  assignRider,
  getCustomers,
  updateCustomerStatus,
  getAdminRiders,
  updateRiderStatus,
  getAdminRestaurants,
  updateAdminRestaurant,
  getAdminFoods,
  getAdminReports,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", AdminProtect, getAdminDashboard);

// Orders
router.get("/orders", AdminProtect, getAdminOrders);
router.get("/orders/:orderId", AdminProtect, getAdminOrderById);
router.patch("/orders/:orderId/status", AdminProtect, updateOrderStatus);
router.patch("/orders/:orderId/assign-rider", AdminProtect, assignRider);

// Customers
router.get("/customers", AdminProtect, getCustomers);
router.patch("/customers/:userId/status", AdminProtect, updateCustomerStatus);

// Riders
router.get("/riders", AdminProtect, getAdminRiders);
router.patch("/riders/:riderId/status", AdminProtect, updateRiderStatus);

// Restaurants
router.get("/restaurants", AdminProtect, getAdminRestaurants);
router.patch("/restaurants/:restaurantId", AdminProtect, updateAdminRestaurant);

// Foods
router.get("/foods", AdminProtect, getAdminFoods);

// Reports
router.get("/reports", AdminProtect, getAdminReports);

export default router;
