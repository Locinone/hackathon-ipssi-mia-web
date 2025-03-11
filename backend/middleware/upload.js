const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Création du dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Seuls les formats JPEG, JPG, PNG et GIF sont acceptés.'), false);
    }
};

// Configuration de multer avec gestion d'erreur
const multerUpload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        fieldSize: 50 * 1024 * 1024, // Augmentez à 50 MB
        fields: 10, // Nombre maximum de champs non-fichiers
        files: 5, // Nombre maximum de fichiers
    },
    fileFilter: fileFilter
});

// Wrapper pour gérer les erreurs de multer et envoyer une réponse JSON
const upload = {
    single: (fieldName) => {
        return (req, res, next) => {
            multerUpload.single(fieldName)(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        return res.status(400).json({
                            success: false,
                            message: `Erreur d'upload: ${err.message}`
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }
                next();
            });
        };
    },
    array: (fieldName, maxCount) => {
        return (req, res, next) => {
            multerUpload.array(fieldName, maxCount)(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        return res.status(400).json({
                            success: false,
                            message: `Erreur d'upload: ${err.message}`
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }
                next();
            });
        };
    },
    fields: (fields) => {
        return (req, res, next) => {
            multerUpload.fields(fields)(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        return res.status(400).json({
                            success: false,
                            message: `Erreur d'upload: ${err.message}`
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }
                next();
            });
        };
    }
};

module.exports = upload;