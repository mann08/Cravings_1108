import Contact from "../models/contact.model.js";

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