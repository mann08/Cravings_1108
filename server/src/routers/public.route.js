import express from "express";
import {
  ContactUsForm,
  getPublicRestaurants,
  getRestaurantPublicMenu,
  getRestaurantDetails,
} from "../controllers/public.controller.js";

const router = express.Router();

router.post("/contact", ContactUsForm);
router.get("/restaurants", getPublicRestaurants);
router.get("/restaurants/:restaurantId/menu", getRestaurantPublicMenu);
router.get("/restaurant-detail/:restaurantId", getRestaurantDetails);

export default router;
