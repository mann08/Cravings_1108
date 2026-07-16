import mongoose from "mongoose";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import Rider from "../models/rider.model.js";
import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";

// ─── GET /admin/dashboard ──────────────────────────────────────────────────────
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalRiders,
      totalRestaurants,
      totalOrders,
      pendingOrders,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      revenueAgg,
      todayRevenueAgg,
      monthRevenueAgg,
      dailyOrdersAgg,
      ordersByStatusAgg,
    ] = await Promise.all([
      User.countDocuments({ userType: "customer" }),
      User.countDocuments({ userType: "rider" }),
      Restaurant.countDocuments({ status: "active" }),
      Order.countDocuments({}),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({
        orderStatus: { $in: ["accepted", "preparing", "ready", "pickedUp", "onTheWay", "outForDelivery"] },
      }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
      // Total revenue
      Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$billDetails.finalAmount" } } },
      ]),
      // Today's revenue
      Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$billDetails.finalAmount" } } },
      ]),
      // This month's revenue
      Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$billDetails.finalAmount" } } },
      ]),
      // Last 7 days daily orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: "$billDetails.finalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Orders by status
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
    ]);

    const avgOrderValue =
      totalOrders > 0 ? (revenueAgg[0]?.total || 0) / Math.max(deliveredOrders, 1) : 0;

    res.status(200).json({
      message: "Admin dashboard data fetched",
      data: {
        stats: {
          totalCustomers,
          totalRiders,
          totalRestaurants,
          totalOrders,
          pendingOrders,
          activeOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue: revenueAgg[0]?.total || 0,
          todayRevenue: todayRevenueAgg[0]?.total || 0,
          monthRevenue: monthRevenueAgg[0]?.total || 0,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        },
        charts: {
          dailyOrders: dailyOrdersAgg,
          ordersByStatus: ordersByStatusAgg,
        },
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /admin/orders ────────────────────────────────────────────────────────
export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (status && status !== "all") filter.orderStatus = status;
    if (search && mongoose.Types.ObjectId.isValid(search.trim())) {
      filter._id = new mongoose.Types.ObjectId(search.trim());
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("restaurantId", "restaurantName contactDetails")
        .populate({
          path: "customerId",
          populate: { path: "customerId", model: "user", select: "fullName email phone" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Orders fetched",
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /admin/orders/:orderId ───────────────────────────────────────────────
export const getAdminOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findById(orderId)
      .populate("restaurantId", "restaurantName contactDetails address city state coverImage")
      .populate({
        path: "customerId",
        populate: { path: "customerId", model: "user", select: "-password" },
      })
      .lean();

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    if (order.riderId) {
      const riderDoc = await Rider.findById(order.riderId)
        .populate("riderId", "fullName phone photo")
        .lean();
      order.riderInfo = riderDoc;
    }

    res.status(200).json({ message: "Order fetched", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /admin/orders/:orderId/status ──────────────────────────────────────
const VALID_STATUS_TRANSITIONS = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["pickedUp"],
  pickedUp: ["onTheWay"],
  onTheWay: ["outForDelivery", "delivered"],
  outForDelivery: ["delivered"],
  delivered: [],
  cancelled: [],
  failed: [],
  rejected: [],
  undeliverable: [],
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    const allowed = VALID_STATUS_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(status)) {
      const error = new Error(
        `Cannot transition from "${order.orderStatus}" to "${status}"`
      );
      error.statusCode = 400;
      return next(error);
    }

    order.orderStatus = status;
    await order.save();
    res.status(200).json({ message: "Order status updated", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /admin/orders/:orderId/assign-rider ────────────────────────────────
export const assignRider = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(riderId)) {
      const error = new Error("Invalid ID");
      error.statusCode = 400;
      return next(error);
    }

    const riderDoc = await Rider.findById(riderId);
    if (!riderDoc || riderDoc.status !== "active") {
      const error = new Error("Rider not available");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, riderId: { $exists: false } },
      { riderId },
      { new: true }
    );

    if (!order) {
      const error = new Error("Order already has a rider assigned or not found");
      error.statusCode = 409;
      return next(error);
    }

    res.status(200).json({ message: "Rider assigned successfully", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /admin/customers ─────────────────────────────────────────────────────
export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userFilter = { userType: "customer" };
    if (search) {
      userFilter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(userFilter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(userFilter),
    ]);

    // Attach customer profile data
    const customersWithProfile = await Promise.all(
      users.map(async (user) => {
        const profile = await Customer.findOne({ customerId: user._id }).lean();
        return { ...user, profile };
      })
    );

    res.status(200).json({
      message: "Customers fetched",
      data: customersWithProfile,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /admin/customers/:userId/status ────────────────────────────────────
export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error("Invalid user ID");
      error.statusCode = 400;
      return next(error);
    }

    const validStatuses = ["pending", "verified", "suspended"];
    if (!validStatuses.includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      return next(error);
    }

    const customerDoc = await Customer.findOneAndUpdate(
      { customerId: userId },
      { status },
      { new: true }
    );

    if (!customerDoc) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ message: "Customer status updated", data: customerDoc });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /admin/riders ────────────────────────────────────────────────────────
export const getAdminRiders = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userFilter = { userType: "rider" };
    if (search) {
      userFilter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(userFilter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(userFilter),
    ]);

    const ridersWithProfile = await Promise.all(
      users.map(async (user) => {
        const profile = await Rider.findOne({ riderId: user._id }).lean();
        return { ...user, profile };
      })
    );

    res.status(200).json({
      message: "Riders fetched",
      data: ridersWithProfile,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /admin/riders/:riderId/status ──────────────────────────────────────
export const updateRiderStatus = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(riderId)) {
      const error = new Error("Invalid rider ID");
      error.statusCode = 400;
      return next(error);
    }

    const validStatuses = ["active", "inactive", "blocked"];
    if (!validStatuses.includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      return next(error);
    }

    const riderDoc = await Rider.findByIdAndUpdate(riderId, { status }, { new: true });
    if (!riderDoc) {
      const error = new Error("Rider not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ message: "Rider status updated", data: riderDoc });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /admin/restaurants ───────────────────────────────────────────────────
export const getAdminRestaurants = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { restaurantName: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Restaurant.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Restaurants fetched",
      data: restaurants,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /admin/restaurants/:restaurantId ───────────────────────────────────
export const updateAdminRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      const error = new Error("Invalid restaurant ID");
      error.statusCode = 400;
      return next(error);
    }

    const updatableFields = ["status", "isOpen", "restaurantName", "cuisineTypes", "restaurantType"];
    const updates = {};
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, updates, { new: true });
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ message: "Restaurant updated", data: restaurant });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /admin/foods ─────────────────────────────────────────────────────────
export const getAdminFoods = async (req, res, next) => {
  try {
    const { search, restaurantId, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const menuFilter = {};
    if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
      menuFilter.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }

    const menus = await Menu.find(menuFilter)
      .populate("restaurantId", "restaurantName")
      .lean();

    let allItems = [];
    for (const menu of menus) {
      for (const item of menu.menuItems) {
        if (!search || item.itemName.toLowerCase().includes(search.toLowerCase())) {
          allItems.push({
            ...item,
            menuId: menu._id,
            restaurantId: menu.restaurantId?._id,
            restaurantName: menu.restaurantId?.restaurantName,
          });
        }
      }
    }

    const total = allItems.length;
    const paginated = allItems.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      message: "Foods fetched",
      data: paginated,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /admin/reports ───────────────────────────────────────────────────────
export const getAdminReports = async (req, res, next) => {
  try {
    const { range = "30" } = req.query;
    const days = parseInt(range) || 30;
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [dailyRevenue, topRestaurants, orderStatusBreakdown, newCustomers] =
      await Promise.all([
        Order.aggregate([
          { $match: { orderStatus: "delivered", createdAt: { $gte: fromDate } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: "$billDetails.finalAmount" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { orderStatus: "delivered", createdAt: { $gte: fromDate } } },
          { $group: { _id: "$restaurantId", totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$billDetails.finalAmount" } } },
          { $sort: { totalOrders: -1 } },
          { $limit: 5 },
          { $lookup: { from: "restaurants", localField: "_id", foreignField: "_id", as: "restaurant" } },
          { $unwind: "$restaurant" },
          { $project: { name: "$restaurant.restaurantName", totalOrders: 1, totalRevenue: 1 } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: fromDate } } },
          { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        ]),
        User.aggregate([
          { $match: { userType: "customer", createdAt: { $gte: fromDate } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    res.status(200).json({
      message: "Reports fetched",
      data: { dailyRevenue, topRestaurants, orderStatusBreakdown, newCustomers },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
