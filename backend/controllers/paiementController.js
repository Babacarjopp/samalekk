const { Paiement, Commande } = require('../models/index');
const { traiterConfirmationPaiement } = require('../utils/traiterPaiement');

const initierPaiement = async (req, res) => {
  try {
    const { commandeId, methode } = req.body;

    if (!['wave', 'orange_money'].includes(methode)) {
      return res.status(400).json({ message: 'Méthode de paiement invalide.' });
    }

    const commande = await Commande.findOne({
      where: { id: commandeId, clientId: req.utilisateur.id, modePaiement: 'en_ligne' }
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    if (commande.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Cette commande a déjà été traitée.' });
    }

    await Paiement.update({ methode }, { where: { commandeId } });

    res.json({
      message: 'Paiement initié.',
      commandeId: commande.id,
      montant:    commande.montantTotal,
      methode,
      simulation: process.env.NODE_ENV !== 'production',
      redirectUrl: `https://payment.simulation.sn/pay?ref=${commandeId}`
    });

  } catch (error) {
    console.error('❌ Erreur paiement :', error.message);
    res.status(500).json({ message: 'Erreur lors de l\'initiation du paiement.' });
  }
};

const webhookConfirmation = async (req, res) => {
  try {
    const { commandeId, referenceTransaction, statut } = req.body;

    if (!commandeId || !statut) {
      return res.status(400).json({ message: 'Données webhook incomplètes.' });
    }

    const io = req.app.get('io');
    await traiterConfirmationPaiement(io, { commandeId, referenceTransaction, statut });

    res.json({ message: 'Webhook traité.' });
  } catch (error) {
    if (error.code === 'PAIEMENT_INTROUVABLE') {
      return res.status(404).json({ message: error.message });
    }
    console.error('❌ Erreur webhook :', error.message);
    res.status(500).json({ message: 'Erreur lors du traitement du webhook.' });
  }
};

// Simulation dev uniquement — remplace l'appel Wave/OM en local
const simulerPaiement = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Simulation non disponible en production.' });
  }

  try {
    const { commandeId, statut } = req.body;

    if (!commandeId || !['success', 'failed'].includes(statut)) {
      return res.status(400).json({ message: 'Paramètres invalides.' });
    }

    const commande = await Commande.findOne({
      where: { id: commandeId, clientId: req.utilisateur.id, modePaiement: 'en_ligne' }
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    const io = req.app.get('io');
    await traiterConfirmationPaiement(io, {
      commandeId,
      referenceTransaction: `SIM-${Date.now()}`,
      statut
    });

    res.json({
      message: statut === 'success' ? 'Paiement simulé avec succès.' : 'Paiement simulé échoué.',
      statut:  statut === 'success' ? 'confirme' : 'echoue'
    });
  } catch (error) {
    if (error.code === 'PAIEMENT_INTROUVABLE') {
      return res.status(404).json({ message: error.message });
    }
    console.error('❌ Erreur simulation :', error.message);
    res.status(500).json({ message: 'Erreur lors de la simulation.' });
  }
};

const statutPaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findOne({
      where: { commandeId: req.params.commandeId },
      include: [{
        model: Commande,
        as: 'commande',
        where: { clientId: req.utilisateur.id },
        attributes: ['id', 'statut', 'montantTotal', 'modePaiement']
      }]
    });

    if (!paiement) {
      return res.status(404).json({ message: 'Paiement introuvable.' });
    }

    res.json({ paiement });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du paiement.' });
  }
};

module.exports = { initierPaiement, webhookConfirmation, simulerPaiement, statutPaiement };
