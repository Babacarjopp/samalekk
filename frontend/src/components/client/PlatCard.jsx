import { useState } from 'react';
import { usePanier } from '../../context/PanierContext';
import { formatPrix } from '../../utils/formatPrix';

const IMAGE_DEFAUT = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

const PlatCard = ({ plat, restaurant, estOuvert }) => {
  const { ajouterAuPanier, articles, retirerDuPanier } = usePanier();
  const [imageError, setImageError] = useState(false);

  const articleDansPanier = articles.find(a => a.id === plat.id);
  const quantite = articleDansPanier?.quantite || 0;

  const handleAjouter = () => {
    if (!estOuvert) return;
    ajouterAuPanier(plat, restaurant);
  };

  return (
    <div className={`carte flex gap-3 p-3 transition-all duration-200
                     ${!estOuvert ? 'opacity-60' : 'hover:shadow-md'}`}>

      {/* Image du plat */}
      <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-orange-50">
        <img
          src={!imageError && plat.image ? plat.image : IMAGE_DEFAUT}
          alt={plat.nom}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 mb-1 truncate">{plat.nom}</h4>

        {plat.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{plat.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-bold text-orange-600 text-sm">
            {formatPrix(plat.prix)}
          </span>

          {/* Contrôles quantité */}
          {estOuvert && (
            quantite > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => retirerDuPanier(plat.id)}
                  className="w-7 h-7 rounded-full bg-orange-100 text-orange-600
                             font-bold hover:bg-orange-200 transition-colors
                             flex items-center justify-center text-lg leading-none"
                >
                  −
                </button>
                <span className="font-bold text-gray-800 w-4 text-center text-sm">
                  {quantite}
                </span>
                <button
                  onClick={handleAjouter}
                  className="w-7 h-7 rounded-full bg-orange-600 text-white
                             font-bold hover:bg-orange-700 transition-colors
                             flex items-center justify-center text-lg leading-none"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAjouter}
                className="w-8 h-8 rounded-full bg-orange-600 text-white
                           font-bold hover:bg-orange-700 active:scale-90
                           transition-all flex items-center justify-center
                           text-xl leading-none shadow-md"
              >
                +
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatCard;