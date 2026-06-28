import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const RegisterUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, gender, password, dob } = req.body;

    if (!fullName || !email || !phone || !password || !dob || !gender) {
      const error = new Error("All Fields are Required");
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email Already Registered");
      error.statusCode = 409;
      return next(error);
    }
    // Create New User and Complete Registration will do this tomorrow

    const photoUrl = `https://placehold.co/600x400?text=${fullName.charAt(0).toUpperCase()}`;

    const SALT = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, SALT);

    const newUser = await User.create({
      fullName,
      email,
      phone,
      gender,
      password: hashedPassword,
      dob,
      photo,
    });

    res.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    console.log(error.message);
    next();
  }
};

export const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("All Fields are Required");
      error.statusCode = 400;
      return next(error);
    }
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const error = new Error("Invalid Email or Password");
      error.statusCode = 404;
      return next(error);
    }

    const isVerified = await bcrypt.compare(password, existingUser.password);

    if (!isVerified) {
      const error = new Error("Incorrect Password");
      error.statusCode = 401;
      return next(error);
    }
    res.status(200).json({ message: "Welcome Back", data: existingUser });
  } catch (error) {
    console.log(error.message);
    next();
  }
};

export const LogoutUser = async (req, res, next) => {
  try {
    // Cntroller Logic
  } catch (error) {
    console.log(error.message);

    next();
  }
};
