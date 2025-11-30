import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import { query } from "../lib/postgres.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ message: "Unauthorized - No Token Provided" });

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid Token" });

        const { rows } = await query("SELECT id, full_name, email, profile_pic FROM users WHERE id = $1", [decoded.userId]);
        const user = rows[0];

        if (!user) return res.status(401).json({ message: "Unauthorized - User Not Found" });

        req.user = {
            _id: user.id.toString(),
            fullName: user.full_name,
            email: user.email,
            profilePic: user.profile_pic
        };
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
};
