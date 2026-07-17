import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";
import Menu from "../models/menu.model.js";
import mongoose from "mongoose";
import {
  uploadMultipleImages,
  deleteMultipleImages,
  uploadSingleImage,
  deleteSingleImage,
} from "../utils/image.service.js";

export const RestaurantGetData = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const managerId = req.query.id || currentUser._id;

    if (currentUser._id.toString() !== managerId.toString()) {
      const error = new Error("Unauthorized Access");
      error.statusCode = 401;
      return next(error);
    }

    const restaurantData = await Restaurant.findOne({ managerId });

    if (restaurantData) {
      res.status(200).json({
        message: "Restaurant Fetched Successfully",
        data: [restaurantData],
      });
    } else {
      res.status(200).json({
        message: "No restaurant Data Found",
        data: [],
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RestaurantUpdateProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const restaurantDataFromFE = req.body;
    const coverImageFromFE = req.files?.coverImage;
    const restaurantImageFromFE = req.files?.restaurantImage;

    const dataKeys = Object.keys(restaurantDataFromFE);

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      if (coverImageFromFE) {
        const coverImage = await uploadSingleImage(
          coverImageFromFE[0],
          `restaurant/${currentUser.phone}/coverPhoto`,
        );
        restaurantDataFromFE.coverImage = coverImage;
      }

      if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
        const restaurantImage = await uploadMultipleImages(
          restaurantImageFromFE,
          `restaurant/${currentUser.phone}/restaurantPhotos`,
        );
        restaurantDataFromFE.restaurantImage = restaurantImage;
      }

      const newRestaurant = await Restaurant.create({
        managerId: currentUser._id,
        ...restaurantDataFromFE,
      });
      return res.status(201).json({
        message: "Restaurant profile created successfully",
        data: newRestaurant,
      });
    } else {
      if (coverImageFromFE) {
        if (existingRestaurant.coverImage?.publicId) {
          await deleteSingleImage(existingRestaurant.coverImage);
        }
        const coverImage = await uploadSingleImage(
          coverImageFromFE[0],
          `restaurant/${currentUser.phone}/coverPhoto`,
        );
        restaurantDataFromFE.coverImage = coverImage;
      }
      if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
        if (existingRestaurant.restaurantImage?.length) {
          await deleteMultipleImages(existingRestaurant.restaurantImage);
        }
        const restaurantImage = await uploadMultipleImages(
          restaurantImageFromFE,
          `restaurant/${currentUser.phone}/restaurantPhotos`,
        );
        restaurantDataFromFE.restaurantImage = restaurantImage;
      }
      dataKeys.forEach((key) => {
        existingRestaurant[key] =
          restaurantDataFromFE[key] || existingRestaurant[key];
      });
      await existingRestaurant.save();
      return res.status(200).json({
        message: "Restaurant profile updated successfully",
        data: existingRestaurant,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /restaurant/dashboard-stats ──────────────────────────────────────────
export const getRestaurantDashboardStats = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ managerId: req.user._id });
    if (!restaurant) {
      return res.status(200).json({
        message: "Setup your restaurant profile first",
        data: { stats: { totalOrders: 0, deliveredOrders: 0, pendingOrders: 0, totalRevenue: 0 } },
      });
    }

    const [totalOrders, deliveredOrders, pendingOrders, revenueAgg] = await Promise.all([
      Order.countDocuments({ restaurantId: restaurant._id }),
      Order.countDocuments({ restaurantId: restaurant._id, orderStatus: "delivered" }),
      Order.countDocuments({ restaurantId: restaurant._id, orderStatus: "pending" }),
      Order.aggregate([
        { $match: { restaurantId: restaurant._id, orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$billDetails.finalAmount" } } },
      ]),
    ]);

    res.status(200).json({
      message: "Dashboard stats fetched successfully",
      data: {
        stats: {
          totalOrders,
          deliveredOrders,
          pendingOrders,
          totalRevenue: revenueAgg[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /restaurant/orders ───────────────────────────────────────────────────
export const getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ managerId: req.user._id });
    if (!restaurant) {
      return res.status(200).json({ message: "No restaurant found", data: [] });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { restaurantId: restaurant._id };
    if (status && status !== "all") {
      filter.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate({
          path: "customerId",
          populate: { path: "customerId", model: "user", select: "fullName phone" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Populate food items details
    for (const order of orders) {
      if (order.orderItems?.length) {
        const menuDocs = await Menu.find({
          "menuItems._id": { $in: order.orderItems.map((i) => i.itemId) },
        }).lean();
        order.orderItems = order.orderItems.map((item) => {
          let found = null;
          for (const menu of menuDocs) {
            found = menu.menuItems.find(
              (m) => m._id.toString() === item.itemId.toString()
            );
            if (found) break;
          }
          return { ...item, details: found || null };
        });
      }
    }

    res.status(200).json({
      message: "Orders fetched successfully",
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /restaurant/orders/:orderId/status ──────────────────────────────────
export const updateRestaurantOrderStatus = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ managerId: req.user._id });
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ _id: orderId, restaurantId: restaurant._id });
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully", data: order });
  } catch (error) {
    next(error);
  }
};

// ─── GET /restaurant/menu ─────────────────────────────────────────────────────
export const getRestaurantMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ managerId: req.user._id });
    if (!restaurant) {
      return res.status(200).json({ message: "No restaurant found", data: [] });
    }

    const menu = await Menu.findOne({ restaurantId: restaurant._id });
    res.status(200).json({
      message: "Menu fetched successfully",
      data: menu ? menu.menuItems : [],
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /restaurant/menu ────────────────────────────────────────────────────
export const addRestaurantMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ managerId: req.user._id });
    if (!restaurant) {
      const error = new Error("Restaurant profile required first");
      error.statusCode = 400;
      return next(error);
    }

    const { itemName, description, price, category } = req.body;
    if (!itemName || !description || !price || !category) {
      const error = new Error("All menu fields are required");
      error.statusCode = 400;
      return next(error);
    }

    let menu = await Menu.findOne({ restaurantId: restaurant._id });
    if (!menu) {
      menu = await Menu.create({ restaurantId: restaurant._id, menuItems: [] });
    }

    const photoURL = `https://placehold.co/600x400?text=${encodeURIComponent(itemName)}`;
    const image = { url: photoURL, publicId: null };

    menu.menuItems.push({
      itemName,
      description,
      price: parseFloat(price),
      category,
      image,
      isAvailable: true,
    });

    await menu.save();
    res.status(201).json({ message: "Menu item added successfully", data: menu.menuItems });
  } catch (error) {
    next(error);
  }
};
