const Notification = require("../models/Notification");

class NotificationManager {
  constructor(io) {
    this.io = io;
  }

  async sendNotification({ sender, receiver, type, message, post = null }) {
    try {
      const notification = new Notification({
        sender,
        receiver,
        type,
        message,
        post,
      });

      await notification.save();
      this.io.to(receiver.toString()).emit("notification", notification._doc);
      console.log(`✅ Notification '${type}' envoyée à la room: ${receiver}`);

      return notification;
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la notification:", error);
    }
  }

  async deleteNotification({ sender, receiver, type, post = null }) {
    try {
      const notification = await Notification.findOneAndDelete({
        sender,
        receiver,
        type,
        post,
      });

      if (notification) {
        this.io.to(receiver.toString()).emit("notification", {
          message: "Notification supprimée.",
          type: `delete-${type}`,
          post,
        });
        console.log(`🗑️ Notification '${type}' supprimée pour: ${receiver}`);
      }

      return notification;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de la notification:",
        error,
      );
    }
  }
}

module.exports = NotificationManager;
