const express = require("express");
const {
  createLike,
  deleteLike,
  getLikesByPost,
} = require("../controllers/likeController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.post("/create", authenticateJWT, createLike);
router.delete("/delete/:likeId", authenticateJWT, deleteLike);
router.get("/post/:postId", getLikesByPost);

module.exports = router;
