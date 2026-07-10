// Vérifier que l'utilisateur a le bon rôle pour accéder à une route
// Utilisation : autoriserRoles('admin', 'restaurateur')

const autoriserRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }

    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        message: `Accès interdit. Cette action est réservée aux : ${roles.join(', ')}.`
      });
    }

    next();
  };
};

module.exports = { autoriserRoles };