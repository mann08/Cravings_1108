import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Rider from "../models/rider.model.js";

// Status progression for rider (strict sequence)
const RIDER_STATUS_SEQUENCE = [
  "accepted",
  "preparing",   // reached restaurant → waiting
  "pickedUp",
  "onTheWay",
  "outForDelivery",
  "delivered",
];

const NEXT_STATUS = {
  accepted: "preparing",
  preparing: "pickedUp",
  pickedUp: "onTheWay",
  onTheWay: "outForDelivery",
  outForDelivery: "delivered",
};

// ─── Helper: get rider doc by user id ─────────────────────────────────────────
const getRiderDoc = async (userId) => {
  return await Rider.findOne({ riderId: userId });
};

// ─── GET /rider/dashboard ─────────────────────────────────────────────────────
export const getRiderDashboard = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      const error = new Error("Rider profile not found. Please complete your profile.");
      error.statusCode = 404;
      return next(error);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayDeliveries, todayEarningsAgg, currentDelivery] = await Promise.all([
      Order.countDocuments({
        riderId: riderDoc._id,
        orderStatus: "delivered",
        updatedAt: { $gte: today, $lte: todayEnd },
      }),
      Order.aggregate([
        {
          $match: {
            riderId: riderDoc._id,
            orderStatus: "delivered",
            updatedAt: { $gte: today, $lte: todayEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$billDetails.deliveryCharge" } } },
      ]),
      Order.findOne({
        riderId: riderDoc._id,
        orderStatus: { $in: ["accepted", "preparing", "pickedUp", "onTheWay", "outForDelivery"] },
      })
        .populate("restaurantId", "restaurantName contactDetails address city")
        .lean(),
    ]);

    res.status(200).json({
      message: "Rider dashboard fetched",
      data: {
        riderProfile: {
          status: riderDoc.status,
          isAvailable: riderDoc.isAvailable,
          averageRating: riderDoc.averageRating,
          totalEarnings: riderDoc.totalEarnings || 0,
          totalDeliveries: riderDoc.totalDeliveries || 0,
          vehicleDetails: riderDoc.vehicleDetails,
        },
        todayDeliveries,
        todayEarnings: todayEarningsAgg[0]?.total || 0,
        currentDelivery: currentDelivery || null,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /rider/availability ────────────────────────────────────────────────
export const toggleAvailability = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    if (riderDoc.status !== "active") {
      const error = new Error("Only active riders can go online");
      error.statusCode = 400;
      return next(error);
    }

    riderDoc.isAvailable = !riderDoc.isAvailable;
    await riderDoc.save();
    res.status(200).json({
      message: riderDoc.isAvailable ? "You are now online" : "You are now offline",
      data: { isAvailable: riderDoc.isAvailable },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /rider/delivery-requests ─────────────────────────────────────────────
export const getDeliveryRequests = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      return res.status(200).json({ message: "No rider profile", data: [] });
    }

    const requests = await Order.find({
      orderStatus: "ready",
      riderId: { $exists: false },
    })
      .populate("restaurantId", "restaurantName address city contactDetails")
      .select("deliveryAddress billDetails restaurantId createdAt orderItems")
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    res.status(200).json({ message: "Delivery requests fetched", data: requests });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /rider/orders/:orderId/accept ─────────────────────────────────────
export const acceptDelivery = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }

    // Atomic update — only assign if no rider yet AND status is "ready"
    const order = await Order.findOneAndUpdate(
      { _id: orderId, orderStatus: "ready", riderId: { $exists: false } },
      { riderId: riderDoc._id, orderStatus: "accepted" },
      { new: true }
    );

    if (!order) {
      const error = new Error("Order no longer available (already taken or status changed)");
      error.statusCode = 409;
      return next(error);
    }

    res.status(200).json({ message: "Delivery accepted", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /rider/orders/:orderId/reject ──────────────────────────────────────
export const rejectDelivery = async (req, res, next) => {
  try {
    // Rejection just means the rider opts out — we don't change the order
    // The order stays "ready" for another rider to pick
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }
    res.status(200).json({ message: "Delivery request rejected" });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /rider/current-order ─────────────────────────────────────────────────
export const getCurrentOrder = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      return res.status(200).json({ message: "No rider profile", data: null });
    }

    const order = await Order.findOne({
      riderId: riderDoc._id,
      orderStatus: { $in: ["accepted", "preparing", "pickedUp", "onTheWay", "outForDelivery"] },
    })
      .populate("restaurantId", "restaurantName contactDetails address city geoLocation")
      .populate({
        path: "customerId",
        populate: { path: "customerId", model: "user", select: "fullName phone" },
      })
      .lean();

    res.status(200).json({ message: "Current order fetched", data: order || null });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /rider/orders/:orderId/status ──────────────────────────────────────
export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findOne({ _id: orderId, riderId: riderDoc._id });
    if (!order) {
      const error = new Error("Order not found or not assigned to you");
      error.statusCode = 404;
      return next(error);
    }

    const nextStatus = NEXT_STATUS[order.orderStatus];
    if (!nextStatus) {
      const error = new Error(`No next status from "${order.orderStatus}"`);
      error.statusCode = 400;
      return next(error);
    }

    order.orderStatus = nextStatus;

    // When delivered, update rider earnings and delivery count
    if (nextStatus === "delivered") {
      const earning = order.billDetails?.deliveryCharge || 0;
      riderDoc.earnings.push({
        orderId: order._id,
        amount: earning,
        status: "pending",
      });
      riderDoc.totalEarnings = (riderDoc.totalEarnings || 0) + earning;
      riderDoc.totalDeliveries = (riderDoc.totalDeliveries || 0) + 1;
      await riderDoc.save();
    }

    await order.save();
    res.status(200).json({ message: `Status updated to "${nextStatus}"`, data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /rider/delivery-history ──────────────────────────────────────────────
export const getDeliveryHistory = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      return res.status(200).json({ message: "No rider profile", data: [], pagination: {} });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ riderId: riderDoc._id, orderStatus: "delivered" })
        .populate("restaurantId", "restaurantName")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments({ riderId: riderDoc._id, orderStatus: "delivered" }),
    ]);

    res.status(200).json({
      message: "Delivery history fetched",
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /rider/earnings ──────────────────────────────────────────────────────
export const getRiderEarnings = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      return res.status(200).json({ message: "No rider profile", data: { earnings: [], total: 0 } });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const allEarnings = riderDoc.earnings || [];
    const total = allEarnings.length;
    const paginated = [...allEarnings]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + parseInt(limit));

    res.status(200).json({
      message: "Earnings fetched",
      data: {
        earnings: paginated,
        totalEarnings: riderDoc.totalEarnings || 0,
        totalDeliveries: riderDoc.totalDeliveries || 0,
        averageRating: riderDoc.averageRating || 0,
      },
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /rider/location ────────────────────────────────────────────────────
export const updateRiderLocation = async (req, res, next) => {
  try {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      const error = new Error("lat and lon are required");
      error.statusCode = 400;
      return next(error);
    }

    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    riderDoc.currentLocation = { lat: String(lat), lon: String(lon) };
    await riderDoc.save();
    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /rider/profile ─────────────────────────────────────────────────────
export const updateRiderProfile = async (req, res, next) => {
  try {
    const riderDoc = await getRiderDoc(req.user._id);
    if (!riderDoc) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const { vehicleType, vehicleNumber, vehicleModel, vehicleColor } = req.body;
    if (vehicleType || vehicleNumber || vehicleModel || vehicleColor) {
      riderDoc.vehicleDetails = {
        vehicleType: vehicleType || riderDoc.vehicleDetails?.vehicleType,
        vehicleNumber: vehicleNumber || riderDoc.vehicleDetails?.vehicleNumber,
        vehicleModel: vehicleModel || riderDoc.vehicleDetails?.vehicleModel,
        vehicleColor: vehicleColor || riderDoc.vehicleDetails?.vehicleColor,
      };
    }

    await riderDoc.save();
    res.status(200).json({ message: "Profile updated", data: riderDoc });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
