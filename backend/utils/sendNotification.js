const { Notification } = require('../models/index');

// Créer et envoyer une notification en base + via WebSocket
const envoyerNotification = async (io, destinataireId, message, type = 'systeme') => {
  try {
    // Sauvegarder en base de données
    const notification = await Notification.create({
      destinataireId,
      message,
      type
    });

    // Envoyer en temps réel via Socket.io si io est disponible
    if (io) {
      io.to(`user:${destinataireId}`).emit('notification:nouvelle', {
        id:      notification.id,
        message: notification.message,
        type:    notification.type,
        date:    notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('❌ Erreur envoi notification :', error.message);
  }
};

module.exports = { envoyerNotification };