const Post = require("../models/Post");
const Comment = require("../models/Comment");
const NotificationManager = require("../utils/NotificationManager");

const createComment = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const userId = req.user.id;
  const { content, postId } = req.body;

  try {
    if (!content || !postId) {
      return res.status(400).json({ message: "Contenu et ID du post requis" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    const comment = new Comment({
      content,
      author: userId,
      post: postId,
    });

    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    await notificationManager.sendNotification({
      sender: userId,
      receiver: post.author,
      type: "comment",
      post: postId,
      message: "Un utilisateur a commenté votre post",
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const userId = req.user.id;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce commentaire",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    await notificationManager.deleteNotification({
      sender: userId,
      receiver: comment.post.author,
      type: "comment",
      post: comment.post,
      message: "Un utilisateur a supprimé son commentaire sur votre post.",
      customType: "uncomment",
    });

    res.status(200).json({
      message: "Commentaire et notification supprimés avec succès",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username email",
    );
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createComment, deleteComment, getCommentsByPost };
