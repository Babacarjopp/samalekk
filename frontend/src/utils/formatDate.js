// Formater une date en français
export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-SN', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Temps écoulé depuis une date
// Exemple : "il y a 5 minutes"
export const tempsEcoule = (date) => {
  const secondes = Math.floor((new Date() - new Date(date)) / 1000);
  if (secondes < 60)   return 'À l\'instant';
  if (secondes < 3600) return `il y a ${Math.floor(secondes / 60)} min`;
  if (secondes < 86400)return `il y a ${Math.floor(secondes / 3600)}h`;
  return `il y a ${Math.floor(secondes / 86400)} jours`;
};