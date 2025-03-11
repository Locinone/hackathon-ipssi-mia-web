const Like = require("../models/Like");
const Post = require("../models/Post");

const createLike = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      return res.status(400).send("Vous avez déjà liké ce post");
    }

    const like = new Like({ post: postId, user: userId });
    await like.save();

    post.likes.push(like._id);
    await post.save();

    res.status(201).send(like);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteLike = async (req, res) => {
  const userId = req.user.id;
  const { likeId } = req.params;

  try {
    const like = await Like.findById(likeId);

    if (!like) {
      return res.status(404).send("Like introuvable");
    }

    if (like.user.toString() !== userId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à supprimer ce like");
    }

    await Like.findByIdAndDelete(likeId);
    await Post.findByIdAndUpdate(like.post, { $pull: { likes: likeId } });

    res.status(200).send({ message: "Like supprimé avec succès" });
  } catch (error) {
    res.status(500).send({ message: error.message });
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
