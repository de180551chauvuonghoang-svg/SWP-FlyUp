import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandelers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudiary.js";

export const signup = async (req, res) => {
  const { fullName, email, password, phone, dob, sex } = req.body;

  try {
    if (!fullName || !email || !password || !phone || !dob || !sex) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if email is valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // basic phone validation: digits, allow + and spaces/hyphens
    const phoneNormalized = phone.toString().replace(/[\s-]/g, "");
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(phoneNormalized)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // validate sex
    const sexNormalized = String(sex).toLowerCase();
    if (!["male", "female"].includes(sexNormalized)) {
      return res.status(400).json({ message: "Invalid sex value. Choose 'male' or 'female'." });
    }

    // validate dob as a date and ensure user is at least, e.g., 3 years old (basic sanity)
    const parseDob = (input) => {
      if (!input) return null;
      // if already a Date
      if (input instanceof Date) return input;
      // ISO format yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        const [y, m, d] = input.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d));
      }
      // common handwritten format dd/mm/yyyy or dd-mm-yyyy -> interpret as day/month/year
      if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(input)) {
        const parts = input.includes("/") ? input.split("/") : input.split("-");
        const d = Number(parts[0]);
        const m = Number(parts[1]);
        const y = Number(parts[2]);
        return new Date(Date.UTC(y, m - 1, d));
      }
      // fallback to generic Date parse (still may be environment dependent)
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
    // convert minDob to UTC midnight for consistent comparison
    const minDobUtc = new Date(Date.UTC(minDob.getFullYear(), minDob.getMonth(), minDob.getDate()));
    if (parsedDob > minDobUtc) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });
    // check phone uniqueness
    const existingPhone = await User.findOne({ phone: phoneNormalized });
    if (existingPhone) return res.status(400).json({ message: "Phone already exists" });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone: phoneNormalized,
      dob: parsedDob,
      sex: sexNormalized,
    });

    if (newUser) {
      //   generateToken(newUser._id, res);
      //   await newUser.save();


      const saveUser = await newUser.save();
      // generateToken(saveUser._id, res); // Removed to prevent auto-login

      res.status(201).json({
        _id: saveUser._id,
        fullName: saveUser.fullName,
        email: saveUser.email,
        sex: saveUser.sex,
        phone: saveUser.phone,
        dob: saveUser.dob,
        profilePic: saveUser.profilePic,
      });

      // send a welcome email to user
      try {
        await sendWelcomeEmail(saveUser.email, saveUser.fullName, ENV.CLIENT_URL || "http://localhost:5173");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // We don't want to fail the signup if email fails, so we just log it
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "development" ? false : true,
  });

  res.status(200).json({ message: "Logout successful" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) return res.status(400).json({ message: "Profile picture is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(userId, {
      profilePic: uploadResponse.secure_url,
    }, { new: true });

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    // expose error message in development for easier debugging
    if (ENV.NODE_ENV === "development") {
      return res.status(500).json({ message: "Internal server error", detail: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

