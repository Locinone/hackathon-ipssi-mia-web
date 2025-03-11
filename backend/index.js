const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const themeRoutes = require("./routes/themeRoutes");
const scoreThemeRoutes = require("./routes/scoreThemeRoutes");
const logger = require("./utils/logger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/scoreThemes", scoreThemeRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.success("Connected to MongoDB");
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB");
    logger.error(err);
  });

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
