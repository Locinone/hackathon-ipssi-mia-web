require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const path = require("path");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const themeRoutes = require("./routes/themeRoutes");
const scoreThemeRoutes = require("./routes/scoreThemeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const interactionRoutes = require('./routes/interactionRoutes');
const Notification = require("./models/Notification");
const User = require("./models/User");
const NotificationManager = require("./utils/notificationManager");
const logger = require("./utils/logger");

const app = express();
const server = http.createServer(app);

// Configuration de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // En production, spécifiez l'URL exacte du frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;

// Middleware CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.success("✅ Connecté à MongoDB"))
  .catch((err) => {
    logger.error("❌ Erreur lors de la connexion à MongoDB:", err);
    process.exit(1);
  });

// Rendre l'instance Socket.IO disponible pour les routes
app.set("io", io);

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/scoreThemes", scoreThemeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/interactions', interactionRoutes);

// Middleware d'authentification pour WebSocket
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    console.error("❌ Token manquant pour la connexion WebSocket");
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    console.log(`✅ Utilisateur authentifié pour WebSocket: ${user.id}`);
    next();
  } catch (err) {
    console.error("❌ Token invalide pour WebSocket:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

// Gestion des connexions WebSocket
io.on("connection", async (socket) => {
  const userId = socket.user.id;

  if (userId) {
    // Rejoindre une room spécifique à l'utilisateur pour les notifications ciblées
    socket.join(userId);
    console.log(`✅ Utilisateur ${userId} connecté au WebSocket (${socket.id})`);

    try {
      // Envoyer les notifications non lues à la connexion
      const notifications = await Notification.find({
        receiver: userId,
        isRead: false
      })
        .populate("sender", "name username image")
        .sort({ createdAt: -1 });

      if (notifications.length > 0) {
        socket.emit("notifications", notifications);
        console.log(`🔔 ${notifications.length} notifications envoyées à ${userId}`);
      } else {
        console.log(`ℹ️ Aucune notification non lue pour ${userId}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi des notifications:", error);
    }

    // Écouter les événements de marquage de notification comme lue
    socket.on("mark-notification-read", async (data) => {
      try {
        if (!data.notificationId) {
          console.error("❌ ID de notification manquant");
          return;
        }

        console.log(`📖 Marquage de notification comme lue: ${data.notificationId}`);
        const notificationManager = new NotificationManager(io);
        await notificationManager.markAsRead(data.notificationId, userId);
      } catch (error) {
        console.error("❌ Erreur lors du marquage de la notification:", error);
      }
    });

    // Écouter les événements de suppression de notification
    socket.on("delete-notification", async (data) => {
      try {
        if (!data.notificationId) {
          console.error("❌ ID de notification manquant pour la suppression");
          return;
        }

        console.log(`🗑️ Suppression de notification: ${data.notificationId} par l'utilisateur ${userId}`);

        // Vérifier que la notification existe
        const notification = await Notification.findById(data.notificationId);

        if (!notification) {
          console.log(`Notification ${data.notificationId} non trouvée`);
          return;
        }

        // Vérifier que l'utilisateur est bien le destinataire
        if (notification.receiver.toString() !== userId.toString()) {
          console.log(`L'utilisateur ${userId} n'est pas autorisé à supprimer la notification ${data.notificationId}`);
          return;
        }

        // Supprimer la notification
        await Notification.findByIdAndDelete(data.notificationId);
        console.log(`Notification ${data.notificationId} supprimée avec succès via WebSocket`);

        // Informer le client de la suppression
        io.to(userId).emit("notification-deleted", { _id: data.notificationId });
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de la notification: ${error.message}`);
      }
    });

    // Écouter les événements de test
    socket.on("test-notification", async (data) => {
      try {
        console.log("📨 Notification test reçue:", data);

        // Vérifier si l'utilisateur accepte les notifications
        const user = await User.findById(userId);
        if (user && user.acceptNotification === false) {
          console.log(`ℹ️ L'utilisateur ${userId} n'accepte pas les notifications, test ignoré`);
          return;
        }

        // Créer une notification de test
        const notification = new Notification({
          sender: userId,
          receiver: userId,
          type: "test",
          message: data.message || "Ceci est une notification de test",
          isRead: false,
          createdAt: new Date()
        });

        await notification.save();

        // Enrichir avec les données de l'utilisateur
        const enrichedNotification = {
          ...notification.toObject(),
          sender: {
            _id: socket.user.id,
            name: socket.user.name,
            username: socket.user.name // Utiliser le nom comme username par défaut
          }
        };

        // Envoyer la notification
        socket.emit("notification", enrichedNotification);
        console.log(`📤 Notification test envoyée à ${userId}`);
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi de la notification test:", error);
      }
    });
  }

  // Gestion de la déconnexion
  socket.on("disconnect", () => {
    console.log(`⚠️ Utilisateur déconnecté: ${socket.id}`);
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  logger.info(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  logger.info(`🔌 Socket.IO en attente de connexions`);
});
