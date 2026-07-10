import api from './api';

export const restaurantService = {
  obtenirTous:    (params) => api.get('/restaurants', { params }),
  obtenirUn:      (id)     => api.get(`/restaurants/${id}`),
  monRestaurant:  ()       => api.get('/restaurants/moi/restaurant'),
  creer:          (data)   => api.post('/restaurants', data),
  modifier:       (data)   => api.put('/restaurants/moi/restaurant', data),
};