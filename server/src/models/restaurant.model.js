import mongoose from "mongoose";

const RestaurantSchema = mongoose.Schema(
  {
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    restaurantName: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },
    country: { type: String },
    geoLocation: {
      type: {
        lat: { type: String },
        lon: { type: String },
      },
      default: {},
    },

    documents: {
      type: {
        legalName: { type: String },
        companyType: { type: String },
        gstCertificate: { type: String },
        fssaiCertificate: { type: String },
        panCard: { type: String },
      },
      default: {},
    },
    financialDetails: {
      type: {
        bankName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
      },
      default: {},
    },
    contactDetails: {
      type: {
        email: { type: String },
        phone: { type: String },
      },
      default: {},
    },
    servingHours: {
      type: {
        openingTime: { type: String },
        closingTime: { type: String },
      },
      default: {},
    },
    isOpen: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "inactive",
    },
    averageRating: { type: Number, default: 0 },
    cuisineTypes: {
      type: [String],
      default: [],
    },
    restaurantImage: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      default: [],
    },
    coverImage: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    },
    description: { type: String },
    restaurantType: {
      type: String,
      enum: ["veg", "non-veg", "jain", "vegan", "both"],
      default: "both",
    },
    socialMediaLinks: {
      type: [
        {
          platform: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
    },
  },
  { timestamps: true },
);

const Restaurant = mongoose.model("restaurant", RestaurantSchema);

export default Restaurant;
