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
const trendingRoutes = require('./routes/trendingRoutes');
const Notification = require("./models/Notification");
const logger = require("./utils/logger");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Remplacer par l'URL exacte du frontend
  credentials: true, // Permettre l'envoi de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.success("✅ Connecté à MongoDB"))
  .catch((err) => {
    logger.error("❌ Erreur lors de la connexion à MongoDB:", err);
    process.exit(1);
  });

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
app.use('/api/trendings', trendingRoutes);

// Middleware d'authentification pour WebSocket
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    console.error(
      "❌ Token manquant :",
      socket.handshake.auth,
      socket.handshake.query,
    );
    return next(new Error("Authentication error"));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Utilisateur vérifié :", user);
    socket.user = user;
    next();
  } catch (err) {
    console.error("❌ Token invalide :", err.message);
    next(new Error("Authentication error"));
  }
});

// Gestion des connexions WebSocket
io.on("connection", async (socket) => {
  const userId = socket.user.id;

  if (userId) {
    socket.join(userId);
    console.log(`✅ Utilisateur rejoint la room : ${userId}`);

    // try {
    //   const notifications = await Notification.find({ receiver: userId }).sort({
    //     createdAt: -1,
    //   });
    //
    //   if (notifications.length > 0) {
    //     socket.emit("notifications", notifications);
    //     console.log(`🔔 Notifications envoyées directement à ${userId}`);
    //   } else {
    //     console.log(`ℹ️ Aucune notification pour ${userId}`);
    //   }
    // } catch (error) {
    //   console.error("❌ Erreur lors de l'envoi des notifications :", error);
    // }
  }

  // Réception d'une notification en temps réel
  socket.on("notification", (data) => {
    console.log("🔔 Notification reçue en temps réel:", data);
    io.to(data.receiver).emit("notification", data);
  });

  // Événement de test
  socket.on("test-notification", (data) => {
    console.log("📨 Notification test reçue:", data);
    socket.emit("notification", data);
    console.log(`📤 Notification test envoyée directement à ${socket.user.id}`);
  });

  // Gestion de la déconnexion
  socket.on("disconnect", () => {
    console.log(`⚠️ Utilisateur déconnecté : ${socket.id}`);
  });
});

server.listen(PORT, () => {
  logger.info(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
