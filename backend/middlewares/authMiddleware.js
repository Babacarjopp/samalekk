const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models/index');

// Vérifier que le token JWT est valide
const verifierToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Accès refusé. Veuillez vous connecter.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours et est actif
    const utilisateur = await Utilisateur.findByPk(decoded.id, {
      attributes: { exclude: ['motDePasse'] }
    });

    if (!utilisateur) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    if (utilisateur.statut === 'suspendu') {
      return res.status(403).json({
        message: 'Votre compte a été suspendu. Contactez l\'administrateur.'
      });
    }

    // Utiliser le rôle et le statut du token si disponible pour éviter
    // les blocages dus à une session périmée ou à une incohérence de contexte.
    req.utilisateur = {
      ...utilisateur.toJSON(),
      role: decoded.role || utilisateur.role,
      statut: decoded.statut || utilisateur.statut
    };
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée. Reconnectez-vous.' });
    }
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = { verifierToken };