import api from './api';

export const authService = {
  sInscrire:  (data)  => api.post('/auth/register', data),
  seConnecter:(data)  => api.post('/auth/login', data),
  monProfil:  ()      => api.get('/auth/profil'),
  modifierProfil: (data) => api.put('/auth/profil', data),
  changerMotDePasse: (data) => api.put('/auth/changer-mot-passe', data)
};