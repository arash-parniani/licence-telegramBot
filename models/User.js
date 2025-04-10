const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestapms: true }
);

const User = mongoose.model("User", userModel);

module.exports = User;
