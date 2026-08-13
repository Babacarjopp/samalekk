const BoutonItineraire = ({ positionLivreur, positionClient, adresseClient }) => {
  const ouvrirItineraire = () => {
    if (!positionLivreur || !positionClient) {
      alert('Positions non disponibles');
      return;
    }

    const origin = `${positionLivreur.lat},${positionLivreur.lng}`;
    const destination = `${positionClient.lat},${positionClient.lng}`;

    // Essayer Google Maps d'abord
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    // Sur mobile, essayer d'ouvrir l'application native
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Sur Android, essayer Google Maps app
      if (navigator.userAgent.match(/Android/i)) {
        window.open(`geo:${destination}?q=${destination}`, '_system');
        setTimeout(() => {
          window.open(googleMapsUrl, '_blank');
        }, 500);
      } 
      // Sur iOS, essayer Apple Maps puis Google Maps
      else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        const appleMapsUrl = `http://maps.apple.com/?daddr=${destination}&saddr=${origin}`;
        window.open(appleMapsUrl, '_system');
        setTimeout(() => {
          window.open(googleMapsUrl, '_blank');
        }, 500);
      }
    } else {
      // Sur desktop, ouvrir Google Maps dans le navigateur
      window.open(googleMapsUrl, '_blank');
    }
  };

  const ouvrirPositionClient = () => {
    if (!positionClient) {
      alert('Position client non disponible');
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${positionClient.lat},${positionClient.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  if (!positionLivreur || !positionClient) {
    return (
      <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500">
        <p className="text-sm">Positions non disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bouton principal - Itinéraire */}
      <button
        onClick={ouvrirItineraire}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl
                   flex items-center justify-center gap-3 transition-colors font-semibold"
      >
        <span className="text-2xl">🗺️</span>
        <span>Voir l'itinéraire GPS</span>
      </button>

      {/* Bouton secondaire - Position seule */}
      <button
        onClick={ouvrirPositionClient}
        className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl
                   flex items-center justify-center gap-2 transition-colors text-sm"
      >
        <span>📍</span>
        <span>Voir la position du client sur la carte</span>
      </button>

      {/* Informations de destination */}
      {adresseClient && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-orange-800 text-sm font-medium mb-1">
            📍 Adresse de livraison :
          </p>
          <p className="text-orange-700 text-xs">{adresseClient}</p>
          <p className="text-orange-600 text-xs mt-1 font-mono">
            {positionClient.lat.toFixed(6)}, {positionClient.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Distance estimée */}
      <div className="text-center text-gray-500 text-xs">
        ℹ️ Ce bouton ouvrira votre application de navigation (Google Maps, Apple Maps, etc.)
      </div>
    </div>
  );
};

export default BoutonItineraire;