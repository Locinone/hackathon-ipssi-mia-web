const Interaction = require("../models/Interaction");
const Post = require("../models/Post");
const User = require("../models/User");
const Share = require("../models/Share");
const Comment = require("../models/Comment");
const Bookmark = require("../models/Bookmark");
const NotificationManager = require("../utils/notificationManager");
const jsonResponse = require("../utils/jsonResponse");

const createLike = async (req, res) => {
    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        // Vérification que l'utilisateur est bien authentifié
        if (!userId) {
            return jsonResponse(res, "Utilisateur non authentifié", 401, null);
        }

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const existingLike = await Interaction.findOne({
            post: postId,
            user: userId,
            like: true,
        });
        if (existingLike) {
            return jsonResponse(res, "Vous avez déjà liké ce post", 400, null);
        }

        const existingDislike = await Interaction.findOne({
            post: postId,
            user: userId,
            like: false,
        });
        if (existingDislike) {
            await existingDislike.deleteOne();
            post.dislikes = post.dislikes.filter(
                (dislike) => dislike.toString() !== existingDislike._id.toString()
            );
            await post.save();
        }

        // Création du like avec validation explicite des champs requis
        const like = new Interaction({
            post: postId,
            user: userId,
            like: true,
            createdAt: new Date(),
        });

        // Validation du document avant sauvegarde
        await like.validate();

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

        return jsonResponse(res, "Post liké avec succès", 201, like);
    } catch (error) {
        console.error("Erreur lors de la création du like:", error);
        return jsonResponse(res, error.message, 500, null);
    }
};

const getLikesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`Récupération des likes pour l'utilisateur: ${userId}`);

        // Vérifier que l'ID utilisateur est valide
        if (!userId || userId === 'undefined') {
            console.error('ID utilisateur invalide:', userId);
            return jsonResponse(res, 'ID utilisateur invalide', 400, null);
        }

        // Récupérer les interactions de type "like" pour cet utilisateur
        const likes = await Interaction.find({ user: userId, like: true });
        console.log(`${likes.length} likes trouvés pour l'utilisateur ${userId}`);

        if (!likes || likes.length === 0) {
            return jsonResponse(res, 'Aucun like trouvé pour cet utilisateur', 200, []);
        }

        // Extraire les IDs des posts likés
        const postIds = likes.map(like => like.post);
        console.log(`IDs des posts likés: ${postIds.join(', ')}`);

        // Récupérer les posts complets
        const posts = await Post.find({ _id: { $in: postIds } })
            .populate('author', 'name username image')
            .populate('comments')
            .sort({ createdAt: -1 });

        console.log(`${posts.length} posts likés trouvés pour l'utilisateur ${userId}`);

        return jsonResponse(res, 'Posts likés récupérés avec succès', 200, posts);
    } catch (error) {
        console.error('Erreur lors de la récupération des likes:', error);
        return jsonResponse(res, error.message, 500, null);
    }
};

const createDislike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;
        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const existingLike = await Interaction.findOne({
            post: postId,
            user: userId,
            like: true,
        });
        if (existingLike) {
            await existingLike.deleteOne();
            post.likes = post.likes.filter(
                (like) => like.toString() !== existingLike._id.toString()
            );
            await post.save();
        }

        const existingDislike = await Interaction.findOne({
            post: postId,
            user: userId,
            like: false,
        });
        if (existingDislike) {
            return jsonResponse(res, "Vous avez déjà disliké ce post", 400, null);
        }

        const dislike = new Interaction({
            post: postId,
            user: userId,
            like: false,
        });
        await dislike.save();

        post.dislikes.push(dislike._id);
        await post.save();

        return jsonResponse(res, "Post disliké avec succès", 201, dislike);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const existingLike = await Interaction.findOne({
            post: postId,
            user: userId,
            like: true,
        });
        if (!existingLike) {
            return jsonResponse(res, "Vous n'avez pas liké ce post", 400, null);
        }

        await existingLike.deleteOne();

        post.likes = post.likes.filter(
            (like) => like.toString() !== existingLike._id.toString()
        );
        await post.save();

        return jsonResponse(res, "Like supprimé avec succès", 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteDislike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const existingDislike = await Interaction.findOne({
            post: postId,
            user: userId,
            like: false,
        });
        if (!existingDislike) {
            return jsonResponse(res, "Vous n'avez pas disliké ce post", 400, null);
        }

        await existingDislike.deleteOne();

        post.dislikes = post.dislikes.filter(
            (dislike) => dislike.toString() !== existingDislike._id.toString()
        );
        await post.save();

        return jsonResponse(res, "Dislike supprimé avec succès", 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

// Commentaires
const createComment = async (req, res) => {
    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    try {
        const { postId } = req.params;
        const userId = req.user?.id;
        const { comment } = req.body;

        if (!comment || comment.trim() === "") {
            return jsonResponse(
                res,
                "Le commentaire ne peut pas être vide",
                400,
                null
            );
        }

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
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
                type: "comment",
                post: postId,
                comment: newComment._id,
                message: "a commenté votre post",
            });
        }

        return jsonResponse(res, "Commentaire ajouté avec succès", 201, newComment);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user?.id;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return jsonResponse(res, "Commentaire introuvable", 404, null);
        }

        // Vérifier si l'utilisateur est l'auteur du commentaire ou du post
        if (
            comment.author.toString() !== userId &&
            post.author.toString() !== userId
        ) {
            return jsonResponse(
                res,
                "Vous n'êtes pas autorisé à supprimer ce commentaire",
                403,
                null
            );
        }

        await Comment.findByIdAndDelete(commentId);

        // Mettre à jour le post pour retirer la référence au commentaire
        post.comments = post.comments.filter((c) => c.toString() !== commentId);
        await post.save();

        return jsonResponse(res, "Commentaire supprimé avec succès", 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const comments = await Comment.find({ post: postId })
            .populate("author", "username profilePicture")
            .populate({
                path: "answers",
                populate: {
                    path: "author",
                    select: "username profilePicture",
                },
            })
            .sort({ createdAt: -1 });

        return jsonResponse(
            res,
            "Commentaires récupérés avec succès",
            200,
            comments
        );
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const answerComment = async (req, res) => {
    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    try {
        const { commentId } = req.params;
        const userId = req.user?.id;
        const { answer } = req.body;

        if (!answer || answer.trim() === "") {
            return jsonResponse(res, "La réponse ne peut pas être vide", 400, null);
        }

        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return jsonResponse(res, "Commentaire introuvable", 404, null);
        }

        const newAnswer = new Comment({
            post: parentComment.post,
            author: userId,
            content: answer,
            isAnswer: true,
            parentComment: commentId,
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
                type: "answer",
                post: parentComment.post,
                comment: newAnswer._id,
                message: "a répondu à votre commentaire",
            });
        }

        return jsonResponse(res, "Réponse ajoutée avec succès", 201, newAnswer);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

// Retweets
const createRetweet = async (req, res) => {
    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    try {
        const { postId } = req.params;
        const userId = req.user?.id;
        const { content } = req.body || {};

        // Validation des champs requis
        if (!postId) {
            return jsonResponse(res, "ID du post requis", 400, null);
        }
        if (!userId) {
            return jsonResponse(res, "Utilisateur non authentifié", 401, null);
        }

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        // Vérifier si l'utilisateur a déjà retweeté ce post
        const existingRetweet = await Share.findOne({
            post: postId,
            user: userId,
        });

        if (existingRetweet) {
            return jsonResponse(res, "Vous avez déjà retweeté ce post", 400, null);
        }

        const retweet = new Share({
            post: postId,
            user: userId,
            content: content || "",
        });

        await retweet.save();

        // Mettre à jour le post original
        if (!post.shares) {
            post.shares = []; // Initialiser le tableau si non défini
        }
        post.shares.push(retweet._id);
        await post.save();

        // Notification au propriétaire du post
        if (post.author.toString() !== userId) {
            await notificationManager.sendNotification({
                sender: userId,
                receiver: post.author,
                type: "retweet",
                post: postId,
                share: retweet._id,
                message: "a retweeté votre post",
            });
        }

        return jsonResponse(res, "Retweet ajouté avec succès", 201, retweet);
    } catch (error) {
        console.error("Erreur lors de la création du retweet:", error);
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteRetweet = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const retweet = await Share.findOne({
            post: postId,
            user: userId,
        });

        if (!retweet) {
            return jsonResponse(res, "Retweet introuvable", 404, null);
        }

        await Share.findByIdAndDelete(retweet._id);

        // Mettre à jour le post original
        post.shares = post.shares.filter(
            (rt) => rt.toString() !== retweet._id.toString()
        );
        await post.save();

        return jsonResponse(res, "Retweet supprimé avec succès", 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

// Bookmarks (Signets)
const createBookmark = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        // Vérification que l'utilisateur est bien authentifié
        if (!userId) {
            return jsonResponse(res, 'Utilisateur non authentifié', 401, null);
        }

        console.log(`Création d'un bookmark - User ID: ${userId}, Post ID: ${postId}`);

        const post = await Post.findById(postId);
        if (!post) {
            return jsonResponse(res, "Post introuvable", 404, null);
        }

        const existingBookmark = await Bookmark.findOne({
            post: postId,
            user: userId,
        });
        if (existingBookmark) {
            return jsonResponse(res, "Ce post est déjà dans vos signets", 400, null);
        }

        const bookmark = new Bookmark({
            post: postId,
            user: userId,
        });

        // Validation explicite avant sauvegarde
        try {
            await bookmark.validate();
        } catch (validationError) {
            console.error('Erreur de validation du bookmark:', validationError);
            return jsonResponse(res, `Erreur de validation: ${validationError.message}`, 400, null);
        }

        await bookmark.save();
        console.log(`Bookmark créé avec succès - ID: ${bookmark._id}`);

        return jsonResponse(res, "Post ajouté aux signets", 201, bookmark);
    } catch (error) {
        console.error('Erreur lors de la création du bookmark:', error);
        return jsonResponse(res, error.message, 500, null);
    }
};

const deleteBookmark = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        const bookmark = await Bookmark.findOne({ post: postId, user: userId });
        if (!bookmark) {
            return jsonResponse(res, "Signet introuvable", 404, null);
        }

        await Bookmark.findByIdAndDelete(bookmark._id);

        return jsonResponse(res, "Signet supprimé avec succès", 200, null);
    } catch (error) {
        return jsonResponse(res, error.message, 500, null);
    }
};

const getUserBookmarks = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Vérification que l'utilisateur est bien authentifié
        if (!userId) {
            console.error('Récupération des bookmarks - Utilisateur non authentifié');
            return jsonResponse(res, 'Utilisateur non authentifié', 401, null);
        }

        console.log(`Récupération des bookmarks pour l'utilisateur: ${userId}`);

        const bookmarks = await Bookmark.find({ user: userId })
            .populate({
                path: "post",

            })
            .sort({ createdAt: -1 });

        console.log(`${bookmarks.length} bookmarks trouvés pour l'utilisateur ${userId}`);

        // Filtrer les posts null (qui pourraient avoir été supprimés)
        const validBookmarks = bookmarks.filter(bookmark => bookmark.post);
        if (validBookmarks.length < bookmarks.length) {
            console.log(`${bookmarks.length - validBookmarks.length} bookmarks avec des posts supprimés ont été filtrés`);
        }

        // Extraire les posts et ajouter manuellement les informations nécessaires
        const posts = await Promise.all(validBookmarks.map(async (bookmark) => {
            const post = bookmark.post;

            // Récupérer les likes, commentaires et retweets séparément
            if (post) {
                // Compter les likes au lieu de les récupérer complètement
                const likesCount = await Interaction.countDocuments({ post: post._id, like: true });
                post.likesCount = likesCount;

                // Compter les commentaires
                const commentsCount = await Comment.countDocuments({ post: post._id });
                post.commentsCount = commentsCount;

                return post;
            }
            return null;
        }));

        // Filtrer les posts null
        const validPosts = posts.filter(post => post !== null);

        console.log(`Retour de ${validPosts.length} posts valides`);
        return jsonResponse(res, 'Signets récupérés avec succès', 200, validPosts);
    } catch (error) {
        console.error('Erreur lors de la récupération des bookmarks:', error);
        return jsonResponse(res, error.message, 500, null);
    }
};

// Followers
const followUser = async (req, res) => {
    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    try {
        const { userId } = req.params;
        const followerId = req.user?.id;

        // Vérification que l'utilisateur est bien authentifié
        if (!followerId) {
            return jsonResponse(res, "Utilisateur non authentifié", 401, null);
        }

        console.log(`Demande de follow: ${followerId} veut suivre ${userId}`);

        // Vérifier que l'utilisateur ne tente pas de se suivre lui-même
        if (userId === followerId) {
            return jsonResponse(res, "Vous ne pouvez pas vous suivre vous-même", 400, null);
        }

        const user = await User.findById(userId);
        if (!user) {
            return jsonResponse(res, "Utilisateur introuvable", 404, null);
        }

        const follower = await User.findById(followerId);
        if (!follower) {
            return jsonResponse(res, "Utilisateur introuvable", 404, null);
        }

        // Vérifier si l'utilisateur suit déjà la cible avec conversion explicite en chaîne
        const isAlreadyFollowing = follower.following.some(id => id.toString() === userId.toString());
        if (isAlreadyFollowing) {
            return jsonResponse(res, "Vous suivez déjà cet utilisateur", 400, null);
        }

        // Ajouter la relation d'abonnement
        follower.following.push(userId);
        user.followers.push(followerId);

        console.log(`Avant sauvegarde - Abonnements de ${follower.username}:`, follower.following.length);
        console.log(`Avant sauvegarde - Abonnés de ${user.username}:`, user.followers.length);

        await follower.save();
        await user.save();

        console.log(`${follower.username} suit maintenant ${user.username}`);

        // Envoyer une notification à l'utilisateur suivi
        await notificationManager.sendNotification({
            sender: followerId,
            receiver: userId,
            type: "follow",
            message: `${follower.username} vous suit désormais`,
        });

        return jsonResponse(res, "Utilisateur suivi avec succès", 201, {
            follower: {
                _id: follower._id,
                username: follower.username,
                name: follower.name,
                image: follower.image
            },
            following: {
                _id: user._id,
                username: user.username,
                name: user.name,
                image: user.image
            }
        });
    } catch (error) {
        console.error("Erreur lors du follow:", error);
        return jsonResponse(res, error.message, 500, null);
    }
};

const unfollowUser = async (req, res) => {
    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    try {
        const { userId } = req.params;
        const followerId = req.user?.id;
        console.log("Désabonnement - IDs:", { userId, followerId });

        // Vérification que l'utilisateur est bien authentifié
        if (!followerId) {
            return jsonResponse(res, "Utilisateur non authentifié", 401, null);
        }

        console.log(`Demande d'unfollow: ${followerId} ne veut plus suivre ${userId}`);

        // Vérifier que l'utilisateur ne tente pas de se désabonner de lui-même
        if (userId === followerId) {
            return jsonResponse(res, "Opération invalide", 400, null);
        }

        const user = await User.findById(userId);
        if (!user) {
            return jsonResponse(res, "Utilisateur introuvable", 404, null);
        }

        const follower = await User.findById(followerId);
        if (!follower) {
            return jsonResponse(res, "Utilisateur introuvable", 404, null);
        }

        // Vérifier si l'utilisateur suit bien la cible
        const isFollowing = follower.following.some(id => id.toString() === userId.toString());
        if (!isFollowing) {
            return jsonResponse(res, "Vous ne suivez pas cet utilisateur", 400, null);
        }

        // Supprimer la relation d'abonnement avec conversion explicite en chaîne
        follower.following = follower.following.filter(id => id.toString() !== userId.toString());
        user.followers = user.followers.filter(id => id.toString() !== followerId.toString());

        console.log(`Après filtrage - Abonnements de ${follower.username}:`, follower.following.length);
        console.log(`Après filtrage - Abonnés de ${user.username}:`, user.followers.length);

        await follower.save();
        await user.save();

        console.log(`${follower.username} ne suit plus ${user.username}`);

        // Envoyer une notification à l'utilisateur qui n'est plus suivi
        await notificationManager.sendNotification({
            sender: followerId,
            receiver: userId,
            type: "unfollow",
            message: `${follower.username} ne vous suit plus`,
        });

        return jsonResponse(res, "Utilisateur non suivi avec succès", 200, {
            follower: {
                _id: follower._id,
                username: follower.username
            },
            unfollowed: {
                _id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error("Erreur lors de l'unfollow:", error);
        return jsonResponse(res, error.message, 500, null);
    }
};

const getRetweetsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`Récupération des retweets pour l'utilisateur: ${userId}`);

        // Vérifier que l'ID utilisateur est valide
        if (!userId || userId === 'undefined') {
            console.error('ID utilisateur invalide:', userId);
            return jsonResponse(res, 'ID utilisateur invalide', 400, null);
        }

        // Récupérer les retweets pour cet utilisateur
        const retweets = await Share.find({ user: userId })
            .populate({
                path: 'post',
                populate: {
                    path: 'author',
                    select: 'name username image'
                }
            })
            .populate('user', 'name username image')
            .sort({ createdAt: -1 });

        console.log(`${retweets.length} retweets trouvés pour l'utilisateur ${userId}`);

        if (!retweets || retweets.length === 0) {
            return jsonResponse(res, 'Aucun retweet trouvé pour cet utilisateur', 200, []);
        }

        return jsonResponse(res, 'Retweets récupérés avec succès', 200, retweets);
    } catch (error) {
        console.error('Erreur lors de la récupération des retweets:', error);
        return jsonResponse(res, error.message, 500, null);
    }
};

module.exports = {
    createLike,
    getLikesByUser,
    deleteLike,
    createDislike,
    deleteDislike,
    createComment,
    deleteComment,
    getComments,
    answerComment,
    createRetweet,
    deleteRetweet,
    getRetweetsByUser,
    createBookmark,
    deleteBookmark,
    getUserBookmarks,
    followUser,
    unfollowUser,
};
