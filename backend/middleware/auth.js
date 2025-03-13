const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require('../models/User');

const authenticateJWT = async (req, res, next) => {
  try {
    // Récupérer le token depuis les en-têtes
    const authHeader = req.headers.authorization;
    console.log('En-tête d\'autorisation:', authHeader);

    if (!authHeader) {
      console.log('Aucun en-tête d\'autorisation trouvé');
      return res.status(401).json({ message: 'Accès non autorisé: Token manquant' });
    }

    // Vérifier le format du token (Bearer token)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('Format de token invalide');
      return res.status(401).json({ message: 'Format de token invalide' });
    }

    const token = parts[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('Utilisateur non trouvé pour le token fourni');
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur à l'objet req
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    console.log('Authentification réussie pour l\'utilisateur:', req.user.username);
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = { authenticateJWT };
