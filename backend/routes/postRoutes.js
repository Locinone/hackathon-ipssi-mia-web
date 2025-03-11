const express = require("express");
const postController = require("../controllers/postController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.post("/create", authenticateJWT, postController.createPost);
router.put("/update/:postId", authenticateJWT, postController.updatePost);
router.delete("/delete/:postId", authenticateJWT, postController.deletePost);
router.get("/", postController.getPosts);
router.get("/:postId", postController.getPostById);
router.get("/user/:userId", postController.getPostsByUserId);

module.exports = router;
