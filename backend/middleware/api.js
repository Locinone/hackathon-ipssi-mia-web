const validApiKey = "your_secret_api_key_here"; // actual API key

const apiMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === validApiKey) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
};

module.exports = { apiMiddleware };
