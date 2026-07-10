import { useState, useEffect } from 'react';
import { livraisonService } from '../../services/livraisonService';
import useSocket from '../../hooks/useSocket';
import CarteGPS from '../livreur/CarteGPS';

const statutsEtapes = [
  { statut: 'en_attente', label: 'Commande confirmée',          emoji: '✅' },
  { statut: 'acceptee',   label: 'Livreur en route vers le restaurant', emoji: '🛵' },
  { statut: 'recuperee',  label: 'Commande récupérée',          emoji: '📦' },
  { statut: 'livree',     label: 'Commande livrée',             emoji: '🎉' },
];

// Composant de suivi temps réel d'une livraison (utilisé par le client)
const SuiviLivraison = ({ livraisonId, positionClient }) => {
  const [livraison,       setLivraison]       = useState(null);
  const [positionLivreur, setPositionLivreur] = useState(null);
  const { connecte, rejoindre, ecouter }      = useSocket();

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

    // Écouter les mises à jour de position GPS
    const desecouter = ecouter('livreur:position:update', (data) => {
      setPositionLivreur({ lat: data.lat, lng: data.lng });
    });

    return desecouter;
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
            <p className="text-gray-500 text-sm">
              🛵 {livraison.livreur.vehicule || 'Livreur'} · 📞 {livraison.livreur.telephone}
            </p>
          </div>
          <a
            href={`tel:${livraison.livreur.telephone}`}
            className="w-10 h-10 bg-orange-600 rounded-full flex items-center
                       justify-center text-white hover:bg-orange-700 transition-colors"
          >
            📞
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
                {i <= etapeActuelle ? etape.emoji : '○'}
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
      {(positionLivreur || positionClient) && (
        <div>
          <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
            🗺️ Position du livreur en temps réel
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
      )}
    </div>
  );
};

export default SuiviLivraison;