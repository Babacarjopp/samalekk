const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categorie: {
    type: DataTypes.ENUM(
      'sénégalaise',
      'fast-food',
      'grillades',
      'sandwicherie',
      'pâtisserie',
      'autre'
    ),
    defaultValue: 'sénégalaise'
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // note moyenne calculée à partir des avis clients
  noteMoyenne: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  nombreAvis: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estOuvert: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // validé par l'admin avant d'apparaître sur la plateforme
  statut: {
    type: DataTypes.ENUM('en_attente', 'valide', 'suspendu'),
    defaultValue: 'en_attente'
  },
  heureOuverture: {
    type: DataTypes.STRING(5),
    defaultValue: '08:00'
  },
  heureFermeture: {
    type: DataTypes.STRING(5),
    defaultValue: '22:00'
  },
  // clé étrangère vers le restaurateur propriétaire
  restaurateurId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'restaurants',
  timestamps: true
});

module.exports = Restaurant;