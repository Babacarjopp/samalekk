const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Plat = sequelize.define('Plat', {
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
  prix: {
    type: DataTypes.INTEGER,  // prix en FCFA, toujours entier
    allowNull: false,
    validate: { min: 100 }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categorie: {
    type: DataTypes.ENUM(
      'plat principal',
      'entrée',
      'dessert',
      'boisson',
      'accompagnement'
    ),
    defaultValue: 'plat principal'
  },
  // soft delete : on désactive le plat sans le supprimer
  // pour garder l'historique des commandes
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: { min: 0 }
  },
  restaurantId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'plats',
  timestamps: true
});

module.exports = Plat;