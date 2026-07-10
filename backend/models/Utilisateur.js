const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // rôle définit l'interface et les droits de l'utilisateur
  role: {
    type: DataTypes.ENUM('client', 'restaurateur', 'livreur', 'admin'),
    defaultValue: 'client'
  },
  // statut du compte : en attente de validation par l'admin
  statut: {
    type: DataTypes.ENUM('actif', 'suspendu', 'en_attente'),
    defaultValue: 'actif'
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // coordonnées GPS — utilisées pour le client et le livreur
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  // spécifique au livreur
  vehicule: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'utilisateurs',
  timestamps: true  // createdAt et updatedAt automatiques
});

module.exports = Utilisateur;