const express = require("express");
const {
  createScoreTheme,
  deleteScoreTheme,
  getScoresByTheme,
  getScoresByUser,
} = require("../controllers/scoreThemeController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.post("/create", authenticateJWT, createScoreTheme);
router.delete("/delete/:scoreThemeId", authenticateJWT, deleteScoreTheme);
router.get("/theme/:themeId", getScoresByTheme);
router.get("/user", authenticateJWT, getScoresByUser);

module.exports = router;
