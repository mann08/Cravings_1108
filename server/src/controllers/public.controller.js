import mongoose from "mongoose";
import Contact from "../models/contact.model.js";
import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";

const FALLBACK_MENU_ITEMS = [
  {
    _id: "fallback-item-1",
    itemName: "Mango Tree Special Thali",
    category: "Veg Platter",
    description:
      "A curated selection of rich curries, breads, rice, and Indian desserts perfect for sharing.",
    price: 599,
    isAvailable: true,
    image: "https://picsum.photos/seed/thali/400/300",
  },
  {
    _id: "fallback-item-2",
    itemName: "Royal Butter Chicken",
    category: "Chicken",
    description:
      "Creamy tomato gravy with tender chicken cooked in aromatic spices for a true royal flavor.",
    price: 399,
    isAvailable: true,
    image: "https://picsum.photos/seed/butterchicken/400/300",
  },
  {
    _id: "fallback-item-3",
    itemName: "Paneer Lababdar",
    category: "Paneer",
    description:
      "Soft paneer cubes simmered in a rich tomato and cashew-based sauce with warm Indian spices.",
    price: 349,
    isAvailable: true,
    image: "https://picsum.photos/seed/paneer/400/300",
  },
];

const FALLBACK_RESTAURANTS = [
  {
    _id: "fallback-under-the-mango-tree",
    restaurantName: "Under The Mango Tree",
    coverImage: {
      url: "https://images.openai.com/static-rsc-4/YyOaAWARaVJhmPVKEhDe3VT9CQlzvT5BpH_MOb2ygYZtjdVVNkQA01jK7t0wgBxqhIu84e5okOzI-T5ebSo-m9ow15B3f14cFY1VTHtFzzCydhFxnycTFxoCItS9YHenrkOdLhqjm9mHAiCaz4EL6T-AuJVTadX8R9d-6q1K5E0?purpose=fullsize",
      publicId: "fallback-under-the-mango-tree-cover",
    },
    restaurantImage: [
      {
        url: "https://images.openai.com/static-rsc-4/2jP2tV4WT3bX42tb8Nb7CLIysK_1QaqO4vLjcJo7u7oFmbRI-4pQmFJZCz-SAILyvn9MXu9uAf5AyYn9JjZrIqfvMbAjKIazABl7fk90tQnIgXCYdfASgOiWzWWg6FIxP-WFtsfNznAcqjL7JcB4Q8Rt-fnWnhSkEM3ozLpJNRQ?purpose=inline",
        publicId: "fallback-under-the-mango-tree-1",
      },
      {
        url: "https://images.openai.com/static-rsc-4/AGC5gZtyRJWhDD9N_rpHskCGUAG5z_u5sJdYBf-ticTgDlg2Fewo7IeG8m30TvY0CfmXyMvLOJ2YRThjeYn1tXfSdgAvPutXP2SraQltEC64owde5xxCPenmAu2513xwL0qM_zgStKdTv0Hfpl2sLqnzTxtUkf8wJOIEy7sna98?purpose=inline",
        publicId: "fallback-under-the-mango-tree-2",
      },
    ],
    cuisineTypes: ["North Indian", "Mughlai", "Indian", "Continental"],
    restaurantType: "both",
    averageRating: 4.4,
    city: "Bhopal",
    address: "157, Shyamla Hills Road, Shymala Hills, Bhopal, Madhya Pradesh 462002",
    isOpen: true,
    description:
      "Nestled among lush greenery, Under The Mango Tree offers a luxurious fine-dining experience with elegant interiors and authentic Indian cuisine. The peaceful atmosphere and premium hospitality make it one of Bhopal's most popular destinations for family dinners and special occasions.",
    status: "active",
    contactDetails: {
      email: "info@underthemangotree.com",
      phone: "+91 74151 58292",
    },
  },
  {
    _id: "fallback-flying-saucer-bhopal",
    restaurantName: "Flying Saucer Bhopal",
    coverImage: {
      url: "https://images.openai.com/static-rsc-4/RlUbOn8ja_E2LotU8cjNXsTHxrkrr7yQUIcMA84z90U8rixMoAZa1utCuByQWVGlfq-Ol18q04kdI4tzQsSjOE89URcH7wKo8EELgfmT-vuQhJWc5s0nOcrVoyRea9rBvAqFEO1uqYlUY62XPGzLV_vcl4gwe9HWyz5KkE3A77M?purpose=fullsize",
      publicId: "fallback-flying-saucer-cover",
    },
    restaurantImage: [
      {
        url: "https://images.openai.com/static-rsc-4/Ky9ysRnD_IelcY7RGAKJLaibcAZPk7tQg6tKEjbFuLSOcGTT8I7SsLBpyIhnXyvjP5uLHaV_c9mmsO_RLmudKvbFF1jsbN_lYl0Sx8pkgDY0ItfsvkqqyYW_MzO7DT3fIuk6YciJV_UKcbHkpDkaqv_MKhIrIZ55znuUCXQipug?purpose=fullsize",
        publicId: "fallback-flying-saucer-1",
      },
      {
        url: "https://images.openai.com/static-rsc-4/BN43BkOINPgIHu7IX6LFBFHhYitq8cjcNgiqZpngunItFZckmCHqBXkap6V0y3l3-gf36djXUAhXMIdXEk-EzEftLZRfpG1DdPiV-DwzgNoTesaiePRbN4VnDr3dvy_IvrPa6awyhVmA6yuQOhtWUCI9RC_XWIl5PM_GYBAvE_E?purpose=inline",
        publicId: "fallback-flying-saucer-2",
      },
    ],
    cuisineTypes: ["Continental", "Chinese", "Italian", "North Indian"],
    restaurantType: "both",
    averageRating: 4.6,
    city: "Bhopal",
    address: "Bansal One Building, Zone-II, Arera Colony, Bhopal",
    isOpen: true,
    description:
      "Flying Saucer is one of Bhopal's most popular modern restaurants, known for its stylish interiors, rooftop seating, delicious international cuisine, and vibrant nightlife. It's ideal for parties, dates, and group gatherings.",
    status: "active",
    contactDetails: {
      email: "hello@flyingsaucerbhopal.com",
      phone: "+91 96690 09132",
    },
  },
  {
    _id: "fallback-manohar-dairy-mp-nagar",
    restaurantName: "Manohar Dairy & Restaurant - MP Nagar",
    coverImage: {
      url: "https://images.openai.com/static-rsc-4/NNEHOwNBkQdIcUok113C6FjyKrwCiDWdVm-xOrV_cXHUtzMlEuZiaz5-Le6QQYo8W8LuRTIyi-uVsvW4qjKQ70Ms7VoTvqvszEkhJE8bf8XZFi8rN2u-oZUzG71hkADfmIlcltgTJl86oN6Vas1YYnY-sJWHyFsIcIR2jT_4KhY?purpose=fullsize",
      publicId: "fallback-manohar-dairy-cover",
    },
    restaurantImage: [
      {
        url: "https://images.openai.com/static-rsc-4/bAmFRjDSh4PWxQKYUUjhCx0PHBmaLXCf-rxQEFXuDan2xf1DC8bY5U3M33QaUXi4erNbeaH0NO1xezSwFjcSgMSuN1xKQVxLe7bjXzZOEIRfd_6nw8NZZedX8fFGL_Rgm3g5ekvjt46PRcKgCDh_XOIci3DjLHxf6l2GrVTLuQc?purpose=fullsize",
        publicId: "fallback-manohar-dairy-1",
      },
      {
        url: "https://images.openai.com/static-rsc-4/PXzdqb9yX9RjJ4Uob-lo-_TEkO5BNEnjCTnkCYSulVmfUo8WIEUulPpi9VoaRxASxTVvgeNJPohJoWhHOStNdPwjmpBdOub_zI3m-2nQSOB_FW31J7S_Ob5SQF2mDh2NI5R-qnJkTHMapDxNE5QpA09vUe5SM5z7pxM-URf0iJw?purpose=fullsize",
        publicId: "fallback-manohar-dairy-2",
      },
    ],
    cuisineTypes: ["Pure Vegetarian", "South Indian", "North Indian", "Fast Food", "Bakery"],
    restaurantType: "veg",
    averageRating: 4.3,
    city: "Bhopal",
    address: "132 A & B, MP Nagar Zone-I, Near Jyoti Talkies, Bhopal",
    isOpen: true,
    description:
      "Manohar Dairy is one of the most iconic vegetarian restaurants in Bhopal, famous for its wide range of Indian dishes, bakery products, sweets, and quick service. It is a favorite destination for breakfast, lunch, dinner, and desserts.",
    status: "active",
    contactDetails: {
      email: "contact@manohardairy.com",
      phone: "+91 75540 40406",
    },
  },
];

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

    const existingNames = new Set(
      restaurants.map((restaurant) => restaurant.restaurantName?.toLowerCase()),
    );

    const fallbackRestaurants = FALLBACK_RESTAURANTS.filter(
      (restaurant) => !existingNames.has(restaurant.restaurantName.toLowerCase()),
    );

    const data = [...restaurants, ...fallbackRestaurants];

    res.status(200).json({
      message: "Restaurants fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantPublicMenu = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const fallbackRestaurant = FALLBACK_RESTAURANTS.find(
      (restaurant) => restaurant._id === restaurantId,
    );

    if (fallbackRestaurant) {
      return res.status(200).json({
        message: "Menu fetched successfully",
        data: {
          restaurant: fallbackRestaurant,
          menuItems: FALLBACK_MENU_ITEMS,
        },
      });
    }

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
