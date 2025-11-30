import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  postgresId: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values if needed, though we intend to fill it
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePic: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  sex: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },

}, {
  timestamps: true, // create & update 
});
const User = mongoose.model("User", userSchema);
export default User;

