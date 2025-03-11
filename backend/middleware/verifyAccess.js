const jwt = require("jsonwebtoken");
const jsonResponse = require("../utils/jsonResponse");

const verifyAccess = (userRole) => {
    return (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) return jsonResponse(res, "No token provided", 401, null);
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return jsonResponse(res, "Invalid token", 401, null);
            req.user = decoded;
            if (req.user.role !== userRole) return jsonResponse(res, "Unauthorized", 403, null);
            next();
        });
    }
}

module.exports = verifyAccess