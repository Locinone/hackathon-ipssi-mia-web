const mongoose = require("mongoose");

// score: score sentiment general de l'utilisateur pour ce theme
// theme: theme associe
// user: utilisateur associe

const scoreThemeSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  theme: { type: mongoose.Schema.Types.ObjectId, ref: "Theme", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("ScoreTheme", scoreThemeSchema);
