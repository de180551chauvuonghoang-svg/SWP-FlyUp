import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";
import { transporter } from "../lib/nodemailer.js";
import { ENV } from "../lib/env.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  // Check if Gmail credentials are provided to use Nodemailer
  if (ENV.GMAIL_USER && ENV.GMAIL_PASS) {
    try {
      const info = await transporter.sendMail({
        from: `"Messenger App" <${ENV.GMAIL_USER}>`,
        to: email,
        subject: "Welcome to Messenger",
        html: createWelcomeEmailTemplate(name, clientURL),
      });
      console.log("Welcome email sent using Nodemailer", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending welcome email with Nodemailer:", error);
      throw error;
    }
  }

  // Fallback to Resend
  try {
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Messenger",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("Error sending welcome email with Resend:", error);
      throw new Error("Failed to send welcome email");
    }

    console.log("Welcome email sent successfully with Resend", data);
    return data;
  } catch (error) {
    console.error("Error sending email with Resend:", error);
    throw error;
  }
};