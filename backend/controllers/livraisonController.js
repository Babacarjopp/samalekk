const { Livraison, Commande, Utilisateur, Restaurant } = require('../models/index');
const { envoyerNotification } = require('../utils/sendNotification');

// ─── MISSIONS DISPONIBLES (livreur) ─────────────────────────────────────────
const missionsDisponibles = async (req, res) => {
  try {
    const livraisons = await Livraison.findAll({
      where: { statut: 'en_attente', livreurId: null },
      include: [
        {
          model: Commande,
          as: 'commande',
          include: [
            { model: Restaurant,  as: 'restaurant', attributes: ['nom', 'adresse', 'latitude', 'longitude'] },
            { model: Utilisateur, as: 'client',     attributes: ['nom', 'telephone'] }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ livraisons });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des missions.' });
  }
};

// ─── ACCEPTER UNE MISSION (livreur) ─────────────────────────────────────────
const accepterMission = async (req, res) => {
  try {
    const livraison = await Livraison.findOne({
      where: { id: req.params.id, statut: 'en_attente', livreurId: null },
      include: [
        {
          model: Commande,
          as: 'commande',
          include: [
            { model: Restaurant,  as: 'restaurant' },
            { model: Utilisateur, as: 'client', attributes: ['nom'] }
          ]
        }
      ]
    });

    if (!livraison) {
      return res.status(404).json({
        message: 'Mission introuvable ou déjà assignée.'
      });
    }

    // Vérifier que le livreur est disponible
    const livreur = await Utilisateur.findByPk(req.utilisateur.id);
    if (!livreur.disponible) {
      return res.status(400).json({
        message: 'Vous avez déjà une mission en cours.'
      });
    }

    // Assigner le livreur et démarrer la livraison
    await livraison.update({
      livreurId: req.utilisateur.id,
      statut:    'acceptee',
      dateDebut: new Date()
    });

    // Marquer le livreur comme non disponible
    await livreur.update({ disponible: false });

    // Mettre à jour la commande
    await Commande.update(
      { statut: 'en_livraison' },
      { where: { id: livraison.commandeId } }
    );

    // Notifier le client
    const io = req.app.get('io');
    await envoyerNotification(
      io,
      livraison.commande.clientId,
      `Votre livreur ${livreur.nom} est en route vers vous ! 🛵`,
      'livraison'
    );

    res.json({
      message: 'Mission acceptée. Bonne route !',
      livraison
    });
  } catch (error) {
    console.error('❌ Erreur acceptation mission :', error.message);
    res.status(500).json({ message: 'Erreur lors de l\'acceptation de la mission.' });
  }
};

// ─── CONFIRMER RÉCUPÉRATION CHEZ LE RESTO (livreur) ─────────────────────────
const confirmerRecuperation = async (req, res) => {
  try {
    const livraison = await Livraison.findOne({
      where: { id: req.params.id, livreurId: req.utilisateur.id, statut: 'acceptee' },
      include: [{ model: Commande, as: 'commande' }]
    });

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison introuvable.' });
    }

    await livraison.update({ statut: 'recuperee' });

    // Notifier le client
    const io = req.app.get('io');
    await envoyerNotification(
      io,
      livraison.commande.clientId,
      'Votre commande a été récupérée au restaurant. Elle arrive bientôt ! 📦',
      'livraison'
    );

    res.json({ message: 'Récupération confirmée.', livraison });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la confirmation.' });
  }
};

// ─── CONFIRMER LIVRAISON FINALE (livreur) ───────────────────────────────────
const confirmerLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findOne({
      where: { id: req.params.id, livreurId: req.utilisateur.id },
      include: [{ model: Commande, as: 'commande' }]
    });

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison introuvable.' });
    }

    // Finaliser la livraison
    await livraison.update({
      statut:  'livree',
      dateFin: new Date()
    });

    // Mettre à jour la commande
    await Commande.update(
      { statut: 'livree' },
      { where: { id: livraison.commandeId } }
    );

    // Remettre le livreur disponible
    await Utilisateur.update(
      { disponible: true },
      { where: { id: req.utilisateur.id } }
    );

    // Notifier le client (optionnel selon notre use case)
    const io = req.app.get('io');
    await envoyerNotification(
      io,
      livraison.commande.clientId,
      'Votre commande a été livrée. Bon appétit ! 🍽️ N\'oubliez pas de noter votre expérience.',
      'livraison'
    );

    res.json({ message: 'Livraison confirmée. Merci !', livraison });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la confirmation de livraison.' });
  }
};

// ─── METTRE À JOUR POSITION GPS (livreur) ───────────────────────────────────
const mettreAJourPosition = async (req, res) => {
  try {
    const { lat, lng, livraisonId } = req.body;

    await Livraison.update(
      { latActuelle: lat, lngActuelle: lng },
      { where: { id: livraisonId, livreurId: req.utilisateur.id } }
    );

    // Diffuser la position via Socket.io à tous ceux qui suivent cette livraison
    const io = req.app.get('io');
    io.to(`livraison:${livraisonId}`).emit('livreur:position:update', {
      lat, lng, timestamp: new Date()
    });

    res.json({ message: 'Position mise à jour.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la position.' });
  }
};

// ─── SUIVI D'UNE LIVRAISON (client) ─────────────────────────────────────────
const suivreLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Commande,
          as: 'commande',
          where: { clientId: req.utilisateur.id }
        },
        {
          model: Utilisateur,
          as: 'livreur',
          attributes: ['nom', 'telephone', 'photo', 'vehicule']
        }
      ]
    });

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison introuvable.' });
    }

    res.json({ livraison });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du suivi.' });
  }
};

// ─── DETAILS MISSION LIVREUR ────────────────────────────────────────────────
const missionLivreur = async (req, res) => {
  try {
    const livraison = await Livraison.findOne({
      where: {
        id: req.params.id,
        livreurId: req.utilisateur.id
      },
      include: [
        {
          model: Commande,
          as: 'commande',
          include: [
            { model: Restaurant, as: 'restaurant', attributes: ['nom', 'adresse', 'telephone', 'latitude', 'longitude'] },
            { model: Utilisateur, as: 'client', attributes: ['nom', 'telephone', 'latitude', 'longitude'] }
          ]
        },
        {
          model: Utilisateur,
          as: 'livreur',
          attributes: ['id', 'nom', 'telephone', 'vehicule', 'disponible']
        }
      ]
    });

    if (!livraison) {
      return res.status(404).json({ message: 'Mission introuvable.' });
    }

    res.json({ livraison });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la mission.' });
  }
};

// ─── METTRE À JOUR POSITION GPS CLIENT (client) ─────────────────────────────
const mettreAJourPositionClient = async (req, res) => {
  try {
    const { lat, lng, livraisonId } = req.body;

    // Mettre à jour la position du client dans la table utilisateurs
    await Utilisateur.update(
      { latitude: lat, longitude: lng },
      { where: { id: req.utilisateur.id } }
    );

    // Diffuser la position via Socket.io au livreur concerné
    const livraison = await Livraison.findOne({
      where: { id: livraisonId, livreurId: { [require('sequelize').Op.ne]: null } }
    });

    if (livraison) {
      const io = req.app.get('io');
      io.to(`livraison:${livraisonId}`).emit('client:position:update', {
        lat,
        lng,
        livraisonId,
        clientId: req.utilisateur.id,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Position mise à jour.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la position.' });
  }
};

module.exports = {
  missionsDisponibles,
  accepterMission,
  confirmerRecuperation,
  confirmerLivraison,
  mettreAJourPosition,
  suivreLivraison,
  missionLivreur,
  mettreAJourPositionClient
};