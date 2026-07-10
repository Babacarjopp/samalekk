import api from './api';

export const commandeService = {
  passer:              (data) => api.post('/commandes', data),
  mesCommandes:        ()     => api.get('/commandes/mes'),
  commandesRestaurant: ()     => api.get('/commandes/restaurant'),
  changerStatut: (id, statut) => api.put(`/commandes/${id}/statut`, { statut }),
  noter:       (id, data)     => api.put(`/commandes/${id}/noter`, data),
};