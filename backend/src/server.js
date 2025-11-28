import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routers/auth.route.js";
import messageRoutes from "./routers/messages.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.set("trust proxy", 1); // Trust first proxy (Render load balancer)

app.use(express.json({ limit: "5mb" })); // req.body

// Sanitize and log CLIENT_URL used for CORS (helps catch typos/whitespace)
const clientUrl = (ENV.CLIENT_URL || "http://localhost:5173").toString().trim();
console.log("CORS allowed origin:", clientUrl);
console.log("NODE_ENV:", ENV.NODE_ENV);

const allowedOrigins = [
  clientUrl,
  "https://swp-flyup-1.onrender.com",
  "https://swp-fly-up.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.includes("vercel.app") || origin.includes("onrender.com")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
// enable preflight for all routes
app.options("*", cors(corsOptions));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});