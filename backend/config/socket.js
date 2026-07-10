const jwt = require('jsonwebtoken');
const { Utilisateur, Livraison, Commande } = require('../models/index');

const configureSocket = (io) => {
  const livreursConnectes = {};

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Token manquant'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const utilisateur = await Utilisateur.findByPk(decoded.id, {
        attributes: ['id', 'role', 'statut', 'nom']
      });

      if (!utilisateur || utilisateur.statut === 'suspendu') {
        return next(new Error('Utilisateur non autorisé'));
      }

      socket.utilisateur = utilisateur;
      next();
    } catch {
      next(new Error('Authentification échouée'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.utilisateur.role} connecté : ${socket.utilisateur.nom}`);

    socket.on('livreur:connecte', (livreurId) => {
      if (socket.utilisateur.role !== 'livreur' || socket.utilisateur.id !== livreurId) {
        socket.emit('erreur', { message: 'Identité livreur invalide.' });
        return;
      }

      livreursConnectes[livreurId] = socket.id;
      console.log(`🛵 Livreur ${livreurId} connecté`);
    });

    socket.on('livreur:position', async ({ livraisonId, lat, lng, livreurId }) => {
      if (socket.utilisateur.role !== 'livreur' || socket.utilisateur.id !== livreurId) {
        return;
      }

      try {
        const livraison = await Livraison.findOne({
          where: { id: livraisonId, livreurId }
        });

        if (!livraison) return;

        await livraison.update({ latActuelle: lat, lngActuelle: lng });

        io.to(`livraison:${livraisonId}`).emit('livreur:position:update', {
          lat,
          lng,
          livreurId,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('❌ Erreur position socket :', err.message);
      }
    });

    socket.on('client:suivre', async (livraisonId) => {
      if (socket.utilisateur.role !== 'client') {
        socket.emit('erreur', { message: 'Accès réservé aux clients.' });
        return;
      }

      try {
        const livraison = await Livraison.findOne({
          where: { id: livraisonId },
          include: [{ model: Commande, as: 'commande', attributes: ['clientId'] }]
        });

        if (!livraison || livraison.commande.clientId !== socket.utilisateur.id) {
          socket.emit('erreur', { message: 'Accès refusé à cette livraison.' });
          return;
        }

        socket.join(`livraison:${livraisonId}`);
        console.log(`👤 Client suit la livraison ${livraisonId}`);

        if (livraison.latActuelle != null && livraison.lngActuelle != null) {
          socket.emit('livreur:position:update', {
            lat: livraison.latActuelle,
            lng: livraison.lngActuelle,
            livreurId: livraison.livreurId,
            timestamp: new Date()
          });
        }
      } catch (err) {
        console.error('❌ Erreur suivi client :', err.message);
        socket.emit('erreur', { message: 'Impossible de rejoindre le suivi.' });
      }
    });

    socket.on('disconnect', () => {
      for (const [livreurId, socketId] of Object.entries(livreursConnectes)) {
        if (socketId === socket.id) {
          delete livreursConnectes[livreurId];
          console.log(`🛵 Livreur ${livreurId} déconnecté`);
          break;
        }
      }
    });
  });

  return { livreursConnectes };
};

module.exports = configureSocket;
