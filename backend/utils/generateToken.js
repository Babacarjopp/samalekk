const jwt = require('jsonwebtoken');

// Générer un token JWT pour un utilisateur
const generateToken = (utilisateur) => {
  return jwt.sign(
    {
      id:     utilisateur.id,
      email:  utilisateur.email,
      role:   utilisateur.role,
      statut: utilisateur.statut
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = { generateToken };