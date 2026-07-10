const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// ─── LigneCommande ─────────────────────────────────────────────────────────
// Représente chaque plat dans une commande
// Exemple : 2 Thiéboudienne à 2500 FCFA = 5000 FCFA
const LigneCommande = sequelize.define('LigneCommande', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 }
  },
  prixUnitaire: {
    type: DataTypes.INTEGER,  // prix au moment de la commande (snapshot)
    allowNull: false
  },
  sousTotal: {
    type: DataTypes.INTEGER,  // quantite × prixUnitaire
    allowNull: false
  },
  commandeId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  platId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'lignes_commande',
  timestamps: false
});

// ─── Livraison ─────────────────────────────────────────────────────────────
// Créée automatiquement quand une commande est confirmée
const Livraison = sequelize.define('Livraison', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  statut: {
    type: DataTypes.ENUM(
      'en_attente',   // pas encore de livreur assigné
      'acceptee',     // livreur a accepté
      'recuperee',    // livreur a récupéré chez le restaurateur
      'livree'        // livraison confirmée chez le client
    ),
    defaultValue: 'en_attente'
  },
  dateDebut: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dateFin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  distanceKm: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  // position actuelle du livreur (mise à jour en temps réel)
  latActuelle: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  lngActuelle: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  commandeId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true  // une commande = une seule livraison
  },
  livreurId: {
    type: DataTypes.UUID,
    allowNull: true  // null jusqu'à ce qu'un livreur accepte
  }
}, {
  tableName: 'livraisons',
  timestamps: true
});

// ─── Paiement ──────────────────────────────────────────────────────────────
const Paiement = sequelize.define('Paiement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  montant: {
    type: DataTypes.INTEGER,  // en FCFA
    allowNull: false
  },
  methode: {
    type: DataTypes.ENUM('wave', 'orange_money', 'cash'),
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'confirme', 'echoue', 'rembourse'),
    defaultValue: 'en_attente'
  },
  // référence retournée par Wave ou Orange Money
  referenceTransaction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  commandeId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'paiements',
  timestamps: true
});

// ─── Notification ──────────────────────────────────────────────────────────
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'commande',
      'paiement',
      'livraison',
      'systeme'
    ),
    defaultValue: 'systeme'
  },
  lue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  destinataireId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = { LigneCommande, Livraison, Paiement, Notification };