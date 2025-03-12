const Interaction = require('../models/Interaction');
const Post = require('../models/Post');
const Share = require('../models/Share');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const NotificationManager = require('../utils/notificationManager');
const jsonResponse = require('../utils/jsonResponse');

const createLike = async (req, res) => {
    const io = req.app.get('io');
    const notificationManager = new NotificationManager(io);

    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        // Vérification que l'utilisateur est bien authentifié
        if (!userId) {
            return jsonResponse(res, 'Utilisateur non authentifié', 401, null);
        }

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const existingLike = await Interaction.findOne({ post: postId, user: userId, like: true });
        if (existingLike) {
            return jsonResponse(res, 'Vous avez déjà liké ce post', 400, null);
        }

        const existingDislike = await Interaction.findOne({ post: postId, user: userId, like: false });
        if (existingDislike) {
            await existingDislike.delete();
        }

        // Création du like avec validation explicite des champs requis
        const like = new Interaction({
            post: postId,
            user: userId,
            like: true,
            createdAt: new Date()
        });

        // Validation du document avant sauvegarde
        await like.validate();

        await like.save();
        post.likes.push(like._id);
        await post.save();

        await notificationManager.sendNotification({
            sender: userId,
            receiver: post.author,
            type: 'like',
            post: postId,
            message: 'Votre post a été liké',
        });

        return jsonResponse(res, 'Post liké avec succès', 201, like);
    } catch (error) {
        console.error('Erreur lors de la création du like:', error);
        return jsonResponse(res, error.message, 500, null);
    }
};

const createDislike = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const existingLike = await Interaction.findOne({ post: postId, user: userId, like: true });
        if (existingLike) {
            await existingLike.delete();
        }

        const existingDislike = await Interaction.findOne({ post: postId, user: userId, like: false });
        if (existingDislike) {
            return jsonResponse(res, 'Vous avez déjà disliké ce post', 400, null);
        }

        const dislike = new Interaction({ post: postId, user: userId, like: false });
        await dislike.save();

        post.dislikes.push(dislike._id);
        await post.save();

        return jsonResponse(res, 'Post disliké avec succès', 201, dislike);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const existingLike = await Interaction.findOne({ post: postId, user: userId, like: true });
        if (!existingLike) {
            return jsonResponse(res, 'Vous n\'avez pas liké ce post', 400, null);
        }

        await existingLike.delete();

        post.likes = post.likes.filter(like => like.toString() !== existingLike._id.toString());
        await post.save();

        return jsonResponse(res, 'Like supprimé avec succès', 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteDislike = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const existingDislike = await Interaction.findOne({ post: postId, user: userId, like: false });
        if (!existingDislike) {
            return jsonResponse(res, 'Vous n\'avez pas disliké ce post', 400, null);
        }

        await existingDislike.delete();

        post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== existingDislike._id.toString());
        await post.save();

        return jsonResponse(res, 'Dislike supprimé avec succès', 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

// Commentaires
const createComment = async (req, res) => {
    const io = req.app.get('io');
    const notificationManager = new NotificationManager(io);

    try {
        const { postId } = req.params;
        const { userId } = req.user;
        const { comment } = req.body;

        if (!comment || comment.trim() === '') {
            return jsonResponse(res, 'Le commentaire ne peut pas être vide', 400, null);
        }

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const newComment = new Comment({
            post: postId,
            author: userId,
            content: comment,
        });

        await newComment.save();

        post.comments.push(newComment._id);
        await post.save();

        // Notification au propriétaire du post
        if (post.author.toString() !== userId) {
            await notificationManager.sendNotification({
                sender: userId,
                receiver: post.author,
                type: 'comment',
                post: postId,
                comment: newComment._id,
                message: 'a commenté votre post',
            });
        }

        return jsonResponse(res, 'Commentaire ajouté avec succès', 201, newComment);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { userId } = req.user;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return jsonResponse(res, 'Commentaire introuvable', 404, null);
        }

        // Vérifier si l'utilisateur est l'auteur du commentaire ou du post
        if (comment.author.toString() !== userId && post.author.toString() !== userId) {
            return jsonResponse(res, 'Vous n\'êtes pas autorisé à supprimer ce commentaire', 403, null);
        }

        await Comment.findByIdAndDelete(commentId);

        // Mettre à jour le post pour retirer la référence au commentaire
        post.comments = post.comments.filter(c => c.toString() !== commentId);
        await post.save();

        return jsonResponse(res, 'Commentaire supprimé avec succès', 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const comments = await Comment.find({ post: postId })
            .populate('author', 'username profilePicture')
            .populate({
                path: 'answers',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            })
            .sort({ createdAt: -1 });

        return jsonResponse(res, 'Commentaires récupérés avec succès', 200, comments);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const answerComment = async (req, res) => {
    const io = req.app.get('io');
    const notificationManager = new NotificationManager(io);

    try {
        const { commentId } = req.params;
        const { userId } = req.user;
        const { answer } = req.body;

        if (!answer || answer.trim() === '') {
            return jsonResponse(res, 'La réponse ne peut pas être vide', 400, null);
        }

        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return jsonResponse(res, 'Commentaire introuvable', 404, null);
        }

        const newAnswer = new Comment({
            post: parentComment.post,
            author: userId,
            content: answer,
            isAnswer: true,
            parentComment: commentId
        });

        await newAnswer.save();

        // Ajouter la réponse au commentaire parent
        parentComment.answers.push(newAnswer._id);
        await parentComment.save();

        // Notification à l'auteur du commentaire
        if (parentComment.author.toString() !== userId) {
            await notificationManager.sendNotification({
                sender: userId,
                receiver: parentComment.author,
                type: 'answer',
                post: parentComment.post,
                comment: newAnswer._id,
                message: 'a répondu à votre commentaire',
            });
        }

        return jsonResponse(res, 'Réponse ajoutée avec succès', 201, newAnswer);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

// Retweets
const createRetweet = async (req, res) => {
    const io = req.app.get('io');
    const notificationManager = new NotificationManager(io);

    try {
        const { postId } = req.params;
        const { userId } = req.user;
        const { content } = req.body || {};

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        // Vérifier si l'utilisateur a déjà retweeté ce post
        const existingRetweet = await Share.findOne({
            originalPost: postId,
            author: userId,
            type: 'retweet'
        });

        if (existingRetweet) {
            return jsonResponse(res, 'Vous avez déjà retweeté ce post', 400, null);
        }

        const retweet = new Share({
            originalPost: postId,
            author: userId,
            content: content || '',
            type: 'retweet'
        });

        await retweet.save();

        // Mettre à jour le post original
        post.retweets.push(retweet._id);
        await post.save();

        // Notification au propriétaire du post
        if (post.author.toString() !== userId) {
            await notificationManager.sendNotification({
                sender: userId,
                receiver: post.author,
                type: 'retweet',
                post: postId,
                share: retweet._id,
                message: 'a retweeté votre post',
            });
        }

        return jsonResponse(res, 'Retweet ajouté avec succès', 201, retweet);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteRetweet = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const retweet = await Share.findOne({
            originalPost: postId,
            author: userId,
            type: 'retweet'
        });

        if (!retweet) {
            return jsonResponse(res, 'Retweet introuvable', 404, null);
        }

        await Share.findByIdAndDelete(retweet._id);

        // Mettre à jour le post original
        post.retweets = post.retweets.filter(rt => rt.toString() !== retweet._id.toString());
        await post.save();

        return jsonResponse(res, 'Retweet supprimé avec succès', 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

// Bookmarks (Signets)
const createBookmark = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, 'Post introuvable', 404, null);
        }

        const existingBookmark = await Bookmark.findOne({ post: postId, user: userId });
        if (existingBookmark) {
            return jsonResponse(res, 'Ce post est déjà dans vos signets', 400, null);
        }

        const bookmark = new Bookmark({
            post: postId,
            user: userId
        });

        await bookmark.save();

        return jsonResponse(res, 'Post ajouté aux signets', 201, bookmark);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteBookmark = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;

        const bookmark = await Bookmark.findOne({ post: postId, user: userId });
        if (!bookmark) {
            return jsonResponse(res, 'Signet introuvable', 404, null);
        }

        await Bookmark.findByIdAndDelete(bookmark._id);

        return jsonResponse(res, 'Signet supprimé avec succès', 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const getUserBookmarks = async (req, res) => {
    try {
        const { userId } = req.user;

        const bookmarks = await Bookmark.find({ user: userId })
            .populate({
                path: 'post',
                populate: [
                    { path: 'author', select: 'username profilePicture' },
                    { path: 'likes' },
                    { path: 'dislikes' },
                    { path: 'comments' },
                    { path: 'retweets' }
                ]
            })
            .sort({ createdAt: -1 });

        const posts = bookmarks.map(bookmark => bookmark.post);

        return jsonResponse(res, 'Signets récupérés avec succès', 200, posts);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

module.exports = {
    createLike,
    deleteLike,
    createDislike,
    deleteDislike,
    createComment,
    deleteComment,
    getComments,
    answerComment,
    createRetweet,
    deleteRetweet,
    createBookmark,
    deleteBookmark,
    getUserBookmarks
};

