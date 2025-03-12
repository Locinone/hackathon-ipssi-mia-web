const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
        else if (file.mimetype === 'video/mp4') ext = '.mp4';
        else ext = '.jpg'; // extension par défaut

        // Générer un nom de fichier unique avec l'extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non pris en charge'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max pour être cohérent avec le front-end
});

module.exports = upload;
