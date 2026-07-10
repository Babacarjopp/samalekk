const express = require('express');
const router  = express.Router();
const { ajouterPlat, modifierPlat, supprimerPlat, platsRestaurant } = require('../controllers/platController');
const { verifierToken }  = require('../middlewares/authMiddleware');
const { autoriserRoles } = require('../middlewares/roleMiddleware');
const { exigerCompteActif } = require('../middlewares/compteMiddleware');
const { uploadPlat }     = require('../config/cloudinary');

// Route publique : plats d'un restaurant
router.get('/restaurant/:restaurantId', platsRestaurant);

// Routes restaurateur uniquement
router.post('/',
  verifierToken,
  autoriserRoles('restaurateur'),
  exigerCompteActif,
  uploadPlat.single('image'),
  ajouterPlat
);

router.put('/:id',
  verifierToken,
  autoriserRoles('restaurateur'),
  exigerCompteActif,
  uploadPlat.single('image'),
  modifierPlat
);

router.delete('/:id',
  verifierToken,
  autoriserRoles('restaurateur'),
  exigerCompteActif,
  supprimerPlat
);

module.exports = router;