const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jsonResponse = require("../utils/jsonResponse");

const login = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return jsonResponse(res, "Utilisateur introuvable", 400, null);
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return jsonResponse(res, "Mot de passe incorrect", 400, null);
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );
    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" },
    );

    jsonResponse(res, "Connexion réussie", 200, {
      token: token,
      refreshToken: refreshToken
    });
  } catch (e) {
    console.log(e);
    jsonResponse(res, e.message || "Erreur lors de la connexion", 400, null);
  }
};

const register = async (req, res) => {
  try {
    const { name, username, email, password, acceptNotification, acceptCamera, acceptTerms } = req.body;

    let existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email
          ? 'Cet email est déjà utilisé'
          : 'Ce nom d\'utilisateur est déjà utilisé'
      });
    }

    // Crypter le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur avec l'image
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      image: req.files.image ? `/uploads/${req.files.image[0].filename}` : '',
      banner: req.files.banner ? `/uploads/${req.files.banner[0].filename}` : '',
      acceptNotification: acceptNotification === 'true',
      acceptCamera: acceptCamera === 'true',
      acceptTerms: acceptTerms === 'true',
      createdAt: new Date()
    });

    // Sauvegarder l'utilisateur
    await newUser.save();

    // Retourner l'utilisateur créé
    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        image: newUser.image,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
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
    jsonResponse(res, users, 200, null);
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

const updateUser = async (req, res) => {
  const userId = req.user.id;
  const { name, username, email, password, acceptNotification, acceptCamera, acceptTerms } = req.body;

  const user = await User.findByIdAndUpdate(userId, req.body, { new: true }).select("-password");

  if (!user) {
    return jsonResponse(res, "Utilisateur introuvable", 404, null);
  }
  
  jsonResponse(res, user, 200, null);
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
    jsonResponse(res, "Utilisateur supprimé", 200, null);
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

const getCurrentUser = async (req, res) => {
  console.log(req.headers);
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  jsonResponse(res, "Utilisateur récupéré", 200, user);
};

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return jsonResponse(res, 'Utilisateur introuvable', 404, null);
    }
    jsonResponse(res, 'Profil utilisateur récupéré', 200, user);
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

module.exports = { login, register, updateUser, deleteUser, getUsers, getCurrentUser, followUser, unfollowUser, getUserProfile };
