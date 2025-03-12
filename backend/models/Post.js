const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  files: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hashtags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hashtag" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dislike" }],
  themes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Theme" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
