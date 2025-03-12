const express = require("express");
const {
  createTheme,
  deleteTheme,
  getAllThemes,
  getThemeById,
} = require("../controllers/themeController");
const { authenticateJWT } = require("../middleware/auth");
const { apiMiddleware } = require("../middleware/api");

const router = express.Router();

router.post("/create", authenticateJWT, apiMiddleware, createTheme);
router.delete("/delete/:themeId", authenticateJWT, deleteTheme);
router.get("/", getAllThemes);
router.get("/:themeId", getThemeById);

module.exports = router;
