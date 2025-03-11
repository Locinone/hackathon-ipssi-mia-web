const express = require("express");
const userController = require("../controllers/userController");
const { authenticateJWT } = require("../middleware/auth");
const zodValidator = require("../middleware/zodValidator");
const { registerSchema } = require("../validators/authSchemas");
const verifyAccess = require("../middleware/verifyAccess");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const router = express.Router();

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Créer le dossier uploads s'il n'existe pas
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Obtenir l'extension basée sur le mimetype
        let ext = '';
        if (file.mimetype === 'image/jpeg') ext = '.jpg';
        else if (file.mimetype === 'image/png') ext = '.png';
        else if (file.mimetype === 'image/gif') ext = '.gif';
        else if (file.mimetype === 'image/webp') ext = '.webp';
        else ext = '.jpg'; // extension par défaut

        // Générer un nom de fichier unique avec l'extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non pris en charge'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

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
router.put("/update/:id", authenticateJWT, verifyAccess("admin"), userController.updateUser);
router.delete("/delete/:id", authenticateJWT, verifyAccess("admin"), userController.deleteUser);
router.get("/me", authenticateJWT, userController.getCurrentUser);
router.post("/follow/:id", authenticateJWT, userController.followUser);
router.post("/unfollow/:id", authenticateJWT, userController.unfollowUser);
module.exports = router;
