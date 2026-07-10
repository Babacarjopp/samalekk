const express = require('express');
const router  = express.Router();
const {
  obtenirRestaurants,
  obtenirRestaurant,
  creerRestaurant,
  modifierRestaurant,
  monRestaurant
} = require('../controllers/restaurantController');
const { verifierToken }   = require('../middlewares/authMiddleware');
const { autoriserRoles }  = require('../middlewares/roleMiddleware');
const { exigerCompteActif } = require('../middlewares/compteMiddleware');
const { uploadRestaurant } = require('../config/cloudinary');

// Routes publiques
router.get('/',     obtenirRestaurants);
router.get('/:id',  obtenirRestaurant);

// Routes restaurateur
router.get('/moi/restaurant',
  verifierToken,
  autoriserRoles('restaurateur'),
  monRestaurant
);

router.post('/',
  verifierToken,
  autoriserRoles('restaurateur'),
  uploadRestaurant.single('image'),
  creerRestaurant
);

router.put('/moi/restaurant',
  verifierToken,
  autoriserRoles('restaurateur'),
  exigerCompteActif,
  uploadRestaurant.single('image'),
  modifierRestaurant
);

module.exports = router;