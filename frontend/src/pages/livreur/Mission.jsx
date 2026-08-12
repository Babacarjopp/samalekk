import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { livraisonService } from '../../services/livraisonService';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import CarteGPS from '../../components/livreur/CarteGPS';

const etapesStatut = {
  acceptee:  { label: 'Mission acceptée',              num: 1 },
  recuperee: { label: 'Commande récupérée au restaurant', num: 2 },
  livree:    { label: 'Livraison confirmée',           num: 3 },
};

const Mission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const { connecte, emettre, ecouter } = useSocket();

  const [livraison,   setLivraison]   = useState(null);
  const [chargement,  setChargement]  = useState(true);
  const [envoi,       setEnvoi]       = useState(false);
  const [position,    setPosition]    = useState(null);
  const [positionClient, setPositionClient] = useState(null);
  const watchRef = useRef(null);

  useEffect(() => {
    chargerLivraison();
    demarrerGPS();

    // Rejoindre la salle de livraison pour recevoir les mises à jour du client
    if (connecte) {
      emettre('livreur:suivre', id);
    }

    // Écouter les mises à jour de position GPS du client
    const desecouterClient = ecouter('client:position:update', (data) => {
      if (data.livraisonId === id) {
        setPositionClient({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      desecouterClient();
    };
  }, [id, connecte, emettre, ecouter]);

  useEffect(() => {
    if (!connecte || !utilisateur?.id) return;
    emettre('livreur:connecte', utilisateur.id);
  }, [connecte, utilisateur?.id, emettre]);

  const chargerLivraison = async () => {
    try {
      const res = await livraisonService.missionLivreur(id);
      setLivraison(res.data.livraison);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  // Démarrer le suivi GPS et envoyer la position toutes les 5 secondes
  const demarrerGPS = () => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition({ lat, lng });
        try {
          await livraisonService.mettreAJourPosition({ lat, lng, livraisonId: id });
          emettre('livreur:position', {
            livraisonId: id,
            lat,
            lng,
            livreurId: utilisateur?.id,
          });
        } catch (err) {
          console.error('Erreur position GPS :', err);
        }
      },
      (err) => console.warn('GPS indisponible :', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const confirmerRecuperation = async () => {
    setEnvoi(true);
    try {
      await livraisonService.confirmerRecup(id);
      chargerLivraison();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur.');
    } finally {
      setEnvoi(false);
    }
  };

  const confirmerLivraison = async () => {
    setEnvoi(true);
    try {
      await livraisonService.confirmerLivraison(id);
      setTimeout(() => navigate('/livreur/dashboard'), 2000);
      chargerLivraison();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur.');
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <Loader texte="Chargement de la mission..." />;
  if (!livraison) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Mission introuvable.</p>
    </div>
  );

  const commande = livraison.commande;
  const etape    = etapesStatut[livraison.statut] || etapesStatut.acceptee;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* En-tête mission */}
      <div className="carte p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center
                          justify-center text-2xl">
            <i className="ti ti-truck-delivery" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mission en cours</h1>
            <p className="text-gray-400 text-sm">Étape {etape.num}/3 — {etape.label}</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="flex gap-1 mb-2">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`h-2 flex-1 rounded-full transition-colors duration-500
                          ${n <= etape.num ? 'bg-orange-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Acceptée</span>
          <span>Récupérée</span>
          <span>Livrée</span>
        </div>
      </div>

      {/* GPS */}
      {position && (
        <div className="carte p-4 mb-6 bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-green-700 font-semibold text-sm">GPS actif</p>
              <p className="text-green-600 text-xs">
                Position transmise au client en temps réel
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Carte avec position du livreur, restaurant et client */}
      <div className="mb-6">
        <CarteGPS
          positionLivreur={position ? {
            lat: position.lat,
            lng: position.lng
          } : null}
          positionRestaurant={
            commande?.restaurant?.latitude && commande?.restaurant?.longitude
              ? {
                  lat: parseFloat(commande.restaurant.latitude),
                  lng: parseFloat(commande.restaurant.longitude)
                }
              : null
          }
          positionClient={positionClient || (commande?.latitudeLivraison && commande?.longitudeLivraison ? {
            lat: parseFloat(commande.latitudeLivraison),
            lng: parseFloat(commande.longitudeLivraison)
          } : null)}
          nomLivreur={utilisateur?.nom || 'Vous'}
          nomRestaurant={commande?.restaurant?.nom || 'Restaurant'}
          hauteur="300px"
        />
        <p className="text-gray-400 text-xs mt-2 text-center">
          🔴 Vous — 🟠 Restaurant — 🟢 Client {positionClient && '(en direct)'}
        </p>
      </div>

      {/* Infos restaurant */}
      <div className="carte p-5 mb-4">
        <h3 className="font-bold text-gray-700 text-xs uppercase mb-3 flex items-center gap-2">
          <i className="ti ti-map-pin" /> Récupérer chez
        </h3>
        <p className="font-bold text-gray-900 text-lg mb-1">
          {commande?.restaurant?.nom}
        </p>
        <p className="text-gray-500 text-sm">
          {commande?.restaurant?.adresse}
        </p>
        {commande?.restaurant?.telephone && (
          <a
            href={`tel:${commande.restaurant.telephone}`}
            className="inline-flex items-center gap-2 mt-3 text-orange-600
                       font-semibold text-sm hover:underline"
          >
            <i className="ti ti-phone" /> Appeler le restaurant
          </a>
        )}
        {/* Bouton Google Maps pour le restaurant */}
        {commande?.restaurant?.latitude && commande?.restaurant?.longitude && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${commande.restaurant.latitude},${commande.restaurant.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 bg-blue-600 text-white
                       px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700
                       transition-colors"
          >
            <i className="ti ti-map-2" /> Naviguer sur Google Maps
          </a>
        )}
      </div>

      {/* Infos client */}
      <div className="carte p-5 mb-6">
        <h3 className="font-bold text-gray-700 text-xs uppercase mb-3 flex items-center gap-2">
          <i className="ti ti-home" /> Livrer chez
        </h3>
        <p className="font-bold text-gray-900 text-lg mb-1">
          {commande?.client?.nom}
        </p>
        <p className="text-gray-500 text-sm mb-3">
          {commande?.adresseLivraison}
        </p>
        {commande?.client?.telephone && (
          <a
            href={`tel:${commande.client.telephone}`}
            className="inline-flex items-center gap-2 text-orange-600
                       font-semibold text-sm hover:underline"
          >
            <i className="ti ti-phone" /> Appeler le client
          </a>
        )}
        {/* Bouton Google Maps */}
        {(positionClient || (commande?.client?.latitude && commande?.client?.longitude)) && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${positionClient?.lat || commande?.client?.latitude},${positionClient?.lng || commande?.client?.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 bg-blue-600 text-white
                       px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700
                       transition-colors"
          >
            <i className="ti ti-map-2" /> Naviguer sur Google Maps
          </a>
        )}
      </div>

      {/* Actions selon l'étape */}
      {livraison.statut === 'acceptee' && (
        <Button
          variante="primaire"
          chargement={envoi}
          onClick={confirmerRecuperation}
          className="w-full py-4 text-base"
        >
          <i className="ti ti-package text-base" /> J'ai récupéré la commande
        </Button>
      )}

      {livraison.statut === 'recuperee' && (
        <Button
          variante="vert"
          chargement={envoi}
          onClick={confirmerLivraison}
          className="w-full py-4 text-base"
        >
          <i className="ti ti-check text-base" /> Confirmer la livraison
        </Button>
      )}

      {livraison.statut === 'livree' && (
        <div className="carte p-8 text-center bg-green-50 border border-green-200">
          <div className="text-6xl mb-4">
            <i className="ti ti-badge-check" />
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-2">
            Mission accomplie !
          </h3>
          <p className="text-green-600">
            Vous allez être redirigé vers votre tableau de bord...
          </p>
        </div>
      )}
    </div>
  );
};

export default Mission;