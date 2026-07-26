import Contact from "../models/contact.model.js";
import Restaurant from "../models/restaurant.model.js";

export const ContactUsForm = async (req, res, next) => {
  try {
    const { fullName, email, subject, phone, message } = req.body;

    if (!fullName || !email || !phone || !subject || !message) {
      const error = new Error("All Fields are Required");
      error.statusCode = 400;
      return next(error);
    }

    const contact = await Contact.create({
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
    console.log(error.message);
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
    console.log(error.message);
    next(error);
  }
};
