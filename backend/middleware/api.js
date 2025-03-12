require('dotenv').config();
const validApiKey = process.env.API_KEY;

const apiMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === validApiKey) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
};

module.exports = { apiMiddleware };
