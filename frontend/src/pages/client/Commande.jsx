import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanier } from '../../context/PanierContext';
import { useAuth } from '../../context/AuthContext';
import { commandeService } from '../../services/commandeService';
import { formatPrix } from '../../utils/formatPrix';
import Button from '../../components/common/Button';
import SelecteurAdresse from '../../components/common/SelecteurAdresse';

const FRAIS_LIVRAISON = 500;

const modesPaiement = [
  { valeur: 'en_ligne',      label: 'Payer en ligne',      icone: 'ti ti-mobile', desc: 'Wave ou Orange Money' },
  { valeur: 'a_la_livraison', label: 'Payer à la livraison', icone: 'ti ti-cash', desc: 'Cash au livreur' },
];

const Commande = () => {
  const navigate  = useNavigate();
  const { utilisateur } = useAuth();
  const { articles, restaurantId, restaurantNom, sousTotal, viderPanier } = usePanier();

  const [adresse,      setAdresse]      = useState('');
  const [modePaiement, setModePaiement] = useState('a_la_livraison');
  const [position,     setPosition]     = useState(null);
  const [adresseComplete, setAdresseComplete] = useState(null);
  const [chargement,   setChargement]   = useState(false);
  const [erreur,       setErreur]       = useState('');
  const [success,      setSuccess]      = useState(false);

  const total = sousTotal + FRAIS_LIVRAISON;

  // Gérer le changement d'adresse avec le sélecteur
  const handleAdresseChange = (adresseData) => {
    setAdresse(adresseData.adresse);
    setAdresseComplete(adresseData);
    if (adresseData.latitude && adresseData.longitude) {
      setPosition({
        lat: adresseData.latitude,
        lng: adresseData.longitude
      });
    }
  };

  // Rediriger si panier vide
  useEffect(() => {
    if (articles.length === 0 && !success) {
      navigate('/restaurants');
    }
  }, [articles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adresse.trim()) {
      setErreur('Veuillez renseigner votre adresse de livraison.');
      return;
    }
    setChargement(true);
    setErreur('');
    try {
      const donnees = {
        restaurantId,
        plats: articles.map(a => ({ platId: a.id, quantite: a.quantite })),
        adresseLivraison:   adresseComplete?.adresse || adresse,
        latitudeLivraison:  adresseComplete?.latitude || position?.lat || null,
        longitudeLivraison: adresseComplete?.longitude || position?.lng || null,
        modePaiement
      };

      const res = await commandeService.passer(donnees);
      viderPanier();

      if (modePaiement === 'en_ligne') {
        navigate(`/paiement/${res.data.commande.id}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/mes-commandes'), 2500);

    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la commande.');
    } finally {
      setChargement(false);
    }
  };

  // Écran de succès
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animer">
          <div className="text-8xl mb-6"><i className="ti ti-gift" /></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Commande passée !
          </h2>
          <p className="text-gray-500 text-lg mb-2">
            Votre commande a été envoyée au restaurant.
          </p>
          <p className="text-orange-600 font-semibold">
            Vous allez être redirigé vers vos commandes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Finaliser la commande
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">

          {/* Adresse de livraison */}
          <div className="carte p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-orange-100 text-orange-700 rounded-full
                               flex items-center justify-center text-sm font-bold">1</span>
              Adresse de livraison
            </h2>

            <SelecteurAdresse 
              onAdresseChange={handleAdresseChange}
              adresseInitiale={adresse}
            />

            <p className="text-gray-400 text-xs mt-3">
              💡 Utilisez le GPS pour une précision optimale ou recherchez votre adresse manuellement
            </p>
          </div>

          {/* Mode de paiement */}
          <div className="carte p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-orange-100 text-orange-700 rounded-full
                               flex items-center justify-center text-sm font-bold">2</span>
              Mode de paiement
            </h2>

            <div className="space-y-3">
              {modesPaiement.map(mode => (
                <button
                  key={mode.valeur}
                  type="button"
                  onClick={() => setModePaiement(mode.valeur)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all
                              flex items-center gap-4
                              ${modePaiement === mode.valeur
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                              }`}
                >
                  <span className="text-3xl"><i className={`${mode.icone} text-2xl`} /></span>
                  <div>
                    <div className="font-semibold text-gray-900">{mode.label}</div>
                    <div className="text-gray-500 text-sm">{mode.desc}</div>
                  </div>
                  {modePaiement === mode.valeur && (
                    <span className="ml-auto text-orange-600 text-xl"><i className="ti ti-check" /></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-xl p-4 flex items-center gap-2">
              <i className="ti ti-alert-circle" /> {erreur}
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <div className="carte p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-1">Récapitulatif</h3>
            <p className="text-gray-400 text-sm mb-4"><i className="ti ti-restaurant text-sm" /> {restaurantNom}</p>

            {/* Articles */}
            <div className="space-y-2 mb-4">
              {articles.map(a => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {a.quantite}× {a.nom}
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatPrix(a.prix * a.quantite)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="border-t border-gray-100 pt-3 space-y-2 mb-5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span>{formatPrix(sousTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Livraison</span>
                <span>{formatPrix(FRAIS_LIVRAISON)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900
                              pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-orange-600 text-lg">{formatPrix(total)}</span>
              </div>
            </div>

            <Button
              variante="primaire"
              chargement={chargement}
              onClick={handleSubmit}
              className="w-full"
            >
              Confirmer la commande
            </Button>

            <p className="text-center text-gray-400 text-xs mt-3">
              En commandant, vous acceptez nos conditions d'utilisation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commande;