const Notification = require("../models/Notification");

// Récupérer les notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Marquer une notification comme lue et programmer sa suppression après 24 heures
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).send("Notification introuvable");
    }

    const io = req.app.get("io");
    io.to(notification.receiver.toString()).emit(
      "notification-read",
      notification,
    );

    // Programmez la suppression de la notification après 24 heures (86,400,000 ms)
    setTimeout(async () => {
      await Notification.findByIdAndDelete(notification._id);
      console.log(
        `🗑️ Notification ${notification._id} supprimée automatiquement après 24h.`,
      );
    }, 86400000);

    res
      .status(200)
      .send("Notification marquée comme lue et programmée pour suppression");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead };
