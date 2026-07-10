import { useState, useEffect } from 'react';
import { commandeService } from '../../services/commandeService';
import { formatPrix } from '../../utils/formatPrix';
import { formatDate } from '../../utils/formatDate';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const statutsConfig = {
  confirmee:      { label: 'Nouvelle',       couleur: 'bg-blue-100 text-blue-700',    emoji: '🆕' },
  en_preparation: { label: 'En préparation', couleur: 'bg-orange-100 text-orange-700',emoji: '🍳' },
  en_livraison:   { label: 'En livraison',   couleur: 'bg-purple-100 text-purple-700',emoji: '🛵' },
  livree:         { label: 'Livrée',         couleur: 'bg-green-100 text-green-700',  emoji: '✅' },
  annulee:        { label: 'Annulée',        couleur: 'bg-red-100 text-red-700',      emoji: '❌' },
  en_attente:     { label: 'En attente',     couleur: 'bg-yellow-100 text-yellow-700',emoji: '⏳' },
};

const CommandesResto = () => {
  const [commandes,  setCommandes]  = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre,     setFiltre]     = useState('');
  const [action,     setAction]     = useState(null);

  useEffect(() => {
    chargerCommandes();
  }, []);

  const chargerCommandes = async () => {
    try {
      const res = await commandeService.commandesRestaurant();
      setCommandes(res.data.commandes);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const changerStatut = async (id, statut) => {
    setAction(id);
    try {
      await commandeService.changerStatut(id, statut);
      chargerCommandes();
    } catch (err) {
      console.error(err);
    } finally {
      setAction(null);
    }
  };

  const commandesFiltrees = filtre
    ? commandes.filter(c => c.statut === filtre)
    : commandes;

  if (chargement) return <Loader texte="Chargement des commandes..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Toutes les commandes
      </h1>

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFiltre('')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                      ${!filtre
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-gray-600 border-gray-200'
                      }`}
        >
          Toutes ({commandes.length})
        </button>
        {Object.entries(statutsConfig).map(([val, cfg]) => {
          const count = commandes.filter(c => c.statut === val).length;
          if (count === 0) return null;
          return (
            <button
              key={val}
              onClick={() => setFiltre(val)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                          ${filtre === val
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-600 border-gray-200'
                          }`}
            >
              {cfg.emoji} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Liste commandes */}
      <div className="space-y-4">
        {commandesFiltrees.length === 0 ? (
          <div className="carte p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">Aucune commande dans cette catégorie</p>
          </div>
        ) : (
          commandesFiltrees.map(commande => {
            const statut = statutsConfig[commande.statut] || statutsConfig.en_attente;
            return (
              <div key={commande.id} className="carte p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-900">
                        {commande.client?.nom}
                      </span>
                      <span className={`badge-statut ${statut.couleur}`}>
                        {statut.emoji} {statut.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {formatDate(commande.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600 text-lg">
                      {formatPrix(commande.montantTotal)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {commande.modePaiement === 'en_ligne' ? '💳 Payé' : '💵 Cash'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                  {commande.lignes?.map(l => (
                    <div key={l.id} className="flex justify-between text-gray-600 py-0.5">
                      <span>{l.quantite}× {l.plat?.nom}</span>
                      <span>{formatPrix(l.sousTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {commande.statut === 'confirmee' && (
                    <Button
                      variante="primaire" taille="sm"
                      chargement={action === commande.id}
                      onClick={() => changerStatut(commande.id, 'en_preparation')}
                    >
                      🍳 Commencer
                    </Button>
                  )}
                  {commande.statut === 'en_preparation' && (
                    <Button
                      variante="vert" taille="sm"
                      chargement={action === commande.id}
                      onClick={() => changerStatut(commande.id, 'en_livraison')}
                    >
                      🛵 Prête
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommandesResto;