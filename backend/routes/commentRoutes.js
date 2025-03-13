const express = require("express");
const {
  createComment,
  deleteComment,
  getCommentsByPost,
  getCommentsByUser,
  replyToComment,
  getRepliesByComment
} = require("../controllers/commentController");
const { authenticateJWT } = require("../middleware/auth");
const { commentSchema } = require("../validators/postSchemas");
const zodValidator = require("../middleware/zodValidator");

const router = express.Router();

router.post("/create", authenticateJWT, zodValidator(commentSchema, 'body'), createComment);
router.post("/reply", authenticateJWT, zodValidator(commentSchema, 'body'), replyToComment);

router.delete("/delete/:commentId", authenticateJWT, deleteComment);
router.get("/post/:postId", getCommentsByPost);
router.get("/user/:userId", getCommentsByUser);
router.get("/replies/:commentId", getRepliesByComment);
module.exports = router;
