const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

// Routes protégées par authentification
router.use(authenticateJWT);

// Récupérer toutes les notifications de l'utilisateur connecté
router.get("/", notificationController.getNotifications);

// Marquer une notification comme lue
router.put("/:notificationId/read", notificationController.markAsRead);

// Supprimer une notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Route de test pour les notifications (uniquement en développement)
if (process.env.NODE_ENV !== "production") {
  router.post("/test", notificationController.testNotification);
}

module.exports = router;
