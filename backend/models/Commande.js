const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // statut complet du cycle de vie d'une commande
  statut: {
    type: DataTypes.ENUM(
      'en_attente',      // commande créée, paiement non encore confirmé
      'confirmee',       // paiement confirmé ou paiement à la livraison choisi
      'en_preparation',  // le restaurateur prépare
      'en_livraison',    // le livreur est en route
      'livree',          // livraison confirmée
      'annulee'          // commande annulée
    ),
    defaultValue: 'en_attente'
  },
  montantTotal: {
    type: DataTypes.INTEGER,  // en FCFA
    allowNull: false
  },
  fraisLivraison: {
    type: DataTypes.INTEGER,
    defaultValue: 500         // frais de base en FCFA
  },
  modePaiement: {
    type: DataTypes.ENUM('en_ligne', 'a_la_livraison'),
    allowNull: false
  },
  // adresse et coordonnées GPS de livraison
  adresseLivraison: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  latitudeLivraison: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitudeLivraison: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  // note laissée par le client après livraison
  note: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 }
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // clés étrangères
  clientId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  restaurantId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'commandes',
  timestamps: true
});

module.exports = Commande;