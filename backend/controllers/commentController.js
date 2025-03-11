const Post = require("../models/Post");
const Comment = require("../models/Comment");

const createComment = async (req, res) => {
  const userId = req.user.id;
  const { content, postId } = req.body;

  try {
    if (!content || !postId) {
      return res.status(400).send("Contenu et ID du post requis");
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    const comment = new Comment({
      content,
      author: userId,
      post: postId,
    });

    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    res.status(201).send(comment);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send("Commentaire introuvable");
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à supprimer ce commentaire");
    }

    await Comment.findByIdAndDelete(commentId);

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    res.status(200).send({ message: "Commentaire supprimé" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username email",
    );
    res.status(200).send(comments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { createComment, deleteComment, getCommentsByPost };
