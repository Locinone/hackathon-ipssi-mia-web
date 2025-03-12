const express = require("express");
const postController = require("../controllers/postController");
const { authenticateJWT } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();
const { postSchema } = require("../validators/postSchemas");
const zodValidator = require("../middleware/zodValidator");

router.post("/create", authenticateJWT, upload.array('files', 5), zodValidator(postSchema, 'body'), postController.createPost);
router.put("/update/:postId", authenticateJWT, upload.array('files', 5), postController.updatePost);
router.delete("/delete/:postId", authenticateJWT, postController.deletePost);
router.get("/", postController.getPosts);
router.get("/:postId", postController.getPostById);
router.get("/user/:userId", postController.getPostsByUserId);

module.exports = router;
