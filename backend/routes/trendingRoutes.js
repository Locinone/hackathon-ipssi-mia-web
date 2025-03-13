const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const { getTrendings } = require("../controllers/trendingController");

const router = express.Router();

router.get("/:period", authenticateJWT, getTrendings);

module.exports = router;
