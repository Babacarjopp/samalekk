const express = require('express');
const router  = express.Router();
const {
  passerCommande,
  mesCommandes,
  commandesRestaurant,
  changerStatutCommande,
  noterCommande
} = require('../controllers/commandeController');
const { verifierToken }  = require('../middlewares/authMiddleware');
const { autoriserRoles } = require('../middlewares/roleMiddleware');
const { exigerCompteActif } = require('../middlewares/compteMiddleware');

// Client
router.post('/',       verifierToken, autoriserRoles('client'), passerCommande);
router.get('/mes',     verifierToken, autoriserRoles('client'), mesCommandes);
router.put('/:id/noter', verifierToken, autoriserRoles('client'), noterCommande);

// Restaurateur
router.get('/restaurant',    verifierToken, autoriserRoles('restaurateur'), exigerCompteActif, commandesRestaurant);
router.put('/:id/statut',    verifierToken, autoriserRoles('restaurateur'), exigerCompteActif, changerStatutCommande);

module.exports = router;