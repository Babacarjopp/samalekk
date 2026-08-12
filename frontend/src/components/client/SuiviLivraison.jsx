import { useState, useEffect, useRef } from 'react';
import { livraisonService } from '../../services/livraisonService';
import useSocket from '../../hooks/useSocket';
import CarteGPS from '../livreur/CarteGPS';

const statutsEtapes = [
  { statut: 'en_attente', label: 'Commande confirmée',          icone: 'ti ti-check' },
  { statut: 'acceptee',   label: 'Livreur en route vers le restaurant', icone: 'ti ti-truck-delivery' },
  { statut: 'recuperee',  label: 'Commande récupérée',          icone: 'ti ti-package' },
  { statut: 'livree',     label: 'Commande livrée',             icone: 'ti ti-flag' },
];

// Composant de suivi temps réel d'une livraison (utilisé par le client)
const SuiviLivraison = ({ livraisonId, positionClient }) => {
  const [livraison,       setLivraison]       = useState(null);
  const [positionLivreur, setPositionLivreur] = useState(null);
  const [maPosition,      setMaPosition]      = useState(null);
  const { connecte, rejoindre, ecouter }      = useSocket();
  const watchRef = useRef(null);

  useEffect(() => {
    if (!livraisonId) return;

    // Charger les infos de la livraison
    livraisonService.suivreLivraison(livraisonId)
      .then(res => {
        const liv = res.data.livraison;
        setLivraison(liv);
        if (liv.latActuelle != null && liv.lngActuelle != null) {
          setPositionLivreur({ lat: liv.latActuelle, lng: liv.lngActuelle });
        }
      })
      .catch(console.error);

    if (connecte) {
      rejoindre(livraisonId);
    }

    // Écouter les mises à jour de position GPS du livreur
    const desecouter = ecouter('livreur:position:update', (data) => {
      setPositionLivreur({ lat: data.lat, lng: data.lng });
    });

    // Démarrer le suivi GPS du client et envoyer la position toutes les 5 secondes
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setMaPosition({ lat, lng });
          try {
            await livraisonService.mettreAJourPositionClient({ lat, lng, livraisonId });
          } catch (err) {
            console.error('Erreur position GPS client :', err);
          }
        },
        (err) => console.warn('GPS indisponible :', err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      desecouter();
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [livraisonId, connecte, rejoindre, ecouter]);

  if (!livraison) return null;

  const etapeActuelle = statutsEtapes.findIndex(e => e.statut === livraison.statut);

  return (
    <div className="space-y-4">

      {/* Infos livreur */}
      {livraison.livreur && (
        <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center
                          justify-center text-white font-bold text-lg shrink-0">
            {livraison.livreur.nom?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{livraison.livreur.nom}</p>
            <p className="text-gray-500 text-sm flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2">
                <i className="ti ti-truck-delivery" /> {livraison.livreur.vehicule || 'Livreur'}
              </span>
              <span className="flex items-center gap-2">
                <i className="ti ti-phone" /> {livraison.livreur.telephone}
              </span>
            </p>
          </div>
          <a
            href={`tel:${livraison.livreur.telephone}`}
            className="w-10 h-10 bg-orange-600 rounded-full flex items-center
                       justify-center text-white hover:bg-orange-700 transition-colors"
          >
            <i className="ti ti-phone" />
          </a>
        </div>
      )}

      {/* Progression */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-4 text-sm">Suivi de la livraison</h4>
        <div className="space-y-3">
          {statutsEtapes.map((etape, i) => (
            <div key={etape.statut} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                               text-sm shrink-0 transition-all duration-500
                               ${i <= etapeActuelle
                                 ? 'bg-orange-600 text-white shadow-md'
                                 : 'bg-gray-100 text-gray-400'
                               }`}>
                <i className={i <= etapeActuelle ? `${etape.icone} text-base` : 'ti ti-circle text-sm'} />
              </div>
              <span className={`text-sm transition-colors duration-300
                                ${i <= etapeActuelle
                                  ? 'text-gray-900 font-semibold'
                                  : 'text-gray-400'
                                }`}>
                {etape.label}
              </span>
              {i === etapeActuelle && (
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Carte GPS temps réel */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
          <i className="ti ti-map-pin" /> Position du livreur en temps réel
          {positionLivreur && (
            <span className="flex items-center gap-1 text-green-600 text-xs font-normal">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              En direct
            </span>
          )}
        </h4>
        <CarteGPS
          positionLivreur={positionLivreur}
          positionClient={positionClient}
          nomLivreur={livraison.livreur?.nom}
          hauteur="250px"
        />
      </div>
    </div>
  );
};

export default SuiviLivraison;