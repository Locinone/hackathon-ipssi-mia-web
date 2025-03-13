const express = require("express");
const {
  createComment,
  deleteComment,
  getCommentsByPost,
  getCommentsByUser
} = require("../controllers/commentController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.post("/create", authenticateJWT, createComment);
router.delete("/delete/:commentId", authenticateJWT, deleteComment);
router.get("/post/:postId", getCommentsByPost);
router.get("/user/:userId", getCommentsByUser);

module.exports = router;
