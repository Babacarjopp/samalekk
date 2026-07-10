const express = require('express');
const router  = express.Router();
const {
  initierPaiement,
  simulerPaiement,
  statutPaiement
} = require('../controllers/paiementController');
const { verifierToken }  = require('../middlewares/authMiddleware');
const { autoriserRoles } = require('../middlewares/roleMiddleware');

router.post('/initier',    verifierToken, autoriserRoles('client'), initierPaiement);
router.post('/simuler',    verifierToken, autoriserRoles('client'), simulerPaiement);
router.get('/:commandeId', verifierToken, autoriserRoles('client'), statutPaiement);

module.exports = router;
