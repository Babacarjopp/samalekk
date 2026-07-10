import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paiementService } from '../../services/paiementService';
import { formatPrix } from '../../utils/formatPrix';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const methodes = [
  { valeur: 'wave',          label: 'Wave',          emoji: '🌊', couleur: 'border-blue-500 bg-blue-50' },
  { valeur: 'orange_money',  label: 'Orange Money',  emoji: '🟠', couleur: 'border-orange-500 bg-orange-50' },
];

const Paiement = () => {
  const { commandeId } = useParams();
  const navigate = useNavigate();

  const [paiement,     setPaiement]     = useState(null);
  const [methode,      setMethode]      = useState('wave');
  const [etape,        setEtape]        = useState('choix'); // choix | simulation | succes | echec
  const [chargement,   setChargement]   = useState(true);
  const [traitement,   setTraitement]   = useState(false);
  const [erreur,       setErreur]       = useState('');

  useEffect(() => {
    chargerStatut();
  }, [commandeId]);

  const chargerStatut = async () => {
    try {
      const res = await paiementService.statut(commandeId);
      const p = res.data.paiement;
      setPaiement(p);

      if (p.statut === 'confirme' || p.commande?.statut === 'confirmee') {
        setEtape('succes');
      } else if (p.statut === 'echoue' || p.commande?.statut === 'annulee') {
        setEtape('echec');
      }
    } catch {
      setErreur('Commande introuvable ou accès refusé.');
    } finally {
      setChargement(false);
    }
  };

  const initierPaiement = async () => {
    setTraitement(true);
    setErreur('');
    try {
      await paiementService.initier({ commandeId, methode });
      setEtape('simulation');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'initiation du paiement.');
    } finally {
      setTraitement(false);
    }
  };

  const simuler = async (statut) => {
    setTraitement(true);
    setErreur('');
    try {
      await paiementService.simuler({ commandeId, statut });
      setEtape(statut === 'success' ? 'succes' : 'echec');
      if (statut === 'success') {
        setTimeout(() => navigate('/mes-commandes'), 3000);
      }
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la simulation.');
    } finally {
      setTraitement(false);
    }
  };

  if (chargement) return <Loader texte="Chargement du paiement..." />;

  if (erreur && !paiement) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-gray-600 mb-6">{erreur}</p>
        <Button variante="primaire" onClick={() => navigate('/mes-commandes')}>
          Retour à mes commandes
        </Button>
      </div>
    );
  }

  const montant = paiement?.montant || paiement?.commande?.montantTotal;

  if (etape === 'succes') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center animer max-w-md">
          <div className="text-8xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Paiement confirmé !</h2>
          <p className="text-gray-500 mb-2">
            Votre commande de {formatPrix(montant)} a été validée.
          </p>
          <p className="text-orange-600 font-semibold text-sm">
            Redirection vers vos commandes...
          </p>
        </div>
      </div>
    );
  }

  if (etape === 'echec') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">❌</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Paiement échoué</h2>
          <p className="text-gray-500 mb-6">
            Votre commande a été annulée. Vous pouvez réessayer depuis le panier.
          </p>
          <Button variante="primaire" onClick={() => navigate('/restaurants')}>
            Retour aux restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement en ligne</h1>
      <p className="text-gray-500 mb-8">
        Montant à payer : <span className="font-bold text-orange-600">{formatPrix(montant)}</span>
      </p>

      {etape === 'choix' && (
        <div className="space-y-6">
          <div className="carte p-6">
            <h2 className="font-bold text-gray-900 mb-4">Choisissez votre moyen de paiement</h2>
            <div className="space-y-3">
              {methodes.map(m => (
                <button
                  key={m.valeur}
                  type="button"
                  onClick={() => setMethode(m.valeur)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all
                              flex items-center gap-4
                              ${methode === m.valeur ? m.couleur : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="font-semibold text-gray-900">{m.label}</span>
                  {methode === m.valeur && (
                    <span className="ml-auto text-orange-600 text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              {erreur}
            </div>
          )}

          <Button
            variante="primaire"
            chargement={traitement}
            onClick={initierPaiement}
            className="w-full py-4"
          >
            Payer {formatPrix(montant)} via {methodes.find(m => m.valeur === methode)?.label}
          </Button>
        </div>
      )}

      {etape === 'simulation' && (
        <div className="space-y-6">
          <div className="carte p-6 bg-amber-50 border border-amber-200">
            <h2 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              🧪 Mode simulation
            </h2>
            <p className="text-amber-700 text-sm">
              En production, vous seriez redirigé vers{' '}
              <strong>{methodes.find(m => m.valeur === methode)?.label}</strong>{' '}
              pour finaliser le paiement. Utilisez les boutons ci-dessous pour simuler le résultat.
            </p>
          </div>

          <div className="carte p-6 text-center">
            <div className="text-5xl mb-4">
              {methodes.find(m => m.valeur === methode)?.emoji}
            </div>
            <p className="text-gray-600 mb-1">Paiement en attente</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrix(montant)}</p>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              {erreur}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variante="vert"
              chargement={traitement}
              onClick={() => simuler('success')}
              className="flex-1 py-4"
            >
              ✅ Simuler succès
            </Button>
            <Button
              variante="danger"
              chargement={traitement}
              disabled={traitement}
              onClick={() => simuler('failed')}
              className="flex-1 py-4"
            >
              ❌ Simuler échec
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paiement;
