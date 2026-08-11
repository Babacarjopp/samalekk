import api from './api';

export const livraisonService = {
  missionsDisponibles: ()    => api.get('/livraisons/missions'),
  accepterMission:     (id)  => api.put(`/livraisons/${id}/accepter`),
  confirmerRecup:      (id)  => api.put(`/livraisons/${id}/recuperer`),
  confirmerLivraison:  (id)  => api.put(`/livraisons/${id}/livrer`),
  mettreAJourPosition: (data)=> api.post('/livraisons/position', data),
  mettreAJourPositionClient: (data)=> api.post('/livraisons/position/client', data),
  suivreLivraison:     (id)  => api.get(`/livraisons/${id}/suivi`),
  missionLivreur:      (id)  => api.get(`/livraisons/${id}/mission`),
};