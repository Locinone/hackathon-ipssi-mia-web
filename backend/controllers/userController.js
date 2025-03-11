const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const NotificationManager = require("../utils/NotificationManager");
const { userSchema } = require("../validators/userValidator");

const login = async (req, res) => {
  const io = req.app.get("io");
  try {
    userSchema.parse(req.body);

    const email = req.body.email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("Utilisateur introuvable");
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(400).send("Mot de passe incorrect");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    io.emit("user-login", { message: `${user.username} s'est connecté.` });

    res.json({ token });
  } catch (e) {
    res.status(400).json({ message: e.errors });
  }
};

const register = async (req, res) => {
  const io = req.app.get("io");
  try {
    userSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const image = req.body.image || "";

    const newUser = new User({
      username: req.body.username.toLowerCase(),
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      image,
    });

    await newUser.save();

    io.emit("user-register", { message: `${newUser.username} s'est inscrit.` });

    res.status(201).json({ message: "Utilisateur enregistré avec succès" });
  } catch (e) {
    res.status(400).json({ message: e.errors });
  }
};

const followUser = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const { id } = req.params;
  const userId = req.user.id;

  try {
    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToFollow) {
      return res.status(404).send("Utilisateur introuvable");
    }

    if (!currentUser.following.includes(id)) {
      currentUser.following.push(id);
      userToFollow.followers.push(userId);

      await currentUser.save();
      await userToFollow.save();

      await notificationManager.sendNotification({
        sender: userId,
        receiver: id,
        type: "follow",
        message: `${currentUser.username} vous a suivi.`,
      });

      return res.status(200).send("Utilisateur suivi avec succès");
    }

    res.status(400).send("Vous suivez déjà cet utilisateur");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const { id } = req.params;
  const userId = req.user.id;

  try {
    await User.findByIdAndUpdate(userId, { $pull: { following: id } });
    await User.findByIdAndUpdate(id, { $pull: { followers: userId } });

    await notificationManager.sendNotification({
      sender: userId,
      receiver: id,
      type: "unfollow",
      message: "Un utilisateur s'est désabonné de votre profil.",
    });

    res.status(200).send("Utilisateur désabonné avec succès");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.username) {
      filter.username = { $regex: req.query.username, $options: "i" };
    }

    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: "i" };
    }

    const users = await User.find(filter).select("-password");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const userId = req.user.id;
  try {
    if (req.params.id !== userId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à modifier cet utilisateur");
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updateData = { ...req.body };
    if (req.body.image) {
      updateData.image = req.body.image;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).send({ error: "Utilisateur introuvable" });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.user.id;
  try {
    if (req.params.id !== userId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à supprimer cet utilisateur");
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "Utilisateur introuvable" });
    }
    res.status(200).send({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  login,
  register,
  updateUser,
  deleteUser,
  getUsers,
  followUser,
  unfollowUser,
};
