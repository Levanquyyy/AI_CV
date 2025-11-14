import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Nạp cấu hình từ tệp .env
dotenv.config();

// Cấu hình SMTP của SendGrid
const transporter = nodemailer.createTransport({
  service: "SendGrid", // Sử dụng SendGrid service
  host: "smtp.sendgrid.net", // SMTP server của SendGrid
  port: 587, // SMTP port (587 cho TLS, 465 cho SSL)
  auth: {
    user: "apikey", // Tên người dùng SMTP của SendGrid
    pass: process.env.SENDGRID_API_KEY, // API Key của bạn là mật khẩu
  },
});

// Hàm gửi email
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL, // Địa chỉ email người gửi
      to, // Địa chỉ email người nhận
      subject, // Tiêu đề email
      text, // Nội dung email
    };

    // Gửi email qua SendGrid SMTP
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

export { sendEmail };
