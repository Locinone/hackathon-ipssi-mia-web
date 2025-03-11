const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  biography: { type: String },
  location: { type: String },
  link: { type: String },
  banner: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  password: { type: String, required: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
