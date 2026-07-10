const { verifierSignature } = require('../utils/webhookSignature');

// Vérifie la signature HMAC envoyée par Wave / Orange Money
const verifierSignatureWebhook = (req, res, next) => {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;

  if (!secret) {
    console.error('❌ PAYMENT_WEBHOOK_SECRET non configuré');
    return res.status(500).json({ message: 'Configuration webhook manquante.' });
  }

  const signature = req.headers['x-webhook-signature'];

  if (!signature || !verifierSignature(req.body, signature, secret)) {
    return res.status(401).json({ message: 'Signature webhook invalide.' });
  }

  next();
};

module.exports = { verifierSignatureWebhook };
