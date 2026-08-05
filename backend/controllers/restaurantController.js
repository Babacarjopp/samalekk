const { Restaurant, Plat, Utilisateur } = require('../models/index');
const { Op } = require('sequelize');

// ─── TOUS LES RESTAURANTS (public) ─────────────────────────────────────────
const obtenirRestaurants = async (req, res) => {
  try {
    const { categorie, recherche } = req.query;

    const conditions = { statut: 'valide', estOuvert: true };

    // Filtrer par catégorie si demandé
    if (categorie) conditions.categorie = categorie;

    // Recherche par nom
    if (recherche) {
      conditions.nom = { [Op.iLike]: `%${recherche}%` };
    }

    const restaurants = await Restaurant.findAll({
      where: conditions,
      attributes: [
        'id', 'nom', 'description', 'categorie',
        'adresse', 'image', 'noteMoyenne',
        'nombreAvis', 'estOuvert',
        'heureOuverture', 'heureFermeture'
      ],
      order: [['noteMoyenne', 'DESC']]
    });

    res.json({ restaurants });
  } catch (error) {
    console.error('❌ Erreur restaurants :', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des restaurants.' });
  }
};

// ─── UN SEUL RESTAURANT AVEC SES PLATS ─────────────────────────────────────
const obtenirRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { id: req.params.id, statut: 'valide', estOuvert: true },
      include: [
        {
          model: Plat,
          as: 'plats',
          where: { disponible: true },
          required: false,
          attributes: ['id', 'nom', 'description', 'prix', 'image', 'categorie', 'stock']
        },
        {
          model: Utilisateur,
          as: 'restaurateur',
          attributes: ['nom', 'telephone']
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable.' });
    }

    res.json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du restaurant.' });
  }
};

// ─── CRÉER MON RESTAURANT (restaurateur) ───────────────────────────────────
const creerRestaurant = async (req, res) => {
  try {
    const { nom, description, categorie, adresse, telephone, heureOuverture, heureFermeture } = req.body;

    // Vérifier que ce restaurateur n'a pas déjà un restaurant
    const existant = await Restaurant.findOne({
      where: { restaurateurId: req.utilisateur.id }
    });

    if (existant) {
      return res.status(400).json({
        message: 'Vous avez déjà un restaurant enregistré.'
      });
    }

    let image = req.file
      ? (req.file.path || req.file.secure_url || req.file.url || null)
      : null;

    if (req.file && !image && req.file.buffer) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const restaurant = await Restaurant.create({
      nom,
      description,
      categorie,
      adresse,
      telephone,
      heureOuverture,
      heureFermeture,
      image,
      restaurateurId: req.utilisateur.id,
      statut: 'en_attente' // validation admin requise
    });

    res.status(201).json({
      message: 'Restaurant créé. En attente de validation par l\'administrateur.',
      restaurant
    });
  } catch (error) {
    console.error('❌ Erreur création restaurant :', error.message);
    res.status(500).json({ message: 'Erreur lors de la création du restaurant.' });
  }
};

// ─── MODIFIER MON RESTAURANT ────────────────────────────────────────────────
const modifierRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { restaurateurId: req.utilisateur.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable.' });
    }

    const { nom, description, adresse, telephone, estOuvert, heureOuverture, heureFermeture } = req.body;
    let image = req.file
      ? (req.file.path || req.file.secure_url || req.file.url || restaurant.image)
      : restaurant.image;

    if (req.file && !image && req.file.buffer) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await restaurant.update({
      nom, description, adresse,
      telephone, estOuvert,
      heureOuverture, heureFermeture, image
    });

    res.json({ message: 'Restaurant mis à jour.', restaurant });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
};

// ─── MON RESTAURANT (restaurateur connecté) ─────────────────────────────────
const monRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { restaurateurId: req.utilisateur.id },
      include: [
        {
          model: Plat,
          as: 'plats',
          required: false
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Vous n\'avez pas encore de restaurant.' });
    }

    res.json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération.' });
  }
};

module.exports = {
  obtenirRestaurants,
  obtenirRestaurant,
  creerRestaurant,
  modifierRestaurant,
  monRestaurant
};