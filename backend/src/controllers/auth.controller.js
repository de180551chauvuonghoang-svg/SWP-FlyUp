import { generateToken } from "../lib/utils.js";
import { query } from "../lib/postgres.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandelers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password, phone, dob, sex } = req.body;

  try {
    if (!fullName || !email || !password || !phone || !dob || !sex) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const phoneNormalized = phone.toString().replace(/[\s-]/g, "");
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(phoneNormalized)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const sexNormalized = String(sex).toLowerCase();
    if (!["male", "female"].includes(sexNormalized)) {
      return res.status(400).json({ message: "Invalid sex value. Choose 'male' or 'female'." });
    }

    const parseDob = (input) => {
      if (!input) return null;
      if (input instanceof Date) return input;
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        const [y, m, d] = input.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d));
      }
      if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(input)) {
        const parts = input.includes("/") ? input.split("/") : input.split("-");
        const d = Number(parts[0]);
        const m = Number(parts[1]);
        const y = Number(parts[2]);
        return new Date(Date.UTC(y, m - 1, d));
      }
      const fallback = new Date(input);
      if (!isNaN(fallback.getTime())) {
        return new Date(Date.UTC(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()));
      }
      return null;
    };

    const parsedDob = parseDob(dob);
    if (!parsedDob) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const minDob = new Date();
    minDob.setFullYear(minDob.getFullYear() - 3);
    const minDobUtc = new Date(Date.UTC(minDob.getFullYear(), minDob.getMonth(), minDob.getDate()));
    if (parsedDob > minDobUtc) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    // Check existing user in Postgres
    const userCheck = await query("SELECT * FROM users WHERE email = $1 OR phone = $2", [email, phoneNormalized]);
    if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email or Phone already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertQuery = `
        INSERT INTO users (full_name, email, password, phone, dob, sex)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const { rows } = await query(insertQuery, [fullName, email, hashedPassword, phoneNormalized, parsedDob, sexNormalized]);
    const newUser = rows[0];

    if (newUser) {
      res.status(201).json({
        _id: newUser.id.toString(),
        fullName: newUser.full_name,
        email: newUser.email,
        sex: newUser.sex,
        phone: newUser.phone,
        dob: newUser.dob,
        profilePic: newUser.profile_pic,
      });

      try {
        await sendWelcomeEmail(newUser.email, newUser.full_name, ENV.CLIENT_URL || "http://localhost:5173");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      _id: user.id.toString(),
      fullName: user.full_name,
      email: user.email,
      profilePic: user.profile_pic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  const { NODE_ENV, CLIENT_URL, RENDER } = ENV;
  const isProduction = NODE_ENV === "production" || RENDER || (CLIENT_URL && (CLIENT_URL.includes("vercel") || CLIENT_URL.includes("render")));

  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  res.status(200).json({ message: "Logout successful" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) return res.status(400).json({ message: "Profile picture is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updateQuery = `
        UPDATE users
        SET profile_pic = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const { rows } = await query(updateQuery, [uploadResponse.secure_url, userId]);
    const updatedUser = rows[0];

    res.status(200).json({
        _id: updatedUser.id.toString(),
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        profilePic: updatedUser.profile_pic,
    });

  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    if (ENV.NODE_ENV === "development") {
      return res.status(500).json({ message: "Internal server error", detail: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
