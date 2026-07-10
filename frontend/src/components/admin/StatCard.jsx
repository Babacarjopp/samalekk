// Composant carte de statistique réutilisable pour le tableau de bord admin
const StatCard = ({ emoji, valeur, label, couleur = 'bg-orange-50 text-orange-700', tendance = null }) => {
  return (
    <div className={`carte p-5 ${couleur}`}>
      <div className="text-3xl mb-3">{emoji}</div>
      <div className="text-3xl font-bold mb-1">{valeur}</div>
      <div className="text-sm opacity-80">{label}</div>
      {tendance !== null && (
        <div className={`text-xs font-semibold mt-2 flex items-center gap-1
                         ${tendance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          <span>{tendance >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(tendance)}% vs hier</span>
        </div>
      )}      
    </div>        
  );
};

export default StatCard;