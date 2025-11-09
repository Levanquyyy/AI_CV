import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendApplicationStatusEmail = async (
  userEmail,
  companyName,
  status
) => {
  const subject =
    status === "accepted"
      ? "Congratulations! Your application has been accepted"
      : "Application Status Update";

  const message =
    status === "accepted"
      ? `Congratulations! Your CV has been accepted by ${companyName}. They will contact you soon for the next steps.`
      : `Thank you for your interest. After careful consideration, ${companyName} has decided not to proceed with your application at this time.`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      text: message,
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: ${
                      status === "accepted" ? "#28a745" : "#dc3545"
                    };">
                        ${
                          status === "accepted"
                            ? "🎉 Application Accepted"
                            : "Application Status Update"
                        }
                    </h2>
                    <p>${message}</p>
                    <p>Best regards,<br>AI CV Team</p>
                </div>
            `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
