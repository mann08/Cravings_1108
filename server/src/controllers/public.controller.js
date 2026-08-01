import mongoose from "mongoose";
import Contact from "../models/contact.model.js";
import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";

export const ContactUsForm = async (req, res, next) => {
  try {
    const { fullName, email, subject, phone, message } = req.body;

    if (!fullName || !email || !phone || !subject || !message) {
      const error = new Error("All Fields are Required");
      error.statusCode = 400;
      return next(error);
    }

    await Contact.create({
      fullName,
      email,
      subject,
      phone,
      message,
    });

    return res.status(201).json({
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ status: { $ne: "blocked" } })
      .select(
        "restaurantName coverImage restaurantImage cuisineTypes restaurantType averageRating city address isOpen description status"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "Restaurants fetched successfully",
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantPublicMenu = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      const error = new Error("Invalid restaurant ID");
      error.statusCode = 400;
      return next(error);
    }

    const restaurant = await Restaurant.findById(restaurantId)
      .select(
        "restaurantName city address contactDetails averageRating restaurantType cuisineTypes coverImage description isOpen",
      )
      .lean();

    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const menu = await Menu.findOne({ restaurantId }).lean();

    res.status(200).json({
      message: "Menu fetched successfully",
      data: {
        restaurant,
        menuItems: menu ? menu.menuItems.filter((item) => item.isAvailable) : [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantDetails = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      const error = new Error("Invalid restaurant ID");
      error.statusCode = 400;
      return next(error);
    }

    const restaurant = await Restaurant.findById(restaurantId)
      .select(
        "restaurantName city address contactDetails averageRating restaurantType cuisineTypes coverImage description isOpen restaurantImage socialMediaLinks",
      )
      .lean();

    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const menu = await Menu.findOne({ restaurantId }).lean();

    res.status(200).json({
      message: "Restaurant details fetched successfully",
      data: {
        restaurant,
        menuItems: menu ? menu.menuItems.filter((item) => item.isAvailable) : [],
      },
    });
  } catch (error) {
    next(error);
  }
};
