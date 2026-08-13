const BoutonItineraireLivreur = ({ latitude, longitude, adresseTexte }) => {
  const aCoordonnees = latitude != null && longitude != null;
  const aAdresseTexte = !!adresseTexte?.trim();

  const ouvrirItineraire = () => {
    let url;

    if (aCoordonnees) {
      // Cas idéal : coordonnées exactes (GPS ou pin-drop)
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    } else if (aAdresseTexte) {
      // Fallback : le client n'a donné qu'une description texte.
      // Google Maps peut géocoder lui-même une destination textuelle.
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresseTexte)}&travelmode=driving`;
    } else {
      return;
    }

    window.open(url, '_blank');
  };

  if (!aCoordonnees && !aAdresseTexte) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
        <p className="text-gray-600 text-sm">
          <i className="ti ti-alert-circle mr-1" />
          Aucune position disponible pour ce client. Appelez-le avant de partir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={ouvrirItineraire}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white
                   rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        🧭 Voir l'itinéraire GPS
      </button>

      {/* Le livreur voit toujours si c'est une position exacte ou approximative */}
      <p className="text-xs text-center text-gray-500">
        {aCoordonnees
          ? '📍 Position exacte'
          : '⚠️ Adresse approximative — vérifiez avec le client sur place'}
      </p>
    </div>
  );
};

export default BoutonItineraireLivreur;