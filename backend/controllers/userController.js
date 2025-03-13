const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jsonResponse = require("../utils/jsonResponse");
const NotificationManager = require("../utils/notificationManager");

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
    // Vérifier que l'utilisateur ne tente pas de se suivre lui-même
    if (id === userId) {
      return res.status(400).json({
        status: 400,
        message: "Vous ne pouvez pas vous suivre vous-même",
        data: null
      });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({
        status: 404,
        message: "Utilisateur introuvable",
        data: null
      });
    }

    // Vérifier si l'utilisateur suit déjà la cible avec conversion explicite en chaîne
    const isAlreadyFollowing = currentUser.following.some(followingId => followingId.toString() === id.toString());
    if (isAlreadyFollowing) {
      return res.status(400).json({
        status: 400,
        message: "Vous suivez déjà cet utilisateur",
        data: null
      });
    }

    // Ajouter la relation d'abonnement
    currentUser.following.push(id);
    userToFollow.followers.push(userId);

    console.log(`Avant sauvegarde - Abonnements de ${currentUser.username}:`, currentUser.following.length);
    console.log(`Avant sauvegarde - Abonnés de ${userToFollow.username}:`, userToFollow.followers.length);

    await currentUser.save();
    await userToFollow.save();

    console.log(`${currentUser.username} suit maintenant ${userToFollow.username}`);

    // Envoyer une notification à l'utilisateur suivi
    await notificationManager.sendNotification({
      sender: userId,
      receiver: id,
      type: "follow",
      message: `${currentUser.username} vous suit désormais`,
    });

    return res.status(200).json({
      status: 200,
      message: "Utilisateur suivi avec succès",
      data: {
        follower: {
          _id: currentUser._id,
          username: currentUser.username,
          name: currentUser.name,
          image: currentUser.image
        },
        following: {
          _id: userToFollow._id,
          username: userToFollow.username,
          name: userToFollow.name,
          image: userToFollow.image
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors du follow:", error);
    return res.status(500).json({
      status: 500,
      message: error.message,
      data: null
    });
  }
};

const unfollowUser = async (req, res) => {
  const io = req.app.get("io");
  const notificationManager = new NotificationManager(io);

  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Vérifier que l'utilisateur ne tente pas de se désabonner de lui-même
    if (id === userId) {
      return res.status(400).json({
        status: 400,
        message: "Opération invalide",
        data: null
      });
    }

    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToUnfollow) {
      return res.status(404).json({
        status: 404,
        message: "Utilisateur introuvable",
        data: null
      });
    }

    // Vérifier si l'utilisateur suit bien la cible avec conversion explicite en chaîne
    const isFollowing = currentUser.following.some(followingId => followingId.toString() === id.toString());
    if (!isFollowing) {
      return res.status(400).json({
        status: 400,
        message: "Vous ne suivez pas cet utilisateur",
        data: null
      });
    }

    // Supprimer la relation d'abonnement avec conversion explicite en chaîne
    currentUser.following = currentUser.following.filter(followingId => followingId.toString() !== id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter(followerId => followerId.toString() !== userId.toString());

    console.log(`Après filtrage - Abonnements de ${currentUser.username}:`, currentUser.following.length);
    console.log(`Après filtrage - Abonnés de ${userToUnfollow.username}:`, userToUnfollow.followers.length);

    await currentUser.save();
    await userToUnfollow.save();

    console.log(`${currentUser.username} ne suit plus ${userToUnfollow.username}`);

    // Envoyer une notification à l'utilisateur qui n'est plus suivi
    await notificationManager.sendNotification({
      sender: userId,
      receiver: id,
      type: "unfollow",
      message: `${currentUser.username} ne vous suit plus`,
    });

    return res.status(200).json({
      status: 200,
      message: "Désabonnement effectué avec succès",
      data: {
        follower: {
          _id: currentUser._id,
          username: currentUser.username
        },
        unfollowed: {
          _id: userToUnfollow._id,
          username: userToUnfollow.username
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'unfollow:", error);
    return res.status(500).json({
      status: 500,
      message: error.message,
      data: null
    });
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
  try {
    const userId = req.user.id;
    const updateData = req.body;

    console.log("Données reçues pour mise à jour:", updateData);

    // Mise à jour de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: "Utilisateur non trouvé",
        data: null
      });
    }

    console.log("Utilisateur mis à jour:", updatedUser);

    return res.status(200).json({
      status: 200,
      message: "Utilisateur mis à jour avec succès",
      data: updatedUser
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return res.status(500).json({
      status: 500,
      message: `Erreur lors de la mise à jour de l'utilisateur: ${error.message}`,
      data: null
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Si un ID est fourni dans les paramètres, vérifier les autorisations
    if (req.params.id && req.params.id !== userId) {
      // Seul un admin peut supprimer un autre utilisateur
      if (req.user.role !== "admin") {
        return jsonResponse(res, "Vous n'êtes pas autorisé à supprimer cet utilisateur", 403, null);
      }

      // Supprimer l'utilisateur spécifié
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return jsonResponse(res, "Utilisateur introuvable", 404, null);
      }

      return jsonResponse(res, "Utilisateur supprimé par l'administrateur", 200, null);
    }

    // Suppression de son propre compte
    console.log(`Suppression du compte utilisateur: ${userId}`);
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return jsonResponse(res, "Utilisateur introuvable", 404, null);
    }

    // Nettoyer les références à cet utilisateur dans d'autres collections si nécessaire
    // Par exemple, supprimer les abonnements et abonnés
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );

    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    return jsonResponse(res, "Votre compte a été supprimé avec succès", 200, null);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return jsonResponse(res, error.message, 500, null);
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

  const userId = req.user.id;
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return jsonResponse(res, 'Utilisateur introuvable', 404, null);
    }
    console.log(`Vérification des relations pour l'utilisateur: ${userId}`);
    if (userId) {
      // Convertir les ObjectId en chaînes pour la comparaison
      const userIdStr = userId.toString();

      // Vérifier si l'utilisateur connecté suit ce profil avec conversion explicite en chaîne
      const isFollowing = user.followers.some(follower =>
        follower.toString() === userIdStr
      );

      // Vérifier si ce profil suit l'utilisateur connecté avec conversion explicite en chaîne
      const isFollowed = user.following.some(follow =>
        follow.toString() === userIdStr
      );

      console.log(`Relation - ${username} est suivi par l'utilisateur connecté: ${isFollowing}`);
      console.log(`Relation - ${username} suit l'utilisateur connecté: ${isFollowed}`);

      return jsonResponse(res, 'Profil utilisateur récupéré', 200, { ...user.toObject(), isFollowing: isFollowing ? true : false, isFollowed: isFollowed ? true : false });
    } else {
      jsonResponse(res, 'Profil utilisateur récupéré', 200, user);
    }
  } catch (error) {
    jsonResponse(res, error.message, 500, null);
  }
};

// Nouveau contrôleur pour récupérer les abonnés d'un utilisateur
const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    console.log(`Récupération des abonnés pour l'utilisateur: ${userId}`);

    // Vérifier que l'ID utilisateur est valide
    if (!userId) {
      return jsonResponse(res, 'ID utilisateur invalide', 400, null);
    }

    // Récupérer l'utilisateur avec ses abonnés
    const user = await User.findById(userId).select('followers');

    if (!user) {
      return jsonResponse(res, 'Utilisateur introuvable', 404, null);
    }

    // Récupérer les détails des abonnés
    const followers = await User.find({ _id: { $in: user.followers } })
      .select('_id name username image following');

    console.log(`${followers.length} abonnés trouvés pour l'utilisateur ${userId}`);

    // Si l'utilisateur est connecté, vérifier pour chaque abonné s'il est suivi par l'utilisateur connecté
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select('following');

      if (currentUser) {
        // Ajouter un champ isFollowing à chaque abonné
        const followersWithRelation = followers.map(follower => {
          const isFollowing = currentUser.following.some(id => id.toString() === follower._id.toString());
          return {
            ...follower.toObject(),
            isFollowing
          };
        });

        return jsonResponse(res, 'Abonnés récupérés avec succès', 200, followersWithRelation);
      }
    }

    return jsonResponse(res, 'Abonnés récupérés avec succès', 200, followers);
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnés:', error);
    return jsonResponse(res, error.message, 500, null);
  }
};

// Nouveau contrôleur pour récupérer les abonnements d'un utilisateur
const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    console.log(`Récupération des abonnements pour l'utilisateur: ${userId}`);

    // Vérifier que l'ID utilisateur est valide
    if (!userId) {
      return jsonResponse(res, 'ID utilisateur invalide', 400, null);
    }

    // Récupérer l'utilisateur avec ses abonnements
    const user = await User.findById(userId).select('following');

    if (!user) {
      return jsonResponse(res, 'Utilisateur introuvable', 404, null);
    }

    // Récupérer les détails des abonnements
    const following = await User.find({ _id: { $in: user.following } })
      .select('_id name username image');

    console.log(`${following.length} abonnements trouvés pour l'utilisateur ${userId}`);

    // Pour les abonnements, on sait déjà que l'utilisateur les suit
    // Mais si l'utilisateur connecté est différent, on vérifie s'il suit ces utilisateurs
    if (currentUserId && currentUserId !== userId) {
      const currentUser = await User.findById(currentUserId).select('following');

      if (currentUser) {
        // Ajouter un champ isFollowing à chaque abonnement
        const followingWithRelation = following.map(follow => {
          const isFollowing = currentUser.following.some(id => id.toString() === follow._id.toString());
          return {
            ...follow.toObject(),
            isFollowing
          };
        });

        return jsonResponse(res, 'Abonnements récupérés avec succès', 200, followingWithRelation);
      }
    } else {
      // Si c'est l'utilisateur lui-même qui consulte ses abonnements, ils sont tous suivis
      const followingWithRelation = following.map(follow => ({
        ...follow.toObject(),
        isFollowing: true
      }));

      return jsonResponse(res, 'Abonnements récupérés avec succès', 200, followingWithRelation);
    }

    return jsonResponse(res, 'Abonnements récupérés avec succès', 200, following);
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    return jsonResponse(res, error.message, 500, null);
  }
};

module.exports = {
  login,
  register,
  updateUser,
  deleteUser,
  getUsers,
  getCurrentUser,
  followUser,
  unfollowUser,
  getUserProfile,
  getUserFollowers,
  getUserFollowing
};
