const Post = require("../models/Post");
const Hashtag = require("../models/Hashtag");
const Theme = require("../models/Theme");
const ScoreTheme = require("../models/ScoreTheme");
const Share = require("../models/Share");
const Interaction = require("../models/Interaction");
const Bookmark = require("../models/Bookmark");
const User = require("../models/User");
const jsonResponse = require("../utils/jsonResponse");
const NotificationManager = require("../utils/notificationManager");
const axios = require("axios");

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
      })
    );

    const filesPaths = files.map((file) => `/uploads/${file.filename}`);

    let flaskResponse;
    let themesId;
    try {
      const data = { text: [content] };
      const config = { headers: { "Content-Type": "application/json", "x-api-key": process.env.API_KEY } };
      const flaskApiHostname = process.env.FLASK_API_HOSTNAME || 'localhost';
      const response = await axios.post(`http://${flaskApiHostname}:5010/analyze`, data, config);
      flaskResponse = response.data;

      const dominantThemes = flaskResponse["processed_text"][0]["dominant_theme"] || [];
      themesId = await Promise.all(
        dominantThemes.map(async (themeStat) => {
          let theme = await Theme.findOne({ name: themeStat["word"] });
          if (!theme) {
            theme = new Theme({ name: themeStat["word"] });
            await theme.save();
          }

          if (themeStat["compound"] != 0.0) {
            const scoreTheme = new ScoreTheme({
              score: themeStat["compound"] * 100,
              theme: theme._id,
              user: authorId,
            });
            await scoreTheme.save();
          }
          return theme._id;
        })
      );
    } catch (flaskError) {
      console.error("Error calling Flask API:", flaskError.message);
      flaskResponse = { error: "Flask API failed" };
    }


    const post = new Post({
      content,
      files: filesPaths,
      author: authorId,
      hashtags: hashtagIds,
      themes: themesId || [],
    });

    await post.save();

    await Promise.all(
      hashtagIds.map(async (id) => {
        await Hashtag.findByIdAndUpdate(id, { $addToSet: { posts: post._id } });
      })
    );

    if (themesId) {
      await Promise.all(
        themesId.map(async (id) => {
          await Theme.findByIdAndUpdate(id, { $addToSet: { posts: post._id } });
        })
      );
    }

    const followers = await User.find({ following: authorId }).select("_id");

    await Promise.all(
      followers.map((follower) =>
        notificationManager.sendNotification({
          sender: authorId,
          receiver: follower._id,
          type: "post",
          post: post._id,
          message: "Un utilisateur que vous suivez a publié un nouveau post.",
        })
      )
    );


    const populatedPost = await Post.findById(post._id)
      .populate("author", "username email")
      .populate("hashtags", "name")
      .populate("themes", "name");

    jsonResponse(res, "Post créé avec succès", 201, {
      post: populatedPost,
    });

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
  const { h, u, s, sd, ed, order } = req.query;
  console.log("h", h);
  console.log("u", u);
  console.log("s", s);
  console.log("sd", sd);
  console.log("ed", ed);
  console.log("order", order);

  try {
    // Déterminer l'ordre de tri
    let sortOption = { createdAt: -1 }; // Par défaut, du plus récent au plus ancien

    if (order === 'likes') {
      sortOption = { likesCount: -1 };
    } else if (order === 'dislikes') {
      sortOption = { dislikesCount: -1 };
    } else if (order === 'shares') {
      sortOption = { sharesCount: -1 };
    }

    // Query de base
    let query = {};

    // Filtres pour les dates
    if (sd && ed) {
      query.createdAt = {
        $gte: new Date(sd),
        $lte: new Date(ed)
      };
    } else if (sd) {
      query.createdAt = { $gte: new Date(sd) };
    } else if (ed) {
      query.createdAt = { $lte: new Date(ed) };
    }

    let posts = await Post.find(query)
      .sort(sortOption)
      .populate("files")
      .populate("author", "username name")
      .populate("hashtags", "name")
      .populate("themes", "name")
      .populate("comments", "author")
      .populate("shares", "author")

    // Filtres côté application
    if (h) {
      posts = posts.filter(post => post.hashtags.some(hashtag => hashtag.name.toLowerCase() === "#" + h.toLowerCase()));
    }

    if (u) {
      posts = posts.filter(post =>
        post.author.username.toLowerCase() === u.toLowerCase()
        || post.author.username.toLowerCase().includes(u.toLowerCase())
        || post.author.name.toLowerCase().includes(u.toLowerCase())
        || post.author.username.toLowerCase().includes("@" + u.toLowerCase())
        || post.author.name.toLowerCase().includes("@" + u.toLowerCase())
      );
    }

    if (s) {
      posts = posts.filter(post => post.content.toLowerCase().includes(s.toLowerCase()));
    }

    // Trier les posts selon l'option de tri
    if (order) {
      // Utiliser le paramètre order directement pour le tri
      if (order === "likes") {
        posts.sort((a, b) => b.likes.length - a.likes.length);
      } else if (order === "dislikes") {
        posts.sort((a, b) => b.dislikes.length - a.dislikes.length);
      } else if (order === "shares") {
        posts.sort((a, b) => b.shares.length - a.shares.length);
      }
    }

    // Ajout des informations d'interaction
    if (userId) {
      const updatedPosts = await Promise.all(posts.map(async post => {
        const hasLiked = await Interaction.findOne({ post: post._id, user: userId, like: true });
        const hasDisliked = await Interaction.findOne({ post: post._id, user: userId, like: false });
        const hasShared = await Share.findOne({ post: post._id, user: userId });
        const hasBookmarked = await Bookmark.findOne({ post: post._id, user: userId });

        const author = await User.findById(post.author);
        const isFollowing = await author.followers.some(followerId => followerId.toString() === userId.toString());
        return {
          ...post.toObject(),
          hasLiked: hasLiked ? true : false,
          hasDisliked: hasDisliked ? true : false,
          hasShared: hasShared ? true : false,
          hasBookmarked: hasBookmarked ? true : false,
          author: {
            ...post.author.toObject(),
            isFollowing: isFollowing ? true : false
          }
        };
      }));


      jsonResponse(res, "Posts récupérés avec succès", 200, updatedPosts);
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

    // Ajout des informations d'interaction si l'utilisateur est connecté
    if (req.user?.id) {
      const userId = req.user.id;

      const [hasLiked, hasDisliked, hasShared, hasBookmarked] = await Promise.all([
        Interaction.findOne({ post: post._id, user: userId, like: true }),
        Interaction.findOne({ post: post._id, user: userId, like: false }),
        Share.findOne({ post: post._id, user: userId }),
        Bookmark.findOne({ post: post._id, user: userId })
      ]);

      const author = await User.findById(post.author);
      const isFollowing = await author.followers.some(followerId => followerId.toString() === userId.toString());

      const updatedPost = {
        ...post.toObject(),
        hasLiked: !!hasLiked,
        hasDisliked: !!hasDisliked,
        hasShared: !!hasShared,
        hasBookmarked: !!hasBookmarked,
        author: {
          ...post.author.toObject(),
          isFollowing: isFollowing
        }
      };

      return jsonResponse(res, "Post récupéré avec succès", 200, updatedPost);
    }

    jsonResponse(res, "Post récupéré avec succès", 200, post);
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

const getPostsByUserId = async (req, res) => {

  const userId = req.user.id;

  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username name")
      .populate("hashtags", "name")
      .populate("themes", "name");

    // Récupérer les interactions, commentaires et retweets pour chaque post
    if (userId) {
      const updatedPosts = await Promise.all(posts.map(async post => {
        const hasLiked = await Interaction.findOne({ post: post._id, user: userId, like: true });
        const hasDisliked = await Interaction.findOne({ post: post._id, user: userId, like: false });
        const hasShared = await Share.findOne({ post: post._id, user: userId });
        const hasBookmarked = await Bookmark.findOne({ post: post._id, user: userId });

        const author = await User.findById(post.author);
        const isFollowing = await author.followers.some(followerId => followerId.toString() === userId.toString());
        return {
          ...post.toObject(),
          hasLiked: hasLiked ? true : false,
          hasDisliked: hasDisliked ? true : false,
          hasShared: hasShared ? true : false,
          hasBookmarked: hasBookmarked ? true : false,
          author: {
            ...post.author.toObject(),
            isFollowing: isFollowing ? true : false
          }
        };
      }));

      jsonResponse(res, "Posts récupérés avec succès", 200, updatedPosts);
    } else {
      jsonResponse(res, "Posts récupérés avec succès", 200, posts);
    }
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
