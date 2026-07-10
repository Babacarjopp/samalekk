const express = require('express');
const router  = express.Router();
const { mesNotifications, marquerCommeLue, toutMarquerCommeLu } = require('../controllers/notificationController');
const { verifierToken } = require('../middlewares/authMiddleware');

router.use(verifierToken);

router.get('/',           mesNotifications);
router.put('/:id/lue',    marquerCommeLue);
router.put('/tout-lire',  toutMarquerCommeLu);

module.exports = router;