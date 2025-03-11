const Theme = require("../models/Theme");
const Post = require("../models/Post");

const createTheme = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).send("Le nom du thème est requis");
    }

    let existingTheme = await Theme.findOne({ name });

    if (existingTheme) {
      return res.status(400).send("Ce thème existe déjà");
    }

    const theme = new Theme({ name });
    await theme.save();

    res.status(201).send(theme);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteTheme = async (req, res) => {
  const { themeId } = req.params;

  try {
    const theme = await Theme.findByIdAndDelete(themeId);

    if (!theme) {
      return res.status(404).send("Thème introuvable");
    }

    res.status(200).send({ message: "Thème supprimé avec succès" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find();
    res.status(200).send(themes);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getThemeById = async (req, res) => {
  const { themeId } = req.params;

  try {
    const theme = await Theme.findById(themeId).populate("posts");

    if (!theme) {
      return res.status(404).send("Thème introuvable");
    }

    res.status(200).send(theme);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { createTheme, deleteTheme, getAllThemes, getThemeById };
