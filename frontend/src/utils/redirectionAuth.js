export const redirectionApresAuth = (utilisateur) => {
  if (!utilisateur) return '/';

  if (utilisateur.statut === 'en_attente') {
    if (utilisateur.role === 'restaurateur') return '/restaurant/onboarding';
    return '/compte-en-attente';
  }

  const routes = {
    client:       '/restaurants',
    restaurateur: '/restaurant/dashboard',
    livreur:      '/livreur/dashboard',
    admin:        '/admin/dashboard',
  };

  return routes[utilisateur.role] || '/';
};
