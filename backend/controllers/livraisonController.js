const { Livraison, Commande, Utilisateur, Restaurant } = require('../models/index');
const { envoyerNotification } = require('../utils/sendNotification');
const { Op } = require('sequelize');

// ─── MISSIONS DISPONIBLES (livreur) ─────────────────────────────────────────
const missionsDisponibles = async (req, res) => {
  try {
    const livraisons = await Livraison.findAll({
      where: { statut: 'en_attente', livreurId: null },
      include: [
        {
          model: Commande,
          as: 'commande',
          attributes: [
            'id', 'statut', 'adresseLivraison',
            'latitudeLivraison', 'longitudeLivraison',
            'montantTotal', 'fraisLivraison', 'modePaiement', 'clientId'
          ],
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['nom', 'adresse', 'latitude', 'longitude', 'telephone']
            },
            {
              model: Utilisateur,
              as: 'client',
              attributes: ['nom', 'telephone']
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ livraisons });
  } catch (error) {
    console.error('❌ missionsDisponibles:', error.message);
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
            { model: Utilisateur, as: 'client', attributes: ['nom', 'telephone'] }
          ]
        }
      ]
    });

    if (!livraison) {
      return res.status(404).json({
        message: 'Mission introuvable ou déjà assignée à un autre livreur.'
      });
    }

    const livreur = await Utilisateur.findByPk(req.utilisateur.id);
    if (!livreur.disponible) {
      return res.status(400).json({
        message: 'Vous avez déjà une mission en cours. Terminez-la avant d\'en accepter une autre.'
      });
    }

    await livraison.update({
      livreurId: req.utilisateur.id,
      statut:    'acceptee',
      dateDebut: new Date()
    });

    await livreur.update({ disponible: false });

    await Commande.update(
      { statut: 'en_livraison' },
      { where: { id: livraison.commandeId } }
    );

    const io = req.app.get('io');
    await envoyerNotification(
      io,
      livraison.commande.clientId,
      `Votre livreur ${livreur.nom} est en route vers vous ! 🛵`,
      'livraison'
    );

    res.json({ message: 'Mission acceptée. Bonne route !', livraison });

  } catch (error) {
    console.error('❌ accepterMission:', error.message);
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
      return res.status(404).json({ message: 'Livraison introuvable ou statut incorrect.' });
    }

    await livraison.update({ statut: 'recuperee' });

    const io = req.app.get('io');
    await envoyerNotification(
      io,
      livraison.commande.clientId,
      'Votre commande a été récupérée au restaurant. Elle arrive bientôt ! 📦',
      'livraison'
    );

    res.json({ message: 'Récupération confirmée.', livraison });

  } catch (error) {
    console.error('❌ confirmerRecuperation:', error.message);
    res.status(500).json({ message: 'Erreur lors de la confirmation de récupération.' });
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

    await livraison.update({
      statut:  'livree',
      dateFin: new Date()
    });

    await Commande.update(
      { statut: 'livree' },
      { where: { id: livraison.commandeId } }
    );

    await Utilisateur.update(
      { disponible: true },
      { where: { id: req.utilisateur.id } }
    );

    const io = req.app.get('io');
    await envoyerNotification(
      io,
      livraison.commande.clientId,
      'Votre commande a été livrée. Bon appétit ! 🍽️ N\'oubliez pas de noter votre expérience.',
      'livraison'
    );

    res.json({ message: 'Livraison confirmée. Merci !', livraison });

  } catch (error) {
    console.error('❌ confirmerLivraison:', error.message);
    res.status(500).json({ message: 'Erreur lors de la confirmation de livraison.' });
  }
};

// ─── METTRE À JOUR POSITION GPS LIVREUR ─────────────────────────────────────
const mettreAJourPosition = async (req, res) => {
  try {
    const { lat, lng, livraisonId } = req.body;

    if (!lat || !lng || !livraisonId) {
      return res.status(400).json({ message: 'lat, lng et livraisonId sont requis.' });
    }

    await Livraison.update(
      { latActuelle: lat, lngActuelle: lng },
      { where: { id: livraisonId, livreurId: req.utilisateur.id } }
    );

    // Diffuser la position du livreur via Socket.io
    const io = req.app.get('io');
    io.to(`livraison:${livraisonId}`).emit('livreur:position:update', {
      lat, lng,
      livreurId:   req.utilisateur.id,
      livraisonId,
      timestamp:   new Date()
    });

    res.json({ message: 'Position mise à jour.' });

  } catch (error) {
    console.error('❌ mettreAJourPosition:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la position.' });
  }
};

// ─── METTRE À JOUR POSITION GPS CLIENT ──────────────────────────────────────
const mettreAJourPositionClient = async (req, res) => {
  try {
    const { lat, lng, livraisonId } = req.body;

    if (!lat || !lng || !livraisonId) {
      return res.status(400).json({ message: 'lat, lng et livraisonId sont requis.' });
    }

    // Diffuser la position du client via Socket.io au livreur
    const io = req.app.get('io');
    io.to(`livraison:${livraisonId}`).emit('client:position:update', {
      lat, lng,
      clientId:    req.utilisateur.id,
      livraisonId,
      timestamp:   new Date()
    });

    res.json({ message: 'Position client mise à jour.' });

  } catch (error) {
    console.error('❌ mettreAJourPositionClient:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la position client.' });
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
          attributes: [
            'id', 'statut', 'adresseLivraison',
            'latitudeLivraison', 'longitudeLivraison',
            'montantTotal', 'modePaiement', 'clientId'
          ],
          where: { clientId: req.utilisateur.id }
        },
        {
          model: Utilisateur,
          as: 'livreur',
          attributes: ['nom', 'telephone', 'vehicule']
        }
      ]
    });

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison introuvable.' });
    }

    res.json({ livraison });

  } catch (error) {
    console.error('❌ suivreLivraison:', error.message);
    res.status(500).json({ message: 'Erreur lors du suivi.' });
  }
};

// ─── DÉTAILS MISSION LIVREUR ─────────────────────────────────────────────────
const missionLivreur = async (req, res) => {
  try {
    const livraison = await Livraison.findOne({
      where: {
        id:        req.params.id,
        livreurId: req.utilisateur.id
      },
      include: [
        {
          model: Commande,
          as: 'commande',
          // ✅ CRUCIAL : inclure latitudeLivraison et longitudeLivraison
          attributes: [
            'id', 'statut', 'adresseLivraison',
            'latitudeLivraison', 'longitudeLivraison',
            'montantTotal', 'fraisLivraison', 'modePaiement', 'clientId'
          ],
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['nom', 'adresse', 'telephone', 'latitude', 'longitude']
            },
            {
              model: Utilisateur,
              as: 'client',
              // ✅ On prend seulement nom et telephone
              // La position vient de commande.latitudeLivraison
              attributes: ['nom', 'telephone']
            }
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
    console.error('❌ missionLivreur:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération de la mission.' });
  }
};

module.exports = {
  missionsDisponibles,
  accepterMission,
  confirmerRecuperation,
  confirmerLivraison,
  mettreAJourPosition,
  mettreAJourPositionClient,
  suivreLivraison,
  missionLivreur
};