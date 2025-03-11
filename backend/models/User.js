const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  biography: { type: String },
  location: { type: String },
  link: { type: String },
  image: { type: String },
  banner: { type: String },
  role: { type: String, default: "user" },
  acceptNotification: { type: Boolean, default: false },
  acceptTerms: { type: Boolean, default: false },
  acceptCamera: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
