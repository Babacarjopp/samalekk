// Calcul de distance entre deux points GPS (formule Haversine)
// Retourne la distance en kilomètres
export const calculerDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Estimer le temps de livraison selon la distance
// En supposant une vitesse moyenne de 20 km/h en ville
export const estimerTempLivraison = (distanceKm) => {
  const minutes = Math.ceil((distanceKm / 20) * 60) + 5; // +5 min de préparation
  if (minutes < 10) return '10 min';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.ceil(minutes / 60)}h`;
};