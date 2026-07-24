import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";
import Rider from "../models/rider.model.js";

// ─── Helper: get customer doc by user id ───────────────────────────────────────
const getCustomerDoc = async (userId) => {
  let customerDoc = await Customer.findOne({ customerId: userId });
  if (!customerDoc) {
    customerDoc = await Customer.create({ customerId: userId });
  }
  return customerDoc;
};

// ─── GET /customer/dashboard ───────────────────────────────────────────────────
export const getCustomerDashboard = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);

    const [totalOrders, deliveredOrders, cancelledOrders, revenueAgg, activeOrder] =
      await Promise.all([
        Order.countDocuments({ customerId: customerDoc._id }),
        Order.countDocuments({ customerId: customerDoc._id, orderStatus: "delivered" }),
        Order.countDocuments({ customerId: customerDoc._id, orderStatus: "cancelled" }),
        Order.aggregate([
          { $match: { customerId: customerDoc._id, orderStatus: "delivered" } },
          { $group: { _id: null, total: { $sum: "$billDetails.finalAmount" } } },
        ]),
        Order.findOne({
          customerId: customerDoc._id,
          orderStatus: {
            $in: ["pending", "accepted", "preparing", "ready", "pickedUp", "onTheWay", "outForDelivery"],
          },
        })
          .populate("restaurantId", "restaurantName coverImage")
          .sort({ createdAt: -1 }),
      ]);

    const recentOrders = await Order.find({ customerId: customerDoc._id })
      .populate("restaurantId", "restaurantName coverImage")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      message: "Dashboard data fetched",
      data: {
        stats: {
          totalOrders,
          deliveredOrders,
          cancelledOrders,
          pendingOrders: totalOrders - deliveredOrders - cancelledOrders,
          totalSpent: revenueAgg[0]?.total || 0,
        },
        activeOrder: activeOrder || null,
        recentOrders,
        savedAddressCount: customerDoc.addressBook?.length || 0,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /customer/orders ──────────────────────────────────────────────────────
export const getCustomerOrders = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { customerId: customerDoc._id };
    if (status && status !== "all") filter.orderStatus = status;
    if (search) filter._id = new mongoose.Types.ObjectId(search.trim());

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("restaurantId", "restaurantName coverImage contactDetails")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Populate menu items for each order
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
      message: "Orders fetched",
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /customer/orders/:orderId ────────────────────────────────────────────
export const getCustomerOrderById = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findOne({ _id: orderId, customerId: customerDoc._id })
      .populate("restaurantId", "restaurantName coverImage contactDetails address city state")
      .lean();

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    // Populate menu items
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

    // Populate rider if assigned
    if (order.riderId) {
      const riderDoc = await Rider.findById(order.riderId)
        .populate("riderId", "fullName phone photo")
        .lean();
      order.riderInfo = riderDoc || null;
    }

    res.status(200).json({ message: "Order fetched", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /customer/orders/:orderId/cancel ────────────────────────────────────
export const cancelCustomerOrder = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findOne({ _id: orderId, customerId: customerDoc._id });
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    if (order.orderStatus !== "pending") {
      const error = new Error("Only pending orders can be cancelled");
      error.statusCode = 400;
      return next(error);
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── POST /customer/orders/:orderId/review ────────────────────────────────────
export const reviewOrder = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { orderId } = req.params;
    const { rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      return next(error);
    }

    const ratingNum = parseInt(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      const error = new Error("Rating must be between 1 and 5");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findOne({ _id: orderId, customerId: customerDoc._id });
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }
    if (order.orderStatus !== "delivered") {
      const error = new Error("Only delivered orders can be reviewed");
      error.statusCode = 400;
      return next(error);
    }

    order.rating = ratingNum;
    await order.save();

    // Update restaurant average rating
    const avgAgg = await Order.aggregate([
      { $match: { restaurantId: order.restaurantId, rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    if (avgAgg.length) {
      await Restaurant.findByIdAndUpdate(order.restaurantId, {
        averageRating: Math.round(avgAgg[0].avg * 10) / 10,
      });
    }

    res.status(200).json({ message: "Review submitted", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /customer/addresses ──────────────────────────────────────────────────
export const getAddresses = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    res.status(200).json({ message: "Addresses fetched", data: customerDoc.addressBook || [] });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── POST /customer/addresses ─────────────────────────────────────────────────
export const addAddress = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { name, address, city, state, pinCode, country, addressType, isDefault } = req.body;

    if (!name || !address || !city || !state || !pinCode || !country || !addressType) {
      const error = new Error("All address fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const validTypes = ["home", "work", "other"];
    if (!validTypes.includes(addressType)) {
      const error = new Error("Invalid address type");
      error.statusCode = 400;
      return next(error);
    }

    if (isDefault) {
      customerDoc.addressBook.forEach((addr) => (addr.isDefault = false));
    }

    customerDoc.addressBook.push({ name, address, city, state, pinCode, country, addressType, isDefault: !!isDefault });
    await customerDoc.save();

    res.status(201).json({ message: "Address added", data: customerDoc.addressBook });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── PATCH /customer/addresses/:addressId ────────────────────────────────────
export const updateAddress = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      const error = new Error("Invalid address ID");
      error.statusCode = 400;
      return next(error);
    }

    const addr = customerDoc.addressBook.id(addressId);
    if (!addr) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      return next(error);
    }

    const { name, address, city, state, pinCode, country, addressType, isDefault } = req.body;
    if (isDefault) customerDoc.addressBook.forEach((a) => (a.isDefault = false));
    if (name) addr.name = name;
    if (address) addr.address = address;
    if (city) addr.city = city;
    if (state) addr.state = state;
    if (pinCode) addr.pinCode = pinCode;
    if (country) addr.country = country;
    if (addressType) addr.addressType = addressType;
    if (isDefault !== undefined) addr.isDefault = !!isDefault;

    await customerDoc.save();
    res.status(200).json({ message: "Address updated", data: customerDoc.addressBook });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── DELETE /customer/addresses/:addressId ────────────────────────────────────
export const deleteAddress = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      const error = new Error("Invalid address ID");
      error.statusCode = 400;
      return next(error);
    }

    customerDoc.addressBook = customerDoc.addressBook.filter(
      (a) => a._id.toString() !== addressId
    );
    await customerDoc.save();
    res.status(200).json({ message: "Address deleted", data: customerDoc.addressBook });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /customer/favourites ─────────────────────────────────────────────────
export const getFavourites = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const favIds = customerDoc.favourites || [];

    // Find menu docs that contain these item IDs
    const menuDocs = await Menu.find({
      "menuItems._id": { $in: favIds },
    })
      .populate("restaurantId", "restaurantName")
      .lean();

    const favouriteItems = [];
    for (const menuDoc of menuDocs) {
      for (const item of menuDoc.menuItems) {
        if (favIds.some((id) => id.toString() === item._id.toString())) {
          favouriteItems.push({
            ...item,
            restaurantName: menuDoc.restaurantId?.restaurantName,
            menuId: menuDoc._id,
          });
        }
      }
    }

    res.status(200).json({ message: "Favourites fetched", data: favouriteItems });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── POST /customer/favourites/:itemId ────────────────────────────────────────
export const addFavourite = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      return next(error);
    }

    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const already = customerDoc.favourites.some((id) => id.toString() === itemId);
    if (!already) {
      customerDoc.favourites.push(itemObjectId);
      await customerDoc.save();
    }

    res.status(200).json({ message: "Added to favourites" });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── DELETE /customer/favourites/:itemId ──────────────────────────────────────
export const removeFavourite = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      return next(error);
    }

    customerDoc.favourites = customerDoc.favourites.filter(
      (id) => id.toString() !== itemId
    );
    await customerDoc.save();
    res.status(200).json({ message: "Removed from favourites" });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /customer/restaurants ─────────────────────────────────────────────────
export const getPublicRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ status: "active" })
      .select("restaurantName coverImage cuisineTypes restaurantType averageRating city address isOpen")
      .sort({ averageRating: -1 })
      .lean();

    res.status(200).json({ message: "Restaurants fetched", data: restaurants });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── GET /customer/restaurants/:restaurantId/menu ──────────────────────────────
export const getRestaurantPublicMenu = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      const error = new Error("Invalid restaurant ID");
      error.statusCode = 400;
      return next(error);
    }

    const menu = await Menu.findOne({ restaurantId }).lean();
    const restaurant = await Restaurant.findById(restaurantId)
      .select("restaurantName city address contactDetails averageRating")
      .lean();

    res.status(200).json({
      message: "Menu fetched",
      data: { restaurant, menuItems: menu ? menu.menuItems.filter(i => i.isAvailable) : [] },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ─── POST /customer/order ──────────────────────────────────────────────────────
export const placeOrder = async (req, res, next) => {
  try {
    const customerDoc = await getCustomerDoc(req.user._id);
    const { restaurantId, orderItems, deliveryAddressId, paymentMethod = "upi" } = req.body;

    if (!restaurantId || !orderItems?.length || !deliveryAddressId) {
      const error = new Error("restaurantId, orderItems, and deliveryAddressId are required");
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      const error = new Error("Invalid restaurant ID");
      error.statusCode = 400;
      return next(error);
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const deliveryAddr = customerDoc.addressBook.id(deliveryAddressId);
    if (!deliveryAddr) {
      const error = new Error("Delivery address not found");
      error.statusCode = 404;
      return next(error);
    }

    // Validate items & compute total
    const menu = await Menu.findOne({ restaurantId }).lean();
    if (!menu) {
      const error = new Error("No menu available for this restaurant");
      error.statusCode = 404;
      return next(error);
    }

    let totalAmount = 0;
    const validatedItems = [];
    for (const oi of orderItems) {
      const menuItem = menu.menuItems.find((m) => m._id.toString() === oi.itemId);
      if (!menuItem) {
        const error = new Error(`Menu item ${oi.itemId} not found`);
        error.statusCode = 400;
        return next(error);
      }
      if (!menuItem.isAvailable) {
        const error = new Error(`${menuItem.itemName} is currently unavailable`);
        error.statusCode = 400;
        return next(error);
      }
      totalAmount += menuItem.price * oi.quantity;
      validatedItems.push({ itemId: menuItem._id, quantity: oi.quantity });
    }

    // Bill computation
    const deliveryCharge = totalAmount < 200 ? 40 : 20;
    const platformFee = 5;
    const convenienceFee = 2;
    const taxAmount = Math.round(totalAmount * 0.05);
    const discountAmount = 0;
    const finalAmount = totalAmount + deliveryCharge + platformFee + convenienceFee + taxAmount - discountAmount;

    const order = await Order.create({
      restaurantId,
      customerId: customerDoc._id,
      orderItems: validatedItems,
      deliveryAddress: {
        name: deliveryAddr.name,
        address: deliveryAddr.address,
        city: deliveryAddr.city,
        state: deliveryAddr.state,
        pinCode: deliveryAddr.pinCode,
        country: deliveryAddr.country,
      },
      paymentDetails: { paymentMethod, paymentStatus: "completed" },
      billDetails: {
        totalAmount,
        deliveryCharge,
        platformFee,
        convenienceFee,
        taxAmount,
        discountAmount,
        finalAmount,
      },
      orderStatus: "pending",
    });

    res.status(201).json({ message: "Order placed successfully", data: order });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

