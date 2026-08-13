import { useState, useEffect } from 'react';
import { geocodingService } from '../../services/geocodingService';

const SelecteurAdresse = ({ onAdresseChange }) => {
  const [position, setPosition] = useState(null);
  const [adresse, setAdresse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [estMobile, setEstMobile] = useState(false);

  // Détecter si c'est un appareil mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setEstMobile(isMobile);
  }, []);

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
            timeout: 20000, // Augmenté pour donner plus de temps
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
        // Permission refusée - donner des instructions spécifiques
        setErreur('permission_refusee');
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

  const getInstructionsMobile = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.match(/Android/i)) {
      return {
        title: 'Activer la géolocalisation sur Android',
        steps: [
          'Allez dans Paramètres de votre téléphone',
          'Cherchez "Applications" ou "Apps"',
          'Trouvez votre navigateur (Chrome, Firefox, etc.)',
          'Tapez sur "Permissions"',
          'Activez "Localisation" ou "Position"',
          'Revenez ici et cliquez sur "Réessayer"'
        ]
      };
    } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
      return {
        title: 'Activer la géolocalisation sur iPhone/iPad',
        steps: [
          'Allez dans Réglages de votre iPhone',
          'Cherchez votre navigateur (Safari, Chrome, etc.)',
          'Tapez sur "Localisation"',
          'Sélectionnez "Lors de l\'utilisation de l\'app"',
          'Revenez ici et cliquez sur "Réessayer"'
        ]
      };
    }
    
    return {
      title: 'Activer la géolocalisation',
      steps: [
        'Allez dans les paramètres de votre navigateur',
        'Cherchez les paramètres de confidentialité ou de sécurité',
        'Activez la géolocalisation',
        'Revenez ici et cliquez sur "Réessayer"'
      ]
    };
  };

  const instructions = getInstructionsMobile();

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

      {/* Message d'erreur - Permission refusée */}
      {erreur === 'permission_refusee' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <i className="ti ti-lock-access text-2xl mt-0.5" />
            <div>
              <p className="font-bold">Permission de géolocalisation refusée</p>
              <p className="text-sm mt-1">Pour utiliser cette fonction, vous devez autoriser l'accès à votre position.</p>
            </div>
          </div>
          
          {/* Instructions détaillées */}
          <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
            <p className="font-semibold text-sm mb-2">{instructions.title}</p>
            <ol className="text-sm space-y-1">
              {instructions.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Bouton réessayer */}
          <button
            onClick={obtenirPositionGPS}
            className="w-full mt-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Réessayer après avoir activé la géolocalisation
          </button>
        </div>
      )}

      {/* Message d'erreur - Autre erreur */}
      {erreur && erreur !== 'permission_refusee' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
          <i className="ti ti-alert-circle text-xl mb-2" />
          <p className="font-medium">{erreur}</p>
          <button
            onClick={obtenirPositionGPS}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
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
          {estMobile && (
            <p className="text-blue-600 text-xs mt-2">
              🔒 Vous devrez autoriser l'accès à votre position quand demandé.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SelecteurAdresse;