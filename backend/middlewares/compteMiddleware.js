// Exige un compte actif (hors inscription / création restaurant)
const exigerCompteActif = (req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({ message: 'Non authentifié.' });
  }

  if (req.utilisateur.statut === 'en_attente') {
    return res.status(403).json({
      message: 'Votre compte est en attente de validation par l\'administrateur.'
    });
  }

  if (req.utilisateur.statut === 'suspendu') {
    return res.status(403).json({
      message: 'Votre compte a été suspendu. Contactez l\'administrateur.'
    });
  }

  next();
};

module.exports = { exigerCompteActif };
