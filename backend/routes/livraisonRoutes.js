const express = require('express');
const router  = express.Router();
const {
  missionsDisponibles,
  accepterMission,
  confirmerRecuperation,
  confirmerLivraison,
  mettreAJourPosition,
  suivreLivraison,
  missionLivreur,
  mettreAJourPositionClient
} = require('../controllers/livraisonController');
const { verifierToken }  = require('../middlewares/authMiddleware');
const { autoriserRoles } = require('../middlewares/roleMiddleware');
const { exigerCompteActif } = require('../middlewares/compteMiddleware');

// Livreur
router.get('/missions',
  verifierToken, autoriserRoles('livreur'), exigerCompteActif, missionsDisponibles);

router.put('/:id/accepter',
  verifierToken, autoriserRoles('livreur'), exigerCompteActif, accepterMission);

router.put('/:id/recuperer',
  verifierToken, autoriserRoles('livreur'), exigerCompteActif, confirmerRecuperation);

router.put('/:id/livrer',
  verifierToken, autoriserRoles('livreur'), exigerCompteActif, confirmerLivraison);

router.post('/position',
  verifierToken, autoriserRoles('livreur'), exigerCompteActif, mettreAJourPosition);

router.get('/:id/mission',
  verifierToken, autoriserRoles('livreur'), exigerCompteActif, missionLivreur);

// Client
router.get('/:id/suivi',
  verifierToken, autoriserRoles('client'), suivreLivraison);

router.post('/position/client',
  verifierToken, autoriserRoles('client'), mettreAJourPositionClient);

module.exports = router;