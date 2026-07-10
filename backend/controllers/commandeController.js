const { Commande, LigneCommande, Plat, Restaurant, Livraison, Paiement, Utilisateur } = require('../models/index');
const { calculerDistance, calculFraisLivraison } = require('../utils/calculFraisLivraison');
const { envoyerNotification } = require('../utils/sendNotification');
const { sequelize } = require('../config/db');

// ─── PASSER UNE COMMANDE ────────────────────────────────────────────────────
const passerCommande = async (req, res) => {
  // Transaction pour garantir l'intégrité des données
  const transaction = await sequelize.transaction();

  try {
    const {
      restaurantId,
      plats,           // [{ platId, quantite }]
      adresseLivraison,
      latitudeLivraison,
      longitudeLivraison,
      modePaiement     // 'en_ligne' ou 'a_la_livraison'
    } = req.body;

    // Vérifier que le restaurant existe et est ouvert
    const restaurant = await Restaurant.findOne({
      where: { id: restaurantId, statut: 'valide', estOuvert: true }
    });

    if (!restaurant) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Restaurant fermé ou introuvable.' });
    }

    // Calculer le montant total et vérifier la disponibilité des plats
    let montantPlats = 0;
    const lignesACreer = [];

    for (const item of plats) {
      const plat = await Plat.findOne({
        where: { id: item.platId, disponible: true, restaurantId }
      });

      if (!plat) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Le plat demandé n'est plus disponible.`
        });
      }

      const sousTotal = plat.prix * item.quantite;
      montantPlats += sousTotal;

      lignesACreer.push({
        platId:       plat.id,
        quantite:     item.quantite,
        prixUnitaire: plat.prix,
        sousTotal
      });
    }

    // Calculer les frais de livraison selon la distance GPS
    let fraisLivraison = 500; // valeur par défaut
    if (latitudeLivraison && longitudeLivraison && restaurant.latitude && restaurant.longitude) {
      const distance = calculerDistance(
        restaurant.latitude, restaurant.longitude,
        latitudeLivraison,   longitudeLivraison
      );
      fraisLivraison = calculFraisLivraison(distance);
    }

    const montantTotal = montantPlats + fraisLivraison;

    // Créer la commande
    const commande = await Commande.create({
      clientId:           req.utilisateur.id,
      restaurantId,
      montantTotal,
      fraisLivraison,
      modePaiement,
      adresseLivraison,
      latitudeLivraison,
      longitudeLivraison,
      statut: 'en_attente'
    }, { transaction });

    // Créer les lignes de commande
    for (const ligne of lignesACreer) {
      await LigneCommande.create({
        ...ligne,
        commandeId: commande.id
      }, { transaction });
    }

    // Créer l'enregistrement de paiement
    await Paiement.create({
      commandeId: commande.id,
      montant:    montantTotal,
      methode:    modePaiement === 'en_ligne' ? 'wave' : 'cash',
      statut:     modePaiement === 'a_la_livraison' ? 'en_attente' : 'en_attente'
    }, { transaction });

    // Si paiement à la livraison : confirmer directement et créer la livraison
    if (modePaiement === 'a_la_livraison') {
      await commande.update({ statut: 'confirmee' }, { transaction });
      await Livraison.create({ commandeId: commande.id }, { transaction });
    }

    await transaction.commit();

    const io = req.app.get('io');

    // Paiement à la livraison : notifier le restaurateur immédiatement
    if (modePaiement === 'a_la_livraison') {
      await envoyerNotification(
        io,
        restaurant.restaurateurId,
        `Nouvelle commande reçue ! Montant : ${montantTotal.toLocaleString()} FCFA`,
        'commande'
      );
    }

    res.status(201).json({
      message: 'Commande passée avec succès.',
      commande: {
        id:           commande.id,
        statut:       commande.statut,
        montantTotal,
        fraisLivraison,
        modePaiement
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur commande :', error.message);
    res.status(500).json({ message: 'Erreur lors de la création de la commande.' });
  }
};

// ─── MES COMMANDES (client) ─────────────────────────────────────────────────
const mesCommandes = async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { clientId: req.utilisateur.id },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['nom', 'image']
        },
        {
          model: LigneCommande,
          as: 'lignes',
          include: [{ model: Plat, as: 'plat', attributes: ['nom', 'image'] }]
        },
        {
          model: Livraison,
          as: 'livraison',
          include: [{
            model: Utilisateur,
            as: 'livreur',
            attributes: ['nom', 'telephone', 'vehicule']
          }]
        },
        { model: Paiement,  as: 'paiement'  }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes.' });
  }
};

// ─── COMMANDES DU RESTAURANT (restaurateur) ─────────────────────────────────
const commandesRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { restaurateurId: req.utilisateur.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable.' });
    }

    const commandes = await Commande.findAll({
      where: { restaurantId: restaurant.id },
      include: [
        {
          model: Utilisateur,
          as: 'client',
          attributes: ['nom', 'telephone']
        },
        {
          model: LigneCommande,
          as: 'lignes',
          include: [{ model: Plat, as: 'plat', attributes: ['nom', 'prix'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération.' });
  }
};

// ─── CHANGER STATUT COMMANDE (restaurateur) ─────────────────────────────────
const changerStatutCommande = async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    if (commande.restaurant.restaurateurId !== req.utilisateur.id) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    await commande.update({ statut });

    // Notifier le client du changement de statut
    const messages = {
      en_preparation: 'Votre commande est en cours de préparation 🍳',
      en_livraison:   'Votre commande est en route ! 🛵',
      livree:         'Votre commande a été livrée. Bon appétit ! 🍽️'
    };

    const io = req.app.get('io');
    if (messages[statut]) {
      await envoyerNotification(io, commande.clientId, messages[statut], 'commande');
    }

    res.json({ message: 'Statut mis à jour.', commande });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut.' });
  }
};

// ─── NOTER UNE COMMANDE (client) ────────────────────────────────────────────
const noterCommande = async (req, res) => {
  try {
    const { note, commentaire } = req.body;
    const commande = await Commande.findOne({
      where: { id: req.params.id, clientId: req.utilisateur.id, statut: 'livree' }
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande introuvable ou non livrée.' });
    }

    await commande.update({ note, commentaire });

    // Recalculer la note moyenne du restaurant
    const restaurant = await Restaurant.findByPk(commande.restaurantId);
    const nouvelleNote = (restaurant.noteMoyenne * restaurant.nombreAvis + note) / (restaurant.nombreAvis + 1);
    await restaurant.update({
      noteMoyenne: Math.round(nouvelleNote * 10) / 10,
      nombreAvis:  restaurant.nombreAvis + 1
    });

    res.json({ message: 'Merci pour votre avis !' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la notation.' });
  }
};

module.exports = {
  passerCommande,
  mesCommandes,
  commandesRestaurant,
  changerStatutCommande,
  noterCommande
};