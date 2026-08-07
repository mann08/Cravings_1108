import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSCODE,
      },
    });
    const mailOption = {
      from: process.env.GMAIL_USERNAME,
      to,
      subject,
      html: message,
    };
    const res = await transporter.sendMail(mailOption);
  } catch (error) {
    throw error;
  }
};

export default sendEmail;

// sendEmail(
//   "mann882005@gmail.com",
//   "test Email",
//   `<h1 style='color:blue;'>Test Message</h1>
//   <p style='color:red;'>Batch 6</p>`,
// );
