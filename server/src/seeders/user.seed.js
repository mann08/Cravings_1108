import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const UserData = [
  {
    fullName: "Manager1",
    email: "Manager1@gmail.com",
    password: await bcrypt.hash("Manager@123", 10),
    dob: "2000-01-01",
    gender: "other",
    userType: "restaurant",
    phone: "9876543210",
    photo: { url: "https://placehold.co/600x400?text=M", publicId: null },
  },
  {
    fullName: "Customer1",
    email: "Customer1@gmail.com",
    password: await bcrypt.hash("Customer@123", 10),
    dob: "2000-01-01",
    gender: "other",
    userType: "customer",
    phone: "9876543210",
    photo: { url: "https://placehold.co/600x400?text=C", publicId: null },
  },
  {
    fullName: "Rider1",
    email: "Rider1@gmail.com",
    password: await bcrypt.hash("Rider@123", 10),
    dob: "2000-01-01",
    gender: "other",
    userType: "rider",
    phone: "9876543210",
    photo: { url: "https://placehold.co/600x400?text=R", publicId: null },
  },
];

const userSeed = async () => {
  try {
    //Seeding Restaurant
    const existingRestaurant = await User.findOne({ email: UserData[0].email });

    if (existingRestaurant) {
      await existingRestaurant.deleteOne();
    }


    const newRestaurant = await User.create(UserData[0]);

    //Seeding Customer

    const existingCustomer = await User.findOne({ email: UserData[1].email });

    if (existingCustomer) {
      await existingCustomer.deleteOne();
    }


    const newCustomer = await User.create(UserData[1]);

    // Seeding Rider

    const existingRider = await User.findOne({ email: UserData[2].email });

    if (existingRider) {
      await existingRider.deleteOne();
    }


    const newRider = await User.create(UserData[2]);
  } catch (error) {
    throw error;
  }
};

export default userSeed;
