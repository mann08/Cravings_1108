import express from "express";
import { CustomerProtect } from "../middleware/auth.middleware.js";
import {
  getCustomerDashboard,
  getCustomerOrders,
  getCustomerOrderById,
  cancelCustomerOrder,
  reviewOrder,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../controllers/customer.controller.js";

const router = express.Router();

// All routes protected by CustomerProtect
router.get("/dashboard", CustomerProtect, getCustomerDashboard);

router.get("/orders", CustomerProtect, getCustomerOrders);
router.get("/orders/:orderId", CustomerProtect, getCustomerOrderById);
router.patch("/orders/:orderId/cancel", CustomerProtect, cancelCustomerOrder);
router.post("/orders/:orderId/review", CustomerProtect, reviewOrder);

router.get("/addresses", CustomerProtect, getAddresses);
router.post("/addresses", CustomerProtect, addAddress);
router.patch("/addresses/:addressId", CustomerProtect, updateAddress);
router.delete("/addresses/:addressId", CustomerProtect, deleteAddress);

router.get("/favourites", CustomerProtect, getFavourites);
router.post("/favourites/:itemId", CustomerProtect, addFavourite);
router.delete("/favourites/:itemId", CustomerProtect, removeFavourite);

export default router;
