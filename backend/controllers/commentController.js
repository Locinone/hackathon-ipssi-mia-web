const Post = require("../models/Post");
const Comment = require("../models/Comment");
const NotificationManager = require("../utils/notificationManager");

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
    // Récupérer les commentaires principaux (sans parent)
    const comments = await Comment.find({
      post: postId,
      parentComment: { $exists: false }
    })
      .populate("author", "username email name image")
      .sort({ createdAt: -1 });

    // Vérifier que comments est bien un tableau avant d'utiliser map
    if (Array.isArray(comments)) {
      const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
        // Récupérer uniquement les IDs des réponses
        const replies = await Comment.find({
          parentComment: comment._id
        }).select('_id');

        // Convertir le commentaire en objet et ajouter les IDs des réponses
        const commentObj = comment.toObject();
        commentObj.replies = replies.map(reply => reply._id);
        return commentObj;
      }));

      res.status(200).json({
        success: true,
        message: "Commentaires récupérés avec succès",
        data: commentsWithReplies
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Commentaires récupérés avec succès",
        data: comments
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Nouvelle fonction pour récupérer les commentaires par utilisateur
const getCommentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupérer les commentaires de l'utilisateur avec les informations du post et de l'auteur
    const comments = await Comment.find({ author: userId })
      .populate("author", "username name image")
      .populate("post", "content")
      .sort({ createdAt: -1 }); // Tri par date décroissante (plus récent d'abord)

    // Retourner les commentaires avec un format standard
    return res.status(200).json({
      success: true,
      message: "Commentaires récupérés avec succès",
      data: comments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Ajouter cette nouvelle fonction pour créer une réponse à un commentaire
const replyToComment = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const userId = req.user.id;
  const { content, commentId } = req.body;

  try {
    if (!content || !commentId) {
      return res.status(400).json({ message: "Contenu et ID du commentaire requis" });
    }

    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
      return res.status(404).json({ message: "Commentaire parent introuvable" });
    }

    const reply = new Comment({
      content,
      author: userId,
      parentComment: commentId
    });

    await reply.save();

    // Envoyer une notification à l'auteur du commentaire parent
    await notificationManager.sendNotification({
      sender: userId,
      receiver: parentComment.author,
      type: "reply",
      post: parentComment.post,
      message: "Un utilisateur a répondu à votre commentaire",
    });

    res.status(201).json({
      success: true,
      message: "Réponse ajoutée avec succès",
      data: reply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Ajouter cette fonction pour récupérer les réponses à un commentaire
const getRepliesByComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const replies = await Comment.find({
      parentComment: commentId,
    }).populate("author", "username email name image")
      .sort({ createdAt: -1 });

    console.log(replies);

    if (Array.isArray(replies)) {
      const repliesWithReplies = await Promise.all(replies.map(async (reply) => {
        const replies = await Comment.find({
          parentComment: reply._id
        }).select('_id');

        const replyObj = reply.toObject();
        replyObj.replies = replies.map(reply => reply._id);
        return replyObj;
      }));

      return res.status(200).json({
        success: true,
        message: "Réponses récupérées avec succès",
        data: repliesWithReplies
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Réponses récupérées avec succès",
        data: replies
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

module.exports = {
  createComment,
  deleteComment,
  getCommentsByPost,
  getCommentsByUser,
  replyToComment,
  getRepliesByComment
};
