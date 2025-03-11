const Hashtag = require("../models/Hashtag");

const createHashtag = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      return res.status(400).send("Le nom du hashtag est requis");
    }

    let hashtag = await Hashtag.findOne({ name });

    if (hashtag) {
      return res.status(400).send("Ce hashtag existe déjà");
    }

    hashtag = new Hashtag({ name });
    await hashtag.save();

    res.status(201).send(hashtag);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteHashtag = async (req, res) => {
  const { hashtagId } = req.params;
  try {
    const hashtag = await Hashtag.findByIdAndDelete(hashtagId);

    if (!hashtag) {
      return res.status(404).send("Hashtag introuvable");
    }

    res.status(200).send({ message: "Hashtag supprimé avec succès" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllHashtags = async (req, res) => {
  try {
    const hashtags = await Hashtag.find();
    res.status(200).send(hashtags);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getHashtagById = async (req, res) => {
  const { hashtagId } = req.params;
  try {
    const hashtag = await Hashtag.findById(hashtagId).populate("posts");
    if (!hashtag) {
      return res.status(404).send("Hashtag introuvable");
    }
    res.status(200).send(hashtag);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  createHashtag,
  deleteHashtag,
  getAllHashtags,
  getHashtagById,
};
