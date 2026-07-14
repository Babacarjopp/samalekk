import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatPrix } from '../../utils/formatPrix';
import { tempsEcoule } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const DashboardAdmin = () => {
  const [donnees,    setDonnees]    = useState(null);
  const [chargement, setChargement] = useState(true);
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const res = await adminService.tableauDeBord();
      setDonnees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const validerRestaurant = async (id) => {
    setValidation(id);
    try {
      await adminService.validerRestaurant(id);
      chargerDonnees();
    } catch (err) {
      console.error(err);
    } finally {
      setValidation(null);
    }
  };

  const refuserRestaurant = async (id) => {
    const motif = window.prompt('Motif du refus (optionnel) :');
    try {
      await adminService.refuserRestaurant(id, motif);
      chargerDonnees();
    } catch (err) {
      console.error(err);
    }
  };

  if (chargement) return <Loader texte="Chargement du tableau de bord..." />;

  const { statistiques, dernieresCommandes } = donnees || {};
  const stats = statistiques || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord Admin
          </h1>
          <p className="text-gray-500 mt-1">
            Vue globale de la plateforme Sama Lekk
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/utilisateurs" className="btn-secondaire-light btn-sm text-sm">
            <i className="ti ti-users" /> Utilisateurs
          </Link>
          <Link to="/admin/statistiques" className="btn-primaire btn-sm text-sm">
            <i className="ti ti-chart-bar" /> Statistiques
          </Link>
        </div>
      </div>

      {/* Cartes KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clients',        val: stats.utilisateurs?.clients || 0,       icone: 'ti ti-user', couleur: 'bg-blue-50 text-blue-700' },
          { label: 'Restaurateurs',  val: stats.utilisateurs?.restaurateurs || 0, icone: 'ti ti-bowl-chopsticks', couleur: 'bg-orange-50 text-orange-700' },
          { label: 'Livreurs',       val: stats.utilisateurs?.livreurs || 0,      icone: 'ti ti-truck-delivery', couleur: 'bg-purple-50 text-purple-700' },
          { label: 'Restaurants',    val: stats.restaurants?.valides || 0,        icone: 'ti ti-store', couleur: 'bg-green-50 text-green-700' },
        ].map(kpi => (
          <div key={kpi.label} className={`carte p-5 ${kpi.couleur}`}>
            <div className="text-3xl mb-2"><i className={`${kpi.icone} text-3xl`} /></div>
            <div className="text-3xl font-bold">{kpi.val}</div>
            <div className="text-sm opacity-80 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* KPIs commandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Commandes aujourd\'hui', val: stats.commandes?.aujourdhui || 0, icone: 'ti ti-package', couleur: 'bg-amber-50 text-amber-700' },
          { label: 'Total commandes',        val: stats.commandes?.total || 0,      icone: 'ti ti-chart-bar', couleur: 'bg-gray-50 text-gray-700' },
          { label: 'Revenu total',           val: formatPrix(stats.revenuTotal || 0), icone: 'ti ti-wallet', couleur: 'bg-emerald-50 text-emerald-700' },
        ].map(kpi => (
          <div key={kpi.label} className={`carte p-5 ${kpi.couleur}`}>
            <div className="text-3xl mb-2"><i className={`${kpi.icone} text-3xl`} /></div>
            <div className="text-2xl font-bold">{kpi.val}</div>
            <div className="text-sm opacity-80 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Restaurants en attente */}
        <RestaurantsEnAttente
          onValider={validerRestaurant}
          onRefuser={refuserRestaurant}
          validation={validation}
        />

        {/* Dernières commandes */}
        <div className="carte p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Dernières commandes
          </h2>
          {(dernieresCommandes || []).length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune commande</p>
          ) : (
            <div className="space-y-3">
              {(dernieresCommandes || []).map(cmd => (
                <div key={cmd.id}
                     className="flex items-center justify-between py-3
                                border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {cmd.client?.nom}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {cmd.restaurant?.nom} · {tempsEcoule(cmd.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 text-sm">
                      {formatPrix(cmd.montantTotal)}
                    </p>
                    <p className="text-gray-400 text-xs capitalize">
                      {cmd.statut?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sous-composant restaurants en attente
const RestaurantsEnAttente = ({ onValider, onRefuser, validation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [chargement,  setChargement]  = useState(true);

  useEffect(() => {
    adminService.restaurantsEnAttente()
      .then(res => setRestaurants(res.data.restaurants))
      .catch(console.error)
      .finally(() => setChargement(false));
  }, [validation]);

  return (
    <div className="carte p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Restaurants en attente
        {restaurants.length > 0 && (
          <span className="ml-2 bg-amber-100 text-amber-700 text-sm
                           font-bold px-2 py-0.5 rounded-full">
            {restaurants.length}
          </span>
        )}
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        À valider avant d'apparaître sur la plateforme
      </p>

      {chargement ? (
        <Loader texte="Chargement..." />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3"><i className="ti ti-check text-3xl" /></div>
          <p className="text-gray-400 text-sm">
            Aucun restaurant en attente
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {restaurants.map(resto => (
            <div key={resto.id}
                 className="border border-gray-100 rounded-2xl p-4
                            hover:border-orange-100 transition-colors">
              <div className="mb-3">
                <h3 className="font-bold text-gray-900">{resto.nom}</h3>
                <p className="text-gray-500 text-sm">{resto.categorie} · {resto.adresse}</p>
                <p className="text-gray-400 text-xs mt-1 flex items-center gap-2">
                  <i className="ti ti-user text-sm" /> {resto.restaurateur?.nom} · <i className="ti ti-phone text-sm" /> {resto.restaurateur?.telephone}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variante="vert"
                  taille="sm"
                  chargement={validation === resto.id}
                  onClick={() => onValider(resto.id)}
                  className="flex-1"
                >
                  ✅ Valider
                </Button>
                <Button
                  variante="danger"
                  taille="sm"
                  onClick={() => onRefuser(resto.id)}
                  className="flex-1"
                >
                  ❌ Refuser
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;