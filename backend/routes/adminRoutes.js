const express = require('express');
const router  = express.Router();
const {
  tableauDeBord,
  restaurantsEnAttente,
  validerRestaurant,
  refuserRestaurant,
  tousLesUtilisateurs,
  changerStatutUtilisateur,
  gererLivreurs,
  statistiquesPeriode
} = require('../controllers/adminController');
const { verifierToken }  = require('../middlewares/authMiddleware');
const { autoriserRoles } = require('../middlewares/roleMiddleware');
const { exigerCompteActif } = require('../middlewares/compteMiddleware');

// Toutes les routes admin sont protégées
router.use(verifierToken, autoriserRoles('admin'), exigerCompteActif);

router.get('/tableau-de-bord',                  tableauDeBord);
router.get('/restaurants/en-attente',           restaurantsEnAttente);
router.put('/restaurants/:id/valider',          validerRestaurant);
router.put('/restaurants/:id/refuser',          refuserRestaurant);
router.get('/utilisateurs',                     tousLesUtilisateurs);
router.put('/utilisateurs/:id/statut',          changerStatutUtilisateur);
router.get('/livreurs',                         gererLivreurs);
router.get('/statistiques',                     statistiquesPeriode);

module.exports = router;