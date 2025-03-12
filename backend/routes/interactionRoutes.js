const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const interactionController = require("../controllers/interactionController");

const router = express.Router();

// Routes pour les likes
router.post("/likes/:postId/create", authenticateJWT, interactionController.createLike);
router.delete("/likes/:postId/delete", authenticateJWT, interactionController.deleteLike);

// Routes pour les dislikes
router.post("/dislikes/:postId/create", authenticateJWT, interactionController.createDislike);
router.delete("/dislikes/:postId/delete", authenticateJWT, interactionController.deleteDislike);

// Routes pour les commentaires
router.post("/comments/:postId/create", authenticateJWT, interactionController.createComment);
router.delete("/comments/:postId/:commentId/delete", authenticateJWT, interactionController.deleteComment);
router.get("/comments/:postId", authenticateJWT, interactionController.getComments);
router.post("/comments/:commentId/answer", authenticateJWT, interactionController.answerComment);

// Routes pour les retweets
router.post("/retweets/:postId/create", authenticateJWT, interactionController.createRetweet);
router.delete("/retweets/:postId/delete", authenticateJWT, interactionController.deleteRetweet);

// Routes pour les signets (bookmarks)
router.post("/bookmarks/:postId/create", authenticateJWT, interactionController.createBookmark);
router.delete("/bookmarks/:postId/delete", authenticateJWT, interactionController.deleteBookmark);
router.get("/bookmarks/user", authenticateJWT, interactionController.getUserBookmarks);

module.exports = router;
