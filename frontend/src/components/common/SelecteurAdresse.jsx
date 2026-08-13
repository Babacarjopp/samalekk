import { useState } from 'react';
import SelecteurPosition from './SelecteurPosition';

// Détecte le navigateur pour donner des instructions de réactivation précises
const detecterNavigateur = () => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios-safari';
  if (/Android/.test(ua) && /Chrome/.test(ua)) return 'android-chrome';
  return 'autre';
};

const INSTRUCTIONS_REACTIVATION = {
  'ios-safari': [
    'Ouvrez Réglages sur votre téléphone',
    'Descendez jusqu\'à Safari',
    'Appuyez sur Position',
    'Choisissez « Autoriser »',
    'Revenez ici et appuyez à nouveau sur le bouton',
  ],
  'android-chrome': [
    'Appuyez sur le cadenas 🔒 à côté de l\'adresse du site',
    'Appuyez sur Autorisations',
    'Activez Position',
    'Revenez ici et appuyez à nouveau sur le bouton',
  ],
  'autre': [
    'Ouvrez les réglages de votre navigateur',
    'Cherchez les autorisations du site',
    'Autorisez la localisation',
    'Revenez ici et appuyez à nouveau sur le bouton',
  ],
};

const InstructionsReactivation = () => {
  const etapes = INSTRUCTIONS_REACTIVATION[detecterNavigateur()];
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-3">
      <p className="font-semibold text-orange-900 mb-2">Comment réactiver la position :</p>
      <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
        {etapes.map((etape, i) => (
          <li key={i}>{etape}</li>
        ))}
      </ol>
    </div>
  );
};

const SelecteurAdresse = ({ onAdresseChange }) => {
  // Flux GPS principal
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState('');
  const [tentatives, setTentatives] = useState(0);
  const [adresseFinale, setAdresseFinale] = useState('');

  // Filet de sécurité (toujours accessible, pas seulement après échec)
  const [modeManuel, setModeManuel] = useState(false);
  const [positionManuelle, setPositionManuelle] = useState(null);
  const [adresseManuelle, setAdresseManuelle] = useState('');

  const obtenirPositionGPS = () => {
    setChargement(true);
    setErreur('');

    if (!navigator.geolocation) {
      setErreur('La géolocalisation n\'est pas supportée par cet appareil.');
      setChargement(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setChargement(false);
        setSucces(true);
        setErreur('');
        setTentatives(0);
        const adresse = `Position GPS: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        setAdresseFinale(adresse);
        onAdresseChange?.({
          adresse,
          latitude: position.lat,
          longitude: position.lng,
        });
      },
      (err) => {
        setChargement(false);
        setTentatives((t) => t + 1);
        setErreur(
          err.code === 1
            ? 'La géolocalisation a été refusée.'
            : 'Impossible de vous localiser. Vérifiez que le GPS est activé.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const confirmerAdresseManuelle = () => {
    if (!positionManuelle && !adresseManuelle.trim()) {
      setErreur('Indiquez un point sur la carte ou une description de votre adresse.');
      return;
    }

    const adresse = adresseManuelle.trim() || 'Position indiquée sur la carte';
    setAdresseFinale(adresse);
    setSucces(true);
    setErreur('');
    onAdresseChange?.({
      adresse,
      latitude: positionManuelle?.lat ?? null,
      longitude: positionManuelle?.lng ?? null,
    });
  };

  if (succes) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <i className="ti ti-map-pin text-green-600 text-xl mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-green-900 text-sm">Adresse confirmée :</p>
            <p className="text-green-700 text-sm mt-1">{adresseFinale}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setSucces(false);
            setModeManuel(false);
            setErreur('');
            setTentatives(0);
          }}
          className="mt-3 text-sm text-green-700 underline"
        >
          Modifier
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!modeManuel ? (
        <>
          {/* Bouton GPS principal */}
          <button
            onClick={obtenirPositionGPS}
            disabled={chargement}
            className={`w-full py-6 rounded-2xl border-2 transition-all
                       flex flex-col items-center justify-center gap-2
                       bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100
                       ${chargement ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {chargement ? (
              <>
                <i className="ti ti-loader animate-spin text-4xl" />
                <span className="font-semibold text-lg">Localisation en cours...</span>
              </>
            ) : (
              <>
                <i className="ti ti-crosshair text-4xl" />
                <span className="font-semibold text-lg">Obtenir ma position GPS</span>
                <span className="text-sm opacity-80">Cliquez pour localiser votre position exacte</span>
              </>
            )}
          </button>

          {/* Erreur + réessayer */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="ti ti-alert-circle text-xl mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{erreur}</p>
                  <button onClick={obtenirPositionGPS} className="text-sm underline mt-2">
                    Réessayer
                  </button>
                  {tentatives >= 2 && <InstructionsReactivation />}
                </div>
              </div>
            </div>
          )}

          {/* Filet de sécurité — toujours visible, pas seulement après échec */}
          <button
            onClick={() => setModeManuel(true)}
            className="w-full py-3 text-center text-sm text-gray-600 underline"
          >
            Ou indiquer mon adresse manuellement
          </button>
        </>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
            <i className="ti ti-edit" />
            Indiquez votre position
          </h3>

          <SelecteurPosition
            onPositionChange={(pos) => setPositionManuelle(pos)}
            hauteur="280px"
            allowClick={true}
          />

          <textarea
            value={adresseManuelle}
            onChange={(e) => setAdresseManuelle(e.target.value)}
            placeholder="Ex : Quartier Darou Khoudoss, près de la grande mosquée"
            rows={2}
            className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl mt-3
                       focus:border-orange-500 focus:ring-2 focus:ring-orange-200
                       transition-all outline-none resize-none"
          />

          {erreur && <p className="text-red-600 text-sm mt-2">{erreur}</p>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={confirmerAdresseManuelle}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              Confirmer l'adresse
            </button>
            <button
              onClick={() => {
                setModeManuel(false);
                setErreur('');
              }}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              Retour au GPS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelecteurAdresse;