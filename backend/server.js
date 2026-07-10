const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
const configureSocket = require('./config/socket');

// Import des routes
const authRoutes        = require('./routes/authRoutes');
const restaurantRoutes  = require('./routes/restaurantRoutes');
const platRoutes        = require('./routes/platRoutes');
const commandeRoutes    = require('./routes/commandeRoutes');
const livraisonRoutes   = require('./routes/livraisonRoutes');
const paiementRoutes    = require('./routes/paiementRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const notifRoutes       = require('./routes/notificationRoutes');

const { webhookConfirmation } = require('./controllers/paiementController');
const { verifierSignatureWebhook } = require('./middlewares/webhookMiddleware');

const app    = express();
const server = http.createServer(app);

// Configuration Socket.io avec CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Webhook paiement — corps brut pour vérification HMAC (avant express.json)
app.post('/api/paiements/webhook',
  express.raw({ type: 'application/json' }),
  verifierSignatureWebhook,
  (req, res, next) => {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).json({ message: 'Corps JSON invalide.' });
    }
    webhookConfirmation(req, res, next);
  }
);

// ─── Middlewares globaux ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre io accessible dans les controllers
app.set('io', io);

// ─── Routes API ───────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/restaurants',   restaurantRoutes);
app.use('/api/plats',         platRoutes);
app.use('/api/commandes',     commandeRoutes);
app.use('/api/livraisons',    livraisonRoutes);
app.use('/api/paiements',     paiementRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notifRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🍽️ Touba Food Delivery API — En ligne',
    version: '1.0.0',
    status: 'OK'
  });
});

// Gestion des routes introuvables
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.message);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// ─── Démarrage ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const demarrer = async () => {
  // 1. Connexion à la base de données
  await connectDB();

  // 2. Synchroniser les modèles avec la base (alter: true = mise à jour douce)
  await sequelize.sync({ alter: true });
  console.log('✅ Modèles synchronisés avec PostgreSQL');

  // 3. Configurer Socket.io
  configureSocket(io);

  // 4. Lancer le serveur
  server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 Socket.io actif`);
    console.log(`🌐 API disponible : http://localhost:${PORT}`);
  });
};

demarrer();