```javascript
import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
    const { JWT_SECRET, NODE_ENV, CLIENT_URL } = ENV;
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d",
    })

    // Determine if we are in production or a cross-site environment
    // We treat it as production if NODE_ENV is production OR if the client URL implies a deployed app (e.g. vercel/render)
    // This ensures SameSite: None and Secure: True are set for cross-site requests
    const isProduction = NODE_ENV === "production" || (CLIENT_URL && (CLIENT_URL.includes("vercel") || CLIENT_URL.includes("render")));

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, // prevent XSS attacks : cross-ste scripting
        sameSite: isProduction ? "none" : "lax", //CSRF attacks 
        secure: isProduction,
    });
    return token;
}
```