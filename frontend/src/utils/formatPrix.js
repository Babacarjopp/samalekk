// Formater un prix en FCFA
// Exemple : 2500 → "2 500 FCFA"
export const formatPrix = (prix) => {
  if (!prix && prix !== 0) return '—';
  return new Intl.NumberFormat('fr-SN').format(prix) + ' FCFA';
};