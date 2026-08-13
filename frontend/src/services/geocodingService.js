// Service pour le géocodage (coordonnées ↔ adresses) utilisant l'API OpenStreetMap Nominatim (gratuit)

const BASE_URL = 'https://nominatim.openstreetmap.org';

// Géocodage inverse : coordonnées → adresse
const reverseGeocoding = async (lat, lng) => {
  try {
    const response = await fetch(
      `${BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr-SN,fr`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors du géocodage inverse');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      adresse: data.display_name || '',
      composants: {
        rue: data.address?.road || '',
        ville: data.address?.city || data.address?.town || data.address?.village || '',
        quartier: data.address?.suburb || data.address?.neighbourhood || '',
        codePostal: data.address?.postcode || '',
        pays: data.address?.country || ''
      },
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon)
    };
  } catch (error) {
    console.error('Erreur géocodage inverse:', error);
    throw error;
  }
};

// Géocodage direct : adresse → coordonnées
const forwardGeocoding = async (adresse) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?format=json&q=${encodeURIComponent(adresse)}&limit=5&countrycodes=sn&accept-language=fr-SN,fr`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors du géocodage direct');
    }
    
    const data = await response.json();
    
    return data.map(result => ({
      adresse: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      importance: result.importance
    })).sort((a, b) => b.importance - a.importance); // Trier par importance
  } catch (error) {
    console.error('Erreur géocodage direct:', error);
    throw error;
  }
};

// Recherche d'adresses avec autocomplete
const rechercherAdresses = async (query, limit = 5) => {
  if (!query || query.length < 3) {
    return [];
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&countrycodes=sn&addressdetails=1&accept-language=fr-SN,fr`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche d\'adresses');
    }
    
    const data = await response.json();
    
    return data.map(result => ({
      id: result.place_id,
      adresse: result.display_name,
      adresseCourte: result.address ? 
        `${result.address.road || ''} ${result.address.house_number || ''}, ${result.address.city || result.address.town || 'Touba'}`.trim() :
        result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      composants: result.address
    }));
  } catch (error) {
    console.error('Erreur recherche adresses:', error);
    return [];
  }
};

export const geocodingService = {
  reverseGeocoding,
  forwardGeocoding,
  rechercherAdresses
};