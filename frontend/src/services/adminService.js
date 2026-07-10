import api from './api';

export const adminService = {
  tableauDeBord:          ()          => api.get('/admin/tableau-de-bord'),
  restaurantsEnAttente:   ()          => api.get('/admin/restaurants/en-attente'),
  validerRestaurant:      (id)        => api.put(`/admin/restaurants/${id}/valider`),
  refuserRestaurant:      (id, motif) => api.put(`/admin/restaurants/${id}/refuser`, { motif }),
  tousLesUtilisateurs:    (params)    => api.get('/admin/utilisateurs', { params }),
  changerStatutUtilisateur:(id, statut)=> api.put(`/admin/utilisateurs/${id}/statut`, { statut }),
  gererLivreurs:          ()          => api.get('/admin/livreurs'),
  statistiques:           (periode)   => api.get('/admin/statistiques', { params: { periode } }),
};