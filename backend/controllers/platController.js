const { Plat, Restaurant } = require('../models/index');

// ─── AJOUTER UN PLAT ────────────────────────────────────────────────────────
const ajouterPlat = async (req, res) => {
  try {
    const { nom, description, prix, categorie, stock } = req.body;

    // Récupérer le restaurant du restaurateur connecté
    const restaurant = await Restaurant.findOne({
      where: { restaurateurId: req.utilisateur.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Aucun restaurant trouvé.' });
    }

    if (!nom || !prix) {
      return res.status(400).json({ message: 'Nom et prix sont obligatoires.' });
    }

    let image = req.file
      ? (req.file.path || req.file.secure_url || req.file.url || null)
      : null;

    if (req.file && !image && req.file.buffer) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const plat = await Plat.create({
      nom,
      description,
      prix: parseInt(prix),
      categorie,
      stock: stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : 100,
      image,
      restaurantId: restaurant.id
    });

    res.status(201).json({
      message: `Le plat "${nom}" a été ajouté au menu.`,
      plat
    });
  } catch (error) {
    console.error('❌ Erreur ajout plat :', error.message);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du plat.' });
  }
};

// ─── MODIFIER UN PLAT ───────────────────────────────────────────────────────
const modifierPlat = async (req, res) => {
  try {
    const plat = await Plat.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }]
    });

    if (!plat) {
      return res.status(404).json({ message: 'Plat introuvable.' });
    }

    // S'assurer que ce plat appartient bien au restaurateur connecté
    if (plat.restaurant.restaurateurId !== req.utilisateur.id) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const { nom, description, prix, categorie, disponible, stock } = req.body;
    let image = req.file
      ? (req.file.path || req.file.secure_url || req.file.url || plat.image)
      : plat.image;

    if (req.file && !image && req.file.buffer) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await plat.update({
      nom:         nom         || plat.nom,
      description: description || plat.description,
      prix:        prix        ? parseInt(prix) : plat.prix,
      categorie:   categorie   || plat.categorie,
      disponible:  disponible !== undefined ? disponible : plat.disponible,
      stock:       stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : plat.stock,
      image
    });

    res.json({ message: 'Plat mis à jour.', plat });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du plat.' });
  }
};

// ─── SUPPRIMER UN PLAT (soft delete) ───────────────────────────────────────
const supprimerPlat = async (req, res) => {
  try {
    const plat = await Plat.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }]
    });

    if (!plat) {
      return res.status(404).json({ message: 'Plat introuvable.' });
    }

    if (plat.restaurant.restaurateurId !== req.utilisateur.id) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    // Soft delete : on désactive le plat au lieu de le supprimer
    // pour conserver l'historique des anciennes commandes
    await plat.update({ disponible: false });

    res.json({ message: `Le plat "${plat.nom}" a été retiré du menu.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du plat.' });
  }
};

// ─── PLATS D'UN RESTAURANT (public) ────────────────────────────────────────
const platsRestaurant = async (req, res) => {
  try {
    const plats = await Plat.findAll({
      where: {
        restaurantId: req.params.restaurantId,
        disponible: true
      },
      order: [['categorie', 'ASC'], ['nom', 'ASC']]
    });

    res.json({ plats });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des plats.' });
  }
};

module.exports = { ajouterPlat, modifierPlat, supprimerPlat, platsRestaurant };