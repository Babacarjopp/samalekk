import api from './api';

export const paiementService = {
  initier: (donnees)    => api.post('/paiements/initier', donnees),
  simuler: (donnees)    => api.post('/paiements/simuler', donnees),
  statut:  (commandeId) => api.get(`/paiements/${commandeId}`),
};
