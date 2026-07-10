// Ce fichier définit toutes les relations entre les tables
// Il correspond exactement à notre diagramme de classes UML

const Utilisateur                                     = require('./Utilisateur');
const Restaurant                                      = require('./Restaurant');
const Plat                                            = require('./Plat');
const Commande                                        = require('./Commande');
const { LigneCommande, Livraison, Paiement, Notification } = require('./autres');

// ─── Utilisateur (Restaurateur) → Restaurant ───────────────────────────────
// Un restaurateur gère un seul restaurant
Utilisateur.hasOne(Restaurant, {
  foreignKey: 'restaurateurId',
  as: 'restaurant'
});
Restaurant.belongsTo(Utilisateur, {
  foreignKey: 'restaurateurId',
  as: 'restaurateur'
});

// ─── Restaurant → Plats ────────────────────────────────────────────────────
// Un restaurant propose plusieurs plats
Restaurant.hasMany(Plat, {
  foreignKey: 'restaurantId',
  as: 'plats'
});
Plat.belongsTo(Restaurant, {
  foreignKey: 'restaurantId',
  as: 'restaurant'
});

// ─── Client → Commandes ────────────────────────────────────────────────────
// Un client passe plusieurs commandes
Utilisateur.hasMany(Commande, {
  foreignKey: 'clientId',
  as: 'commandes'
});
Commande.belongsTo(Utilisateur, {
  foreignKey: 'clientId',
  as: 'client'
});

// ─── Restaurant → Commandes ────────────────────────────────────────────────
Restaurant.hasMany(Commande, {
  foreignKey: 'restaurantId',
  as: 'commandes'
});
Commande.belongsTo(Restaurant, {
  foreignKey: 'restaurantId',
  as: 'restaurant'
});

// ─── Commande → LignesCommande ─────────────────────────────────────────────
// Une commande contient plusieurs lignes (chaque plat commandé)
Commande.hasMany(LigneCommande, {
  foreignKey: 'commandeId',
  as: 'lignes',
  onDelete: 'CASCADE'
});
LigneCommande.belongsTo(Commande, {
  foreignKey: 'commandeId',
  as: 'commande'
});

// ─── Plat → LignesCommande ─────────────────────────────────────────────────
// Chaque ligne référence un plat précis
Plat.hasMany(LigneCommande, {
  foreignKey: 'platId',
  as: 'lignes'
});
LigneCommande.belongsTo(Plat, {
  foreignKey: 'platId',
  as: 'plat'
});

// ─── Commande → Livraison ──────────────────────────────────────────────────
// Une commande déclenche une seule livraison
Commande.hasOne(Livraison, {
  foreignKey: 'commandeId',
  as: 'livraison'
});
Livraison.belongsTo(Commande, {
  foreignKey: 'commandeId',
  as: 'commande'
});

// ─── Livreur → Livraisons ──────────────────────────────────────────────────
// Un livreur effectue plusieurs livraisons
Utilisateur.hasMany(Livraison, {
  foreignKey: 'livreurId',
  as: 'livraisons'
});
Livraison.belongsTo(Utilisateur, {
  foreignKey: 'livreurId',
  as: 'livreur'
});

// ─── Commande → Paiement ───────────────────────────────────────────────────
// Une commande génère un seul paiement
Commande.hasOne(Paiement, {
  foreignKey: 'commandeId',
  as: 'paiement'
});
Paiement.belongsTo(Commande, {
  foreignKey: 'commandeId',
  as: 'commande'
});

// ─── Utilisateur → Notifications ───────────────────────────────────────────
Utilisateur.hasMany(Notification, {
  foreignKey: 'destinataireId',
  as: 'notifications'
});
Notification.belongsTo(Utilisateur, {
  foreignKey: 'destinataireId',
  as: 'destinataire'
});

module.exports = {
  Utilisateur,
  Restaurant,
  Plat,
  Commande,
  LigneCommande,
  Livraison,
  Paiement,
  Notification
};