import { useState, useEffect } from 'react';

// Hook pour récupérer et surveiller la position GPS du navigateur
const useGeolocation = (surveiller = false) => {
  const [position,  setPosition]  = useState(null);
  const [erreur,    setErreur]    = useState(null);
  const [chargement,setChargement]= useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErreur('La géolocalisation n\'est pas supportée par votre navigateur.');
      setChargement(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,  // Utiliser GPS si disponible
      timeout:            15000, // Augmenter le timeout pour meilleur signal
      maximumAge:         0,     // Toujours obtenir la position la plus récente
      desiredAccuracy:    'high' // Pour les navigateurs qui supportent cette option
    };

    const succes = (pos) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        precision: pos.coords.accuracy
      });
      setChargement(false);
      setErreur(null);
    };

    const echec = (err) => {
      const messages = {
        1: 'Permission refusée. Veuillez autoriser la géolocalisation.',
        2: 'Position indisponible.',
        3: 'Délai dépassé.'
      };
      setErreur(messages[err.code] || 'Erreur GPS inconnue.');
      setChargement(false);
    };

    if (surveiller) {
      // Surveiller en continu (pour le livreur)
      const watchId = navigator.geolocation.watchPosition(succes, echec, options);
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      // Une seule lecture (pour le client)
      navigator.geolocation.getCurrentPosition(succes, echec, options);
    }
  }, [surveiller]);

  return { position, erreur, chargement };
};

export default useGeolocation;