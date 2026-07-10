const express = require('express');
const router  = express.Router();
const { sInscrire, seConnecter, monProfil, modifierProfil, changerMotDePasse } = require('../controllers/authController');
const { verifierToken } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/register', sInscrire);
router.post('/login',    seConnecter);

// Routes protégées (token requis)
router.get('/profil',            verifierToken, monProfil);
router.put('/profil',            verifierToken, modifierProfil);
router.put('/changer-mot-passe', verifierToken, changerMotDePasse);

module.exports = router;