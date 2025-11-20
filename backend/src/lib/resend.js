import { Resend } from "resend"
// import { createWelcomeEmailTemplate } from "./emails/emailTemplates.js";
import "dotenv/config";
import { ENV } from "./env.js";


export const resendClient = new Resend(ENV.RESEND_API_KEY);

export const sender = {
    email: ENV.EMAIL_FROM || ENV.EMAIl_FROM,
    name: ENV.EMAIL_FROM_NAME || ENV.EMAIl_FROM_NAME,
};