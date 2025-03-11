const Post = require("../models/Post");
const Hashtag = require("../models/Hashtag");

const createPost = async (req, res) => {
  const authorId = req.user.id;
  const { content, file, hashtags } = req.body;

  try {
    if (!content || !hashtags || hashtags.length === 0) {
      return res.status(400).send("Merci de remplir tous les champs");
    }

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

    const post = new Post({
      content,
      file,
      author: authorId,
      hashtags: hashtagIds,
    });

    await post.save();

    await Promise.all(
      hashtagIds.map(async (id) => {
        await Hashtag.findByIdAndUpdate(id, { $addToSet: { posts: post._id } });
      }),
    );

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username email")
      .populate("hashtags", "name");

    res.status(201).send(populatedPost);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  const userId = req.user.id;
  const { content, file, hashtags } = req.body;

  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à modifier ce post");
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

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "username email")
      .populate("hashtags", "name");

    res.status(200).send(updatedPost);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  const userId = req.user.id;
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à supprimer ce post");
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).send("Post supprimé avec succès");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .populate("hashtags", "name");
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "username email")
      .populate("hashtags", "name");

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    res.status(200).send(post);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username email")
      .populate("hashtags", "name");
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostById,
  getPostsByUserId,
};
