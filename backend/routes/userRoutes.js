const express = require("express");
const userController = require("../controllers/userController");
const { authenticateJWT } = require("../middleware/auth");
const zodValidator = require("../middleware/zodValidator");
const { registerSchema, updateUserSchema } = require("../validators/authSchemas");
const verifyAccess = require("../middleware/verifyAccess");
const upload = require("../middleware/upload");
const User = require('../models/User');

const router = express.Router();

router.post("/login", userController.login);
router.post("/register",
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    zodValidator(registerSchema, 'body'),
    userController.register
);
router.get("/getusers", userController.getUsers);
router.put("/update", authenticateJWT, zodValidator(updateUserSchema, 'body'), userController.updateUser);
router.delete("/delete/:id", authenticateJWT, verifyAccess("admin"), userController.deleteUser);
router.get("/me", authenticateJWT, userController.getCurrentUser);
router.post("/follow/:id", authenticateJWT, userController.followUser);
router.post("/unfollow/:id", authenticateJWT, userController.unfollowUser);
router.get('/profile/:username', userController.getUserProfile);

// Nouvelles routes pour récupérer les abonnés et les abonnements
router.get('/followers/:userId', userController.getUserFollowers);
router.get('/following/:userId', userController.getUserFollowing);

module.exports = router;
