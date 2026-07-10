const { Notification } = require('../models/index');

// ─── MES NOTIFICATIONS ──────────────────────────────────────────────────────
const mesNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { destinataireId: req.utilisateur.id },
      order: [['createdAt', 'DESC']],
      limit: 30
    });

    const nonLues = notifications.filter(n => !n.lue).length;

    res.json({ notifications, nonLues });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération.' });
  }
};

// ─── MARQUER COMME LUE ──────────────────────────────────────────────────────
const marquerCommeLue = async (req, res) => {
  try {
    await Notification.update(
      { lue: true },
      {
        where: {
          id:             req.params.id,
          destinataireId: req.utilisateur.id
        }
      }
    );

    res.json({ message: 'Notification marquée comme lue.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.' });
  }
};

// ─── TOUT MARQUER COMME LU ──────────────────────────────────────────────────
const toutMarquerCommeLu = async (req, res) => {
  try {
    await Notification.update(
      { lue: true },
      { where: { destinataireId: req.utilisateur.id, lue: false } }
    );

    res.json({ message: 'Toutes les notifications ont été lues.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.' });
  }
};

module.exports = { mesNotifications, marquerCommeLue, toutMarquerCommeLu };