import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { livraisonService } from '../../services/livraisonService';
import { formatPrix } from '../../utils/formatPrix';
import { tempsEcoule } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const DashboardLivreur = () => {
  const navigate = useNavigate();
  const { utilisateur, disponible, setDisponible } = useAuth();
  const [missions, setMissions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [acceptEnCours, setAcceptEnCours] = useState(null);

  useEffect(() => {
    chargerMissions();
    // Rafraîchir les missions toutes les 30 secondes
    const interval = setInterval(chargerMissions, 30000);
    return () => clearInterval(interval);
  }, [disponible]);

  const chargerMissions = async () => {
    try {
      const missRes = await livraisonService.missionsDisponibles();
      setMissions(missRes.data.livraisons);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const toggleDisponibilite = async () => {
    try {
      await setDisponible(!disponible);
    } catch (err) {
      console.error(err);
    }
  };

  const accepterMission = async (livraisonId) => {
    setAcceptEnCours(livraisonId);
    try {
      await livraisonService.accepterMission(livraisonId);
      navigate(`/livreur/mission/${livraisonId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'acceptation.');
      setAcceptEnCours(null);
    }
  };

  if (chargement) return <Loader texte="Chargement des missions..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* En-tête livreur */}
      <div className="carte p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon espace livreur</h1>
            <p className="text-gray-500 mt-1">
              Bienvenue, {utilisateur?.nom}
            </p>
          </div>

          {/* Toggle disponibilité */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleDisponibilite}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300
                          ${disponible ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow
                               transition-transform duration-300
                               ${disponible ? 'translate-x-7' : 'translate-x-0.5'}`}
              />
            </button>
            <span className={`text-xs font-semibold inline-flex items-center gap-2
                              ${disponible ? 'text-green-600' : 'text-gray-400'}`}>
              <i className={disponible ? 'ti ti-circle-check' : 'ti ti-circle-x'} />
              {disponible ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
        </div>
      </div>

      {/* Missions disponibles */}
      <div className="carte p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Missions disponibles
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Actualisé automatiquement toutes les 30 secondes
        </p>

        {!disponible ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">
              <i className="ti ti-mood-sad" />
            </div>
            <p className="text-gray-600 font-medium mb-2">
              Vous êtes indisponible
            </p>
            <p className="text-gray-400 text-sm">
              Activez votre disponibilité pour voir les missions
            </p>
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">
              <i className="ti ti-truck-delivery" />
            </div>
            <p className="text-gray-600 font-medium mb-2">
              Aucune mission disponible
            </p>
            <p className="text-gray-400 text-sm">
              Les nouvelles commandes apparaîtront ici automatiquement
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map(mission => (
              <div key={mission.id}
                   className="border border-gray-100 rounded-2xl p-4
                              hover:border-orange-200 transition-colors animer">

                {/* Restaurant → Client */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center
                                  justify-center text-xl shrink-0">
                    <i className="ti ti-restaurant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {mission.commande?.restaurant?.nom}
                    </p>
                    <p className="text-gray-400 text-sm truncate flex items-center gap-2">
                      <i className="ti ti-map-pin text-sm" /> {mission.commande?.restaurant?.adresse}
                    </p>
                  </div>
                  <div className="text-orange-600 text-lg font-bold shrink-0">
                    <i className="ti ti-truck-delivery" />
                  </div>
                </div>

                {/* Infos client */}
                <div className="bg-orange-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ti ti-user text-orange-600" />
                    <span className="font-medium text-gray-800">
                      {mission.commande?.client?.nom}
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">
                      {mission.commande?.client?.telephone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <i className="ti ti-map-pin text-orange-600" />
                    <span className="text-gray-600">
                      {mission.commande?.adresseLivraison}
                    </span>
                  </div>
                </div>
                {/* Montant et temps */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-gray-400 text-xs">Valeur commande</span>
                    <div className="font-bold text-gray-900">
                      {formatPrix(mission.commande?.montantTotal)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-xs">Reçue</span>
                    <div className="text-gray-600 text-sm">
                      {tempsEcoule(mission.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-xs">Paiement</span>
                    <div className="text-gray-600 text-sm flex items-center justify-end gap-2">
                      <i className="ti ti-credit-card text-sm" />
                      {mission.commande?.modePaiement === 'en_ligne' ? 'En ligne' : 'Cash'}
                    </div>
                  </div>
                </div>

                {/* Bouton accepter */}
                <Button
                  variante="primaire"
                  chargement={acceptEnCours === mission.id}
                  onClick={() => accepterMission(mission.id)}
                  className="w-full"
                >
                  <i className="ti ti-truck-delivery text-base" /> Accepter cette mission
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLivreur;