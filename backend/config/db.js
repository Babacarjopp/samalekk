const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connexion à PostgreSQL via Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // mettre true pour voir les requêtes SQL en développement
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 10,      // maximum 10 connexions simultanées
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Tester la connexion au démarrage
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL établie avec succès');
  } catch (error) {
    console.error('❌ Impossible de se connecter à PostgreSQL :', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };