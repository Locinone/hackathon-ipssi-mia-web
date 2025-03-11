const Like = require("../models/Like");
const Post = require("../models/Post");
const NotificationManager = require("../utils/NotificationManager");

const createLike = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const userId = req.user.id;
  const { postId } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      return res.status(400).json({ message: "Vous avez déjà liké ce post" });
    }

    const like = new Like({ post: postId, user: userId });
    await like.save();

    post.likes.push(like._id);
    await post.save();

    await notificationManager.sendNotification({
      sender: userId,
      receiver: post.author,
      type: "like",
      post: postId,
      message: "Votre post a été liké",
    });

    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLike = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const userId = req.user.id;
  const { likeId } = req.params;

  try {
    const like = await Like.findById(likeId);

    if (!like) {
      return res.status(404).json({ message: "Like introuvable" });
    }

    if (like.user.toString() !== userId) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce like",
      });
    }

    await Like.findByIdAndDelete(likeId);
    await Post.findByIdAndUpdate(like.post, { $pull: { likes: likeId } });

    await notificationManager.deleteNotification({
      sender: userId,
      receiver: like.post.author,
      type: "like",
      post: like.post,
      message: "Un utilisateur a retiré son like de votre post.",
      customType: "unlike",
    });

    res
      .status(200)
      .json({ message: "Like et notification supprimés avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLikesByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const likes = await Like.find({ post: postId }).populate(
      "user",
      "username email",
    );
    res.status(200).send(likes);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { createLike, deleteLike, getLikesByPost };
