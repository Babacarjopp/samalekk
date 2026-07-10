const { Utilisateur, Restaurant, Commande, Livraison, Paiement } = require('../models/index');
const { envoyerNotification } = require('../utils/sendNotification');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// ─── TABLEAU DE BORD ADMIN ──────────────────────────────────────────────────
const tableauDeBord = async (req, res) => {
  try {
    // Compter les utilisateurs par rôle
    const totalClients      = await Utilisateur.count({ where: { role: 'client' } });
    const totalRestaurateurs = await Utilisateur.count({ where: { role: 'restaurateur' } });
    const totalLivreurs     = await Utilisateur.count({ where: { role: 'livreur' } });

    // Compter les restaurants
    const totalRestaurants  = await Restaurant.count({ where: { statut: 'valide' } });
    const restaEnAttente    = await Restaurant.count({ where: { statut: 'en_attente' } });

    // Compter les commandes
    const totalCommandes    = await Commande.count();
    const commandesAujourdhui = await Commande.count({
      where: {
        createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    // Calculer le revenu total (commandes livrées)
    const revenuTotal = await Commande.sum('montantTotal', {
      where: { statut: 'livree' }
    });

    // Commandes par statut
    const commandesParStatut = await Commande.findAll({
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['statut']
    });

    // 5 dernières commandes
    const dernieresCommandes = await Commande.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Utilisateur, as: 'client',     attributes: ['nom'] },
        { model: Restaurant,  as: 'restaurant', attributes: ['nom'] }
      ]
    });

    res.json({
      statistiques: {
        utilisateurs: {
          clients:       totalClients,
          restaurateurs: totalRestaurateurs,
          livreurs:      totalLivreurs
        },
        restaurants: {
          valides:    totalRestaurants,
          enAttente:  restaEnAttente
        },
        commandes: {
          total:       totalCommandes,
          aujourdhui:  commandesAujourdhui,
          parStatut:   commandesParStatut
        },
        revenuTotal: revenuTotal || 0
      },
      dernieresCommandes
    });
  } catch (error) {
    console.error('❌ Erreur tableau de bord :', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques.' });
  }
};

// ─── LISTE DES RESTAURANTS EN ATTENTE ──────────────────────────────────────
const restaurantsEnAttente = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { statut: 'en_attente' },
      include: [
        {
          model: Utilisateur,
          as: 'restaurateur',
          attributes: ['nom', 'email', 'telephone']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ restaurants });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération.' });
  }
};

// ─── VALIDER UN RESTAURANT ──────────────────────────────────────────────────
const validerRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [{ model: Utilisateur, as: 'restaurateur' }]
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable.' });
    }

    await restaurant.update({ statut: 'valide' });

    // Mettre à jour le statut du restaurateur à actif
    await Utilisateur.update(
      { statut: 'actif' },
      { where: { id: restaurant.restaurateurId } }
    );

    // Notifier le restaurateur
    const io = req.app.get('io');
    await envoyerNotification(
      io,
      restaurant.restaurateurId,
      `Félicitations ! Votre restaurant "${restaurant.nom}" a été validé et est maintenant visible sur la plateforme. 🎉`,
      'systeme'
    );

    res.json({
      message: `Le restaurant "${restaurant.nom}" a été validé avec succès.`,
      restaurant
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la validation.' });
  }
};

// ─── REFUSER UN RESTAURANT ──────────────────────────────────────────────────
const refuserRestaurant = async (req, res) => {
  try {
    const { motif } = req.body;
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [{ model: Utilisateur, as: 'restaurateur' }]
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable.' });
    }

    await restaurant.update({ statut: 'suspendu' });

    // Notifier le restaurateur avec le motif
    const io = req.app.get('io');
    await envoyerNotification(
      io,
      restaurant.restaurateurId,
      `Votre restaurant "${restaurant.nom}" n'a pas été validé. Motif : ${motif || 'Non précisé'}. Contactez l'administrateur pour plus d'informations.`,
      'systeme'
    );

    res.json({ message: 'Restaurant refusé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du refus.' });
  }
};

// ─── TOUS LES UTILISATEURS ──────────────────────────────────────────────────
const tousLesUtilisateurs = async (req, res) => {
  try {
    const { role, statut } = req.query;
    const conditions = {};
    if (role)   conditions.role   = role;
    if (statut) conditions.statut = statut;

    const utilisateurs = await Utilisateur.findAll({
      where: conditions,
      attributes: { exclude: ['motDePasse'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ utilisateurs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération.' });
  }
};

// ─── SUSPENDRE / RÉACTIVER UN COMPTE ───────────────────────────────────────
const changerStatutUtilisateur = async (req, res) => {
  try {
    const { statut } = req.body; // 'actif' ou 'suspendu'
    const utilisateur = await Utilisateur.findByPk(req.params.id);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Empêcher de suspendre un autre admin
    if (utilisateur.role === 'admin') {
      return res.status(403).json({ message: 'Impossible de modifier un compte administrateur.' });
    }

    await utilisateur.update({ statut });

    const messages = {
      suspendu: `Votre compte a été suspendu par l'administrateur.`,
      actif:    `Votre compte a été réactivé. Bienvenue de retour sur Sama Lekk ! 🎉`
    };

    const io = req.app.get('io');
    await envoyerNotification(io, utilisateur.id, messages[statut], 'systeme');

    res.json({
      message: `Compte ${statut === 'suspendu' ? 'suspendu' : 'réactivé'} avec succès.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification du statut.' });
  }
};

// ─── GÉRER LES LIVREURS ─────────────────────────────────────────────────────
const gererLivreurs = async (req, res) => {
  try {
    const livreurs = await Utilisateur.findAll({
      where: { role: 'livreur' },
      attributes: { exclude: ['motDePasse'] },
      include: [
        {
          model: Livraison,
          as: 'livraisons',
          attributes: ['id', 'statut', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    res.json({ livreurs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livreurs.' });
  }
};

// ─── STATISTIQUES GLOBALES PAR PÉRIODE ─────────────────────────────────────
const statistiquesPeriode = async (req, res) => {
  try {
    const { periode } = req.query; // 'jour', 'semaine', 'mois'

    let dateDebut = new Date();
    if (periode === 'semaine') dateDebut.setDate(dateDebut.getDate() - 7);
    else if (periode === 'mois') dateDebut.setMonth(dateDebut.getMonth() - 1);
    else dateDebut.setHours(0, 0, 0, 0); // aujourd'hui par défaut

    const commandes = await Commande.findAll({
      where: { createdAt: { [Op.gte]: dateDebut } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('montantTotal')), 'revenu']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json({ commandes, periode });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques.' });
  }
};

module.exports = {
  tableauDeBord,
  restaurantsEnAttente,
  validerRestaurant,
  refuserRestaurant,
  tousLesUtilisateurs,
  changerStatutUtilisateur,
  gererLivreurs,
  statistiquesPeriode
};