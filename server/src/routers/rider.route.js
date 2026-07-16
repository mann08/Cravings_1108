import express from "express";
import { RiderProtect } from "../middleware/auth.middleware.js";
import {
  getRiderDashboard,
  toggleAvailability,
  getDeliveryRequests,
  acceptDelivery,
  rejectDelivery,
  getCurrentOrder,
  updateDeliveryStatus,
  getDeliveryHistory,
  getRiderEarnings,
  updateRiderLocation,
  updateRiderProfile,
} from "../controllers/rider.controller.js";

const router = express.Router();

router.get("/dashboard", RiderProtect, getRiderDashboard);
router.patch("/availability", RiderProtect, toggleAvailability);
router.get("/delivery-requests", RiderProtect, getDeliveryRequests);
router.patch("/orders/:orderId/accept", RiderProtect, acceptDelivery);
router.patch("/orders/:orderId/reject", RiderProtect, rejectDelivery);
router.get("/current-order", RiderProtect, getCurrentOrder);
router.patch("/orders/:orderId/status", RiderProtect, updateDeliveryStatus);
router.get("/delivery-history", RiderProtect, getDeliveryHistory);
router.get("/earnings", RiderProtect, getRiderEarnings);
router.patch("/location", RiderProtect, updateRiderLocation);
router.patch("/profile", RiderProtect, updateRiderProfile);

export default router;
