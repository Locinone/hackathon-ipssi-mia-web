const express = require("express");
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateJWT, getNotifications);
router.put("/:notificationId/read", authenticateJWT, markAsRead);

module.exports = router;
