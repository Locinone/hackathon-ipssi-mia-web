const express = require('express');
const upload = require('../middleware/upload');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Route pour uploader une seule image
router.post('/image', authenticateJWT, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Aucun fichier n\'a été téléchargé');
        }

        // Construire l'URL de l'image
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'Image téléchargée avec succès',
            imageUrl: imageUrl
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Route pour uploader plusieurs images (max 5)
router.post('/images', authenticateJWT, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Aucun fichier n\'a été téléchargé');
        }

        // Construire les URLs des images
        const imageUrls = req.files.map(file =>
            `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        );

        res.status(200).json({
            message: 'Images téléchargées avec succès',
            imageUrls: imageUrls
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router; 