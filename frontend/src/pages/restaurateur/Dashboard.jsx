import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import { commandeService } from '../../services/commandeService';
import { formatPrix } from '../../utils/formatPrix';
import { tempsEcoule } from '../../utils/formatDate';
import Loader from '../../components/common/Loader';

const statutsConfig = {
  confirmee:      { label: 'Nouvelle',       couleur: 'bg-blue-100 text-blue-700',    emoji: '🆕' },
  en_preparation: { label: 'En préparation', couleur: 'bg-orange-100 text-orange-700',emoji: '🍳' },
  en_livraison:   { label: 'En livraison',   couleur: 'bg-purple-100 text-purple-700',emoji: '🛵' },
  livree:         { label: 'Livrée',         couleur: 'bg-green-100 text-green-700',  emoji: '✅' },
  annulee:        { label: 'Annulée',        couleur: 'bg-red-100 text-red-700',      emoji: '❌' },
};

const DashboardResto = () => {
  const navigate = useNavigate();
  const [restaurant,  setRestaurant]  = useState(null);
  const [commandes,   setCommandes]   = useState([]);
  const [chargement,  setChargement]  = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [restoRes, cmdRes] = await Promise.all([
        restaurantService.monRestaurant(),
        commandeService.commandesRestaurant()
      ]);
      setRestaurant(restoRes.data.restaurant);
      setCommandes(cmdRes.data.commandes);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/restaurant/onboarding', { replace: true });
        return;
      }
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const changerStatut = async (commandeId, nouveauStatut) => {
    try {
      await commandeService.changerStatut(commandeId, nouveauStatut);
      chargerDonnees();
    } catch (err) {
      console.error(err);
    }
  };

  if (chargement) return <Loader texte="Chargement du tableau de bord..." />;

  // Statistiques rapides
  const commandesAujourdhui = commandes.filter(c => {
    const aujourdhui = new Date().toDateString();
    return new Date(c.createdAt).toDateString() === aujourdhui;
  });

  const revenuTotal = commandes
    .filter(c => c.statut === 'livree')
    .reduce((t, c) => t + c.montantTotal, 0);

  const commandesActives = commandes.filter(c =>
    ['confirmee', 'en_preparation', 'en_livraison'].includes(c.statut)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant?.nom || 'Mon restaurant'}
          </h1>
          <p className="text-gray-500 mt-1">
            {restaurant?.statut === 'valide'
              ? '🟢 Restaurant actif sur la plateforme'
              : '🟡 En attente de validation par l\'administrateur'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/restaurant/menu" className="btn-secondaire-light btn-sm text-sm">
            🍽️ Gérer le menu
          </Link>
          <Link to="/restaurant/commandes" className="btn-primaire btn-sm text-sm">
            📋 Toutes les commandes
          </Link>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Commandes aujourd\'hui', val: commandesAujourdhui.length, emoji: '📦', couleur: 'bg-blue-50 text-blue-700' },
          { label: 'Commandes actives',      val: commandesActives.length,    emoji: '🔥', couleur: 'bg-orange-50 text-orange-700' },
          { label: 'Plats au menu',          val: restaurant?.plats?.length || 0, emoji: '🍽️', couleur: 'bg-green-50 text-green-700' },
          { label: 'Revenu total',           val: formatPrix(revenuTotal),    emoji: '💰', couleur: 'bg-purple-50 text-purple-700' },
        ].map(stat => (
          <div key={stat.label} className={`carte p-5 ${stat.couleur}`}>
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <div className="text-2xl font-bold">{stat.val}</div>
            <div className="text-sm opacity-80 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Commandes actives */}
      <div className="carte p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Commandes en cours
          {commandesActives.length > 0 && (
            <span className="ml-2 bg-orange-100 text-orange-700 text-sm
                             font-bold px-2 py-0.5 rounded-full">
              {commandesActives.length}
            </span>
          )}
        </h2>

        {commandesActives.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">😴</div>
            <p className="text-gray-500">Aucune commande en cours pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commandesActives.map(commande => {
              const statut = statutsConfig[commande.statut];
              return (
                <div key={commande.id}
                     className="border border-gray-100 rounded-2xl p-4 hover:border-orange-200
                                transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-gray-900">
                          {commande.client?.nom}
                        </span>
                        <span className={`badge-statut ${statut?.couleur}`}>
                          {statut?.emoji} {statut?.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        📞 {commande.client?.telephone} · {tempsEcoule(commande.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        {formatPrix(commande.montantTotal)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {commande.modePaiement === 'en_ligne' ? '💳 En ligne' : '💵 Cash'}
                      </div>
                    </div>
                  </div>

                  {/* Lignes commande */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    {commande.lignes?.map(l => (
                      <div key={l.id} className="flex justify-between text-gray-600 py-0.5">
                        <span>{l.quantite}× {l.plat?.nom}</span>
                        <span className="font-medium">{formatPrix(l.sousTotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {commande.statut === 'confirmee' && (
                      <button
                        onClick={() => changerStatut(commande.id, 'en_preparation')}
                        className="btn-primaire text-xs px-4 py-2"
                      >
                        🍳 Commencer la préparation
                      </button>
                    )}
                    {commande.statut === 'en_preparation' && (
                      <button
                        onClick={() => changerStatut(commande.id, 'en_livraison')}
                        className="btn-vert text-xs px-4 py-2"
                      >
                        🛵 Prête pour livraison
                      </button>
                    )}
                    {commande.statut === 'en_livraison' && (
                      <span className="text-purple-600 text-sm font-medium
                                       flex items-center gap-1">
                        🛵 En cours de livraison...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardResto;