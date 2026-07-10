const { Paiement, Commande, Livraison, Restaurant } = require('../models/index');
const { envoyerNotification } = require('./sendNotification');

const traiterConfirmationPaiement = async (io, { commandeId, referenceTransaction, statut }) => {
  const paiement = await Paiement.findOne({ where: { commandeId } });

  if (!paiement) {
    const err = new Error('Paiement introuvable.');
    err.code = 'PAIEMENT_INTROUVABLE';
    throw err;
  }

  if (paiement.statut === 'confirme') {
    return { dejaConfirme: true };
  }

  if (statut === 'success') {
    await paiement.update({
      statut: 'confirme',
      referenceTransaction: referenceTransaction || `TXN-${Date.now()}`
    });

    const commande = await Commande.findByPk(commandeId, {
      include: [{ model: Restaurant, as: 'restaurant' }]
    });

    await commande.update({ statut: 'confirmee' });
    await Livraison.create({ commandeId });

    await envoyerNotification(
      io,
      commande.clientId,
      'Paiement confirmé ! Votre commande est maintenant en cours de traitement. ✅',
      'paiement'
    );

    if (commande.restaurant?.restaurateurId) {
      await envoyerNotification(
        io,
        commande.restaurant.restaurateurId,
        `Nouvelle commande payée ! Montant : ${commande.montantTotal.toLocaleString()} FCFA`,
        'commande'
      );
    }
  } else {
    await paiement.update({ statut: 'echoue' });
    await Commande.update({ statut: 'annulee' }, { where: { id: commandeId } });
  }

  return { dejaConfirme: false };
};

module.exports = { traiterConfirmationPaiement };
