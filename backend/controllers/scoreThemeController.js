const ScoreTheme = require("../models/ScoreTheme");
const Theme = require("../models/Theme");
const User = require("../models/User");

const createScoreTheme = async (req, res) => {
  const userId = req.user.id;
  const { score, themeId } = req.body;

  try {
    if (!score || !themeId) {
      return res.status(400).send("Le score et l'ID du thème sont requis");
    }

    const theme = await Theme.findById(themeId);

    if (!theme) {
      return res.status(404).send("Thème introuvable");
    }

    const existingScore = await ScoreTheme.findOne({
      user: userId,
      theme: themeId,
    });

    if (existingScore) {
      existingScore.score = score;
      await existingScore.save();
      return res.status(200).send(existingScore);
    }

    const scoreTheme = new ScoreTheme({
      score,
      theme: themeId,
      user: userId,
    });

    await scoreTheme.save();

    res.status(201).send(scoreTheme);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteScoreTheme = async (req, res) => {
  const userId = req.user.id;
  const { scoreThemeId } = req.params;

  try {
    const scoreTheme = await ScoreTheme.findById(scoreThemeId);

    if (!scoreTheme) {
      return res.status(404).send("Score du thème introuvable");
    }

    if (scoreTheme.user.toString() !== userId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à supprimer ce score");
    }

    await ScoreTheme.findByIdAndDelete(scoreThemeId);
    res.status(200).send({ message: "Score du thème supprimé avec succès" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getScoresByTheme = async (req, res) => {
  const { themeId } = req.params;

  try {
    const scores = await ScoreTheme.find({ theme: themeId }).populate(
      "user",
      "username email",
    );
    res.status(200).send(scores);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getScoresByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const scores = await ScoreTheme.find({ user: userId }).populate(
      "theme",
      "name",
    );
    res.status(200).send(scores);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  createScoreTheme,
  deleteScoreTheme,
  getScoresByTheme,
  getScoresByUser,
};
