import { useState, useEffect, useRef } from 'react';
import { geocodingService } from '../../services/geocodingService';
import SelecteurPosition from './SelecteurPosition';

const SelecteurAdresse = ({ onAdresseChange, adresseInitiale = '' }) => {
  const [recherche, setRecherche] = useState(adresseInitiale);
  const [suggestions, setSuggestions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [position, setPosition] = useState(null);
  const [adresseDetaillee, setAdresseDetaillee] = useState(null);
  const [modeCarte, setModeCarte] = useState(false);
  
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (recherche.length < 3) {
      setSuggestions([]);
      return;
    }

    setChargement(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const resultats = await geocodingService.rechercherAdresses(recherche);
        setSuggestions(resultats);
      } catch (error) {
        console.error('Erreur recherche:', error);
        setSuggestions([]);
      } finally {
        setChargement(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [recherche]);

  // Géocodage inverse quand la position change
  const handlePositionChange = async (newPosition) => {
    setPosition(newPosition);
    try {
      const adresse = await geocodingService.reverseGeocoding(newPosition.lat, newPosition.lng);
      setAdresseDetaillee(adresse);
      setRecherche(adresse.adresse);
      
      if (onAdresseChange) {
        onAdresseChange({
          adresse: adresse.adresse,
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          composants: adresse.composants
        });
      }
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setRecherche(suggestion.adresseCourte);
    setSuggestions([]);
    setPosition({ lat: suggestion.latitude, lng: suggestion.longitude });
    setModeCarte(true);
    
    if (onAdresseChange) {
      onAdresseChange({
        adresse: suggestion.adresseCourte,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        composants: suggestion.composants
      });
    }
  };

  const handleManualInput = () => {
    // Utiliser l'adresse manuelle sans coordonnées précises
    if (onAdresseChange && recherche) {
      onAdresseChange({
        adresse: recherche,
        latitude: null,
        longitude: null,
        composants: null
      });
    }
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Champ de recherche d'adresse */}
      <div className="relative">
        <div className="relative">
          <i className="ti ti-map-pin absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une adresse à Touba..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                       focus:border-orange-500 focus:ring-2 focus:ring-orange-200 
                       transition-all outline-none"
          />
          {chargement && (
            <i className="ti ti-loader absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" />
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors
                           border-b border-gray-100 last:border-0"
              >
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.adresseCourte}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {suggestion.adresse}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          onClick={() => setModeCarte(!modeCarte)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${modeCarte 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <i className="ti ti-map mr-1" />
          {modeCarte ? 'Masquer la carte' : 'Préciser sur la carte'}
        </button>
        
        <button
          onClick={handleManualInput}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <i className="ti ti-check mr-1" />
          Utiliser cette adresse
        </button>
      </div>

      {/* Sélecteur de position sur carte */}
      {modeCarte && (
        <SelecteurPosition
          onPositionChange={handlePositionChange}
          positionInitiale={position}
          hauteur="300px"
        />
      )}

      {/* Informations sur l'adresse sélectionnée */}
      {adresseDetaillee && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <i className="ti ti-map-pin-checked text-green-600 text-xl mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 text-sm">Adresse confirmée</p>
              <p className="text-green-700 text-sm mt-1">{adresseDetaillee.adresse}</p>
              {adresseDetaillee.composants && (
                <div className="text-green-600 text-xs mt-2 space-y-0.5">
                  {adresseDetaillee.composants.quartier && (
                    <p>📍 Quartier: {adresseDetaillee.composants.quartier}</p>
                  )}
                  {adresseDetaillee.composants.ville && (
                    <p>🏙️ Ville: {adresseDetaillee.composants.ville}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelecteurAdresse;