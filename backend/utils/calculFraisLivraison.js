// Calcul des frais de livraison selon la distance GPS
// Formule : Haversine (distance entre deux points GPS)

const calculerDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance en km
};

// Calcul des frais selon la distance
// Tarification adaptée à Touba
const calculFraisLivraison = (distanceKm) => {
  if (distanceKm <= 1)   return 300;   // moins de 1 km  → 300 FCFA
  if (distanceKm <= 3)   return 500;   // 1 à 3 km       → 500 FCFA
  if (distanceKm <= 5)   return 800;   // 3 à 5 km       → 800 FCFA
  if (distanceKm <= 10)  return 1200;  // 5 à 10 km      → 1200 FCFA
  return 1500;                          // plus de 10 km  → 1500 FCFA
};

module.exports = { calculerDistance, calculFraisLivraison };