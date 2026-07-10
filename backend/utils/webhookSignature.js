const crypto = require('crypto');

const genererSignature = (payload, secret) => {
  const body = Buffer.isBuffer(payload) ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
};

const verifierSignature = (payload, signature, secret) => {
  if (!secret || !signature) return false;

  try {
    const attendu = genererSignature(payload, secret);
    const recu = signature.replace(/^sha256=/, '');

    if (recu.length !== attendu.length) return false;

    return crypto.timingSafeEqual(
      Buffer.from(recu, 'hex'),
      Buffer.from(attendu, 'hex')
    );
  } catch {
    return false;
  }
};

module.exports = { genererSignature, verifierSignature };
