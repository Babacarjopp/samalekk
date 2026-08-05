import { usePanier } from '../../context/PanierContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrix } from '../../utils/formatPrix';
import { useNavigate } from 'react-router-dom';

const FRAIS_LIVRAISON = 500;

const Panier = ({ restaurant }) => {
  const { articles, nombreArticles, sousTotal, ajouterAuPanier, retirerDuPanier, viderPanier } = usePanier();
  const { estConnecte } = useAuth();
  const navigate = useNavigate();

  const total = sousTotal + FRAIS_LIVRAISON;
  const restaurantDisponible = restaurant?.statut === 'valide' && restaurant?.estOuvert;

  const handleCommander = () => {
    if (!restaurantDisponible) return;
    if (!estConnecte) {
      navigate('/connexion');
      return;
    }
    navigate('/panier');
  };

  if (nombreArticles === 0) {
    return (
      <div className="carte p-6 text-center">
        <div className="text-5xl mb-4">
          <i className="ti ti-shopping-cart" />
        </div>
        <h3 className="font-semibold text-gray-700 mb-2">Votre panier est vide</h3>
        <p className="text-gray-400 text-sm">
          Ajoutez des plats pour commencer votre commande
        </p>
      </div>
    );
  }

  return (
    <div className="carte p-5">
      {/* En-tête panier */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">
          Mon panier
          <span className="ml-2 bg-orange-100 text-orange-700 text-xs
                           font-bold px-2 py-0.5 rounded-full">
            {nombreArticles}
          </span>
        </h3>
        <button
          onClick={viderPanier}
          className="text-red-400 hover:text-red-600 text-xs transition-colors"
        >
          Vider
        </button>
      </div>

      {/* Nom du restaurant */}
      <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
        <i className="ti ti-restaurant text-sm" /> {restaurant?.nom}
      </div>

      {/* Liste articles */}
      <div className="space-y-3 mb-5">
        {articles.map(article => (
          <div key={article.id} className="flex items-center gap-3">
            {/* Contrôles quantité */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => retirerDuPanier(article.id)}
                className="w-6 h-6 rounded-full bg-orange-100 text-orange-600
                           font-bold hover:bg-orange-200 transition-colors
                           flex items-center justify-center text-base leading-none"
              >
                −
              </button>
              <span className="font-bold text-gray-800 w-5 text-center text-sm">
                {article.quantite}
              </span>
              <button
                onClick={() => ajouterAuPanier(article, restaurant)}
                className="w-6 h-6 rounded-full bg-orange-600 text-white
                           font-bold hover:bg-orange-700 transition-colors
                           flex items-center justify-center text-base leading-none"
              >
                +
              </button>
            </div>

            {/* Nom du plat */}
            <span className="flex-1 text-sm text-gray-700 truncate">
              {article.nom}
            </span>

            {/* Prix ligne */}
            <span className="text-sm font-semibold text-gray-800 shrink-0">
              {formatPrix(article.prix * article.quantite)}
            </span>
          </div>
        ))}
      </div>

      {/* Récapitulatif */}
      <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Sous-total</span>
          <span>{formatPrix(sousTotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Frais de livraison</span>
          <span>{formatPrix(FRAIS_LIVRAISON)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 pt-2
                        border-t border-gray-100">
          <span>Total</span>
          <span className="text-orange-600">{formatPrix(total)}</span>
        </div>
      </div>

      {/* Bouton commander */}
      <button
        onClick={handleCommander}
        disabled={!restaurantDisponible}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${restaurantDisponible ? 'btn-primaire' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
      >
        {restaurantDisponible ? `Commander — ${formatPrix(total)}` : 'Restaurant indisponible'}
      </button>
    </div>
  );
};

export default Panier;