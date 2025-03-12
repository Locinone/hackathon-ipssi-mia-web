const Post = require("../models/Post");
const Hashtag = require("../models/Hashtag");
const Theme = require("../models/Theme");
const Share = require("../models/Share");
const Interaction = require("../models/Interaction");
const Bookmark = require("../models/Bookmark");
const User = require("../models/User");
const jsonResponse = require("../utils/jsonResponse");
const NotificationManager = require("../utils/notificationManager");

const createPost = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);
  const authorId = req.user.id;
  const { content } = req.body;
  const files = req.files;

  try {
    if (!content) {
      return jsonResponse(res, "Merci de remplir tous les champs", 400, null);
    }

    console.log("FILES", files);
    const hashtags = content.match(/#\w+/g) || [];
    const hashtagIds = await Promise.all(
      hashtags.map(async (tag) => {
        let hashtag = await Hashtag.findOne({ name: tag });
        if (!hashtag) {
          hashtag = new Hashtag({ name: tag });
          await hashtag.save();
        }
        return hashtag._id;
      }),
    );

    const filesPaths = files.map((file) => `/uploads/${file.filename}`);

    const post = new Post({
      content,
      files: filesPaths,
      author: authorId,
      hashtags: hashtagIds,
    });

    await post.save();

    await Promise.all(
      hashtagIds.map(async (id) => {
        await Hashtag.findByIdAndUpdate(id, { $addToSet: { posts: post._id } });
      }),
    );

    const followers = await User.find({ following: authorId }).select("_id");

    await Promise.all(
      followers.map((follower) =>
        notificationManager.sendNotification({
          sender: authorId,
          receiver: follower._id,
          type: "post",
          post: post._id,
          message: "Un utilisateur que vous suivez a publié un nouveau post.",
        }),
      ),
    );

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username email")
      .populate("hashtags", "name")
      .populate("themes", "name");

    jsonResponse(res, "Post créé avec succès", 201, populatedPost);
  } catch (error) {
    jsonResponse(res, error.message, 400, null);
  }
};

const updatePost = async (req, res) => {

  const userId = req.user.id;
  const { content, file, hashtags, themes } = req.body;

  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return jsonResponse(res, "Post introuvable", 404, null);
    }

    if (post.author.toString() !== userId) {
      return jsonResponse(res, "Vous n'êtes pas autorisé à modifier ce post", 403, null);
    }

    if (content) post.content = content;
    if (file) post.file = file;

    if (hashtags && hashtags.length > 0) {
      const hashtagIds = await Promise.all(
        hashtags.map(async (tag) => {
          let hashtag = await Hashtag.findOne({ name: tag });
          if (!hashtag) {
            hashtag = new Hashtag({ name: tag });
            await hashtag.save();
          }
          return hashtag._id;
        }),
      );
      post.hashtags = hashtagIds;
    }

    if (themes && themes.length > 0) {
      const themeIds = await Promise.all(
        themes.map(async (themeName) => {
          let theme = await Theme.findOne({ name: themeName });
          if (!theme) {
            theme = new Theme({ name: themeName });
            await theme.save();
          }
          return theme._id;
        }),
      );
      post.themes = themeIds;
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "username email")
      .populate("hashtags", "name")
      .populate("themes", "name");

    jsonResponse(res, "Post modifié avec succès", 200, updatedPost);
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

const getPosts = async (req, res) => {
  const userId = req.user?.id || null;
  try {
    const posts = await Post.find()
      .populate("files")
      .populate("author", "username name")
      .populate("hashtags", "name")
      .populate("themes", "name")
      .sort({ createdAt: -1 });

    if (userId) {
      let newPosts = posts.map(async post => {
        const hasLiked = await Interaction.find({ post: post._id, user: userId, like: true });
        const hasDisliked = await Interaction.find({ post: post._id, user: userId, like: false });
        const hasShared = await Share.find({ post: post._id, user: userId });
        const hasBookmarked = await Bookmark.find({ post: post._id, user: userId });
        return { ...post, hasLiked, hasDisliked, hasShared, hasBookmarked };
      });
      jsonResponse(res, "Posts récupérés avec succès", 200, newPosts);
    } else {
      jsonResponse(res, "Posts récupérés avec succès", 200, posts);

    }

  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "username name")
      .populate("hashtags", "name")
      .populate("themes", "name");

    if (!post) {
      return jsonResponse(res, "Post introuvable", 404, null);
    }

    jsonResponse(res, "Post récupéré avec succès", 200, post);
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

const getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username name")
      .populate("hashtags", "name")
      .populate("themes", "name");
    jsonResponse(res, "Posts récupérés avec succès", 200, posts);
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

const deletePost = async (req, res) => {
  const userId = req.user.id;
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return jsonResponse(res, "Post introuvable", 404, null);
    }

    if (post.author.toString() !== userId) {
      return jsonResponse(res, "Vous n'êtes pas autorisé à supprimer ce post", 403, null);
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).send("Post supprimé avec succès");
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

module.exports = {
  createPost,
  updatePost,
  getPosts,
  getPostById,
  getPostsByUserId,
  deletePost,
};
