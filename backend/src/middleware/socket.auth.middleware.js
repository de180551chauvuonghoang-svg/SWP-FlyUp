import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import { query } from "../lib/postgres.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      console.log("Socket connection rejected: No token provided");
      return next(new Error("Unauthorized - No Token Provided"));
    }

    // verify the token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    // find the user fromdb
    const { rows } = await query("SELECT id, full_name, email, profile_pic FROM users WHERE id = $1", [decoded.userId]);
    const user = rows[0];

    if (!user) {
      console.log("Socket connection rejected: User not found");
      return next(new Error("User not found"));
    }

    // attach user info to socket
    socket.user = {
        _id: user.id.toString(),
        fullName: user.full_name,
        email: user.email,
        profilePic: user.profile_pic
    };
    socket.userId = user.id.toString();

    console.log(`Socket authenticated for user: ${user.full_name} (${user.id})`);

    next();
  } catch (error) {
    console.log("Error in socket authentication:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};