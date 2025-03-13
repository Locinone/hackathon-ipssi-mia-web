const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * Gestionnaire de notifications avec support WebSocket
 */
class NotificationManager {
  /**
   * Constructeur
   * @param {Object} io - Instance Socket.IO
   */
  constructor(io) {
    this.io = io;
  }

  /**
   * Envoie une notification à un utilisateur
   * @param {Object} notificationData - Données de la notification
   * @returns {Promise<Object>} La notification créée
   */
  async sendNotification(notificationData) {
    try {
      // Vérification des données requises
      if (!notificationData.sender || !notificationData.receiver || !notificationData.type) {
        console.error("❌ Données de notification incomplètes:", notificationData);
        throw new Error("Données de notification incomplètes");
      }

      // Vérifier que l'expéditeur et le destinataire existent
      const [sender, receiver] = await Promise.all([
        User.findById(notificationData.sender).select("name username image"),
        User.findById(notificationData.receiver)
      ]);

      if (!sender || !receiver) {
        console.error("❌ Expéditeur ou destinataire introuvable:", {
          sender: notificationData.sender,
          receiver: notificationData.receiver
        });
        throw new Error("Expéditeur ou destinataire introuvable");
      }

      // Vérifier si l'utilisateur accepte les notifications
      if (receiver.acceptNotification === false) {
        console.log(`ℹ️ L'utilisateur ${receiver._id} n'accepte pas les notifications`);
        return null;
      }

      // Créer la notification
      const notification = new Notification({
        sender: notificationData.sender,
        receiver: notificationData.receiver,
        type: notificationData.type,
        post: notificationData.post || null,
        comment: notificationData.comment || null,
        share: notificationData.share || null,
        message: notificationData.message || this.getDefaultMessage(notificationData.type, sender.username),
        isRead: false,
        createdAt: new Date()
      });

      // Sauvegarder la notification
      await notification.save();
      console.log(`✅ Notification créée: ${notification._id}`);

      // Enrichir la notification avec les données de l'expéditeur pour l'envoi
      const enrichedNotification = {
        ...notification.toObject(),
        sender: {
          _id: sender._id,
          name: sender.name,
          username: sender.username,
          image: sender.image
        }
      };

      // Envoyer la notification via WebSocket
      if (this.io) {
        console.log(`📤 Envoi de notification à ${notificationData.receiver}`);
        this.io.to(notificationData.receiver.toString()).emit("notification", enrichedNotification);
      } else {
        console.warn("⚠️ Socket.IO non disponible pour l'envoi de notification");
      }

      return notification;
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la notification:", error);
      throw error;
    }
  }

  /**
   * Marque une notification comme lue
   * @param {string} notificationId - ID de la notification
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} La notification mise à jour
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        throw new Error("Notification introuvable");
      }

      // Vérifier que l'utilisateur est bien le destinataire
      if (notification.receiver.toString() !== userId.toString()) {
        throw new Error("Vous n'êtes pas autorisé à marquer cette notification comme lue");
      }

      notification.isRead = true;
      await notification.save();

      // Émettre l'événement de notification lue
      if (this.io) {
        this.io.to(userId.toString()).emit("notification-read", notification);
      }

      return notification;
    } catch (error) {
      console.error("❌ Erreur lors du marquage de la notification:", error);
      throw error;
    }
  }

  /**
   * Obtient un message par défaut selon le type de notification
   * @param {string} type - Type de notification
   * @param {string} username - Nom d'utilisateur de l'expéditeur
   * @returns {string} Message par défaut
   */
  getDefaultMessage(type, username) {
    const messages = {
      like: `${username} a aimé votre publication`,
      comment: `${username} a commenté votre publication`,
      follow: `${username} vous suit désormais`,
      unfollow: `${username} ne vous suit plus`,
      post: `${username} a publié quelque chose`,
      retweet: `${username} a partagé votre publication`,
      answer: `${username} a répondu à votre commentaire`,
      bookmark: `${username} a ajouté votre publication à ses favoris`,
      test: `Ceci est une notification de test`
    };

    return messages[type] || `Nouvelle notification de ${username}`;
  }
}

module.exports = NotificationManager;
