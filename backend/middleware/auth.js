const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateJWT = (req, res, next) => {

  let token = req.headers.authorization;

  if (!token) {
    return res.sendStatus(401);
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateJWT };
