const express = require("express");
const {
  createHashtag,
  deleteHashtag,
  getAllHashtags,
  getHashtagById,
} = require("../controllers/hashtagController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.post("/create", authenticateJWT, createHashtag);
router.delete("/delete/:hashtagId", authenticateJWT, deleteHashtag);
router.get("/", getAllHashtags);
router.get("/:hashtagId", getHashtagById);

module.exports = router;
