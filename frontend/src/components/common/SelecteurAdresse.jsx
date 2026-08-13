import { useState } from 'react';
import { geocodingService } from '../../services/geocodingService';

const SelecteurAdresse = ({ onAdresseChange }) => {
  const [position, setPosition] = useState(null);
  const [adresse, setAdresse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);

  const obtenirPositionGPS = async () => {
    setChargement(true);
    setErreur('');
    setSucces(false);

    if (!navigator.geolocation) {
      setErreur('La géolocalisation n\'est pas supportée par votre appareil.');
      setChargement(false);
      return;
    }

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
          }
        );
      });

      const newPosition = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      setPosition(newPosition);

      // Obtenir l'adresse à partir des coordonnées
      try {
        const adresseData = await geocodingService.reverseGeocoding(newPosition.lat, newPosition.lng);
        setAdresse(adresseData.adresse);
        
        if (onAdresseChange) {
          onAdresseChange({
            adresse: adresseData.adresse,
            latitude: newPosition.lat,
            longitude: newPosition.lng,
            composants: adresseData.composants
          });
        }
        
        setSucces(true);
      } catch (err) {
        // Si le géocodage échoue, on utilise quand même les coordonnées
        console.warn('Géocodage inverse échoué, utilisation des coordonnées brutes');
        if (onAdresseChange) {
          onAdresseChange({
            adresse: `Position GPS: ${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`,
            latitude: newPosition.lat,
            longitude: newPosition.lng,
            composants: null
          });
        }
        setSucces(true);
      }
    } catch (err) {
      if (err.code === 1) {
        setErreur('Veuillez autoriser la géolocalisation pour continuer.');
      } else {
        const messages = {
          2: 'Impossible de déterminer votre position. Vérifiez que votre GPS est activé.',
          3: 'Délai dépassé. Veuillez réessayer.',
        };
        setErreur(messages[err.code] || 'Erreur lors de la localisation.');
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Gros bouton GPS */}
      <button
        onClick={obtenirPositionGPS}
        disabled={chargement}
        className={`w-full py-6 rounded-2xl border-2 transition-all
                   flex flex-col items-center justify-center gap-3
                   ${succes 
                     ? 'bg-green-50 border-green-500 text-green-700' 
                     : 'bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100'
                   } ${chargement ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {chargement ? (
          <>
            <i className="ti ti-loader animate-spin text-4xl" />
            <span className="font-semibold text-lg">Localisation en cours...</span>
          </>
        ) : succes ? (
          <>
            <i className="ti ti-map-pin-checked text-4xl" />
            <span className="font-semibold text-lg">Position capturée !</span>
          </>
        ) : (
          <>
            <i className="ti ti-crosshair text-4xl" />
            <span className="font-semibold text-lg">Obtenir ma position GPS</span>
            <span className="text-sm opacity-80">Cliquez pour localiser votre position exacte</span>
          </>
        )}
      </button>

      {/* Message d'erreur */}
      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
          <i className="ti ti-alert-circle text-xl mb-2" />
          <p className="font-medium">{erreur}</p>
          <button
            onClick={obtenirPositionGPS}
            className="mt-3 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Message de succès avec adresse */}
      {succes && adresse && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <i className="ti ti-map-pin text-green-600 text-xl mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 text-sm">Adresse détectée :</p>
              <p className="text-green-700 text-sm mt-1">{adresse}</p>
              {position && (
                <p className="text-green-600 text-xs mt-2 font-mono">
                  📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions initiales */}
      {!succes && !erreur && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 text-sm">
            <i className="ti ti-info-circle mr-1" />
            Ce bouton utilise votre GPS pour trouver votre position exacte.
            Le livreur utilisera cette position pour vous livrer.
          </p>
        </div>
      )}
    </div>
  );
};

export default SelecteurAdresse;