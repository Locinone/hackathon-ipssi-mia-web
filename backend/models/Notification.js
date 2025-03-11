const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "like",
      "unlike",
      "comment",
      "uncomment",
      "follow",
      "unfollow",
      "post",
    ],
    required: true,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
