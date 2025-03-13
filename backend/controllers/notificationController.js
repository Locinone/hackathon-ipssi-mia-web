const Notification = require("../models/Notification");
const User = require("../models/User");
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

    // Vérifier si l'utilisateur accepte les notifications
    const user = await User.findById(userId);
    if (user && user.acceptNotification === false) {
      console.log(`ℹ️ L'utilisateur ${userId} n'accepte pas les notifications, test ignoré`);
      return jsonResponse(res, "Notification non envoyée: l'utilisateur n'accepte pas les notifications", 200, null);
    }

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
    const { notificationId } = req.params;
    const userId = req.user.id;

    console.log(`Suppression de la notification ${notificationId} par l'utilisateur ${userId}`);

    // Vérifier que l'ID est valide
    if (!notificationId || notificationId.trim() === '') {
      console.error("ID de notification invalide");
      return jsonResponse(res, "ID de notification invalide", 400, null);
    }

    // Vérifier que la notification existe
    let notification;
    try {
      notification = await Notification.findById(notificationId);
    } catch (err) {
      console.error(`Erreur lors de la recherche de la notification: ${err.message}`);
      return jsonResponse(res, "Erreur lors de la recherche de la notification", 500, null);
    }

    if (!notification) {
      console.log(`Notification ${notificationId} non trouvée`);
      // Retourner un succès même si la notification n'existe pas
      // Cela évite les erreurs côté client si la notification a déjà été supprimée
      return jsonResponse(res, "Notification déjà supprimée", 200, { _id: notificationId });
    }

    // Convertir les IDs en chaînes pour une comparaison correcte
    const receiverId = notification.receiver.toString();
    const requestUserId = userId.toString();

    console.log(`Comparaison des IDs: notification.receiver=${receiverId}, userId=${requestUserId}`);

    // Vérifier que l'utilisateur est bien le destinataire de la notification
    if (receiverId !== requestUserId) {
      console.log(`L'utilisateur ${userId} n'est pas autorisé à supprimer la notification ${notificationId}`);
      console.log(`ID du destinataire: ${receiverId}, ID de l'utilisateur: ${requestUserId}`);
      return jsonResponse(res, "Vous n'êtes pas autorisé à supprimer cette notification", 403, null);
    }

    // Supprimer la notification
    try {
      const result = await Notification.findByIdAndDelete(notificationId);

      if (!result) {
        console.log(`Notification ${notificationId} déjà supprimée`);
        return jsonResponse(res, "Notification déjà supprimée", 200, { _id: notificationId });
      }

      console.log(`Notification ${notificationId} supprimée avec succès via API REST`);
    } catch (err) {
      console.error(`Erreur lors de la suppression de la notification: ${err.message}`);
      return jsonResponse(res, "Erreur lors de la suppression de la notification", 500, null);
    }

    // Informer le client de la suppression via WebSocket
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(userId).emit("notification-deleted", { _id: notificationId });
        console.log(`Événement notification-deleted émis pour ${userId}`);
      }
    } catch (err) {
      console.error(`Erreur lors de l'émission de l'événement WebSocket: ${err.message}`);
      // Ne pas échouer la requête si l'émission WebSocket échoue
    }

    return jsonResponse(res, "Notification supprimée avec succès", 200, { _id: notificationId });
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    return jsonResponse(res, error.message || "Erreur interne du serveur", 500, null);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  testNotification,
  deleteNotification
};
