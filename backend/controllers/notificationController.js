const Notification = require("../models/Notification");
const NotificationManager = require("../utils/notificationManager");
const jsonResponse = require("../utils/jsonResponse");

// Récupérer les notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Récupération des notifications pour l'utilisateur: ${userId}`);

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "name username image")
      .sort({ createdAt: -1 });

    console.log(`${notifications.length} notifications trouvées`);
    return jsonResponse(res, "Notifications récupérées avec succès", 200, notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return jsonResponse(res, error.message, 500, null);
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    console.log(`Marquage de la notification ${notificationId} comme lue par l'utilisateur ${userId}`);

    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    const notification = await notificationManager.markAsRead(notificationId, userId);

    // Programmez la suppression de la notification après 24 heures (86,400,000 ms)
    setTimeout(async () => {
      await Notification.findByIdAndDelete(notification._id);
      console.log(`🗑️ Notification ${notification._id} supprimée automatiquement après 24h.`);
    }, 86400000);

    return jsonResponse(res, "Notification marquée comme lue", 200, notification);
  } catch (error) {
    console.error("Erreur lors du marquage de la notification:", error);
    return jsonResponse(res, error.message, 500, null);
  }
};

// Créer une notification de test (pour le développement)
const testNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const io = req.app.get("io");
    const notificationManager = new NotificationManager(io);

    console.log(`Création d'une notification de test pour l'utilisateur ${userId}`);

    const notification = await notificationManager.sendNotification({
      sender: userId, // L'utilisateur s'envoie une notification à lui-même
      receiver: userId,
      type: "test",
      message: "Ceci est une notification de test",
    });

    return jsonResponse(res, "Notification de test envoyée", 200, notification);
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification de test:", error);
    return jsonResponse(res, error.message, 500, null);
  }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    console.log(`Suppression de la notification ${notificationId} par l'utilisateur ${userId}`);

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return jsonResponse(res, "Notification introuvable", 404, null);
    }

    // Vérifier que l'utilisateur est bien le destinataire
    if (notification.receiver.toString() !== userId) {
      return jsonResponse(res, "Vous n'êtes pas autorisé à supprimer cette notification", 403, null);
    }

    await Notification.findByIdAndDelete(notificationId);

    // Informer le client de la suppression via WebSocket
    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("notification-deleted", { _id: notificationId });
    }

    return jsonResponse(res, "Notification supprimée avec succès", 200, null);
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    return jsonResponse(res, error.message, 500, null);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  testNotification,
  deleteNotification
};
