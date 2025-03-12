const express = require('express');
const interactionController = require('../controllers/interactionController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Route pour créer une interaction
router.post('/', authenticateJWT, interactionController.createInteraction);

// Route pour supprimer une interaction
router.delete('/:interactionId', authenticateJWT, interactionController.deleteInteraction);

// Route pour obtenir les interactions par post
router.get('/post/:postId', interactionController.getInteractionsByPost);

module.exports = router; 