const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const logger = require("./utils/logger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

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
