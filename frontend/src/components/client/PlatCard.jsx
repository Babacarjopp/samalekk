import { useState } from 'react';
import { usePanier } from '../../context/PanierContext';
import { formatPrix } from '../../utils/formatPrix';

const IMAGE_DEFAUT = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

const PlatCard = ({ plat, restaurant, estOuvert }) => {
  const { ajouterAuPanier, articles, retirerDuPanier } = usePanier();
  const [imageError, setImageError] = useState(false);

  const articleDansPanier = articles.find(a => a.id === plat.id);
  const quantite = articleDansPanier?.quantite || 0;
  const stockRestant = Math.max(0, (plat.stock ?? 0) - quantite);
  const enRupture = stockRestant <= 0;

  const handleAjouter = () => {
    if (!estOuvert || enRupture) return;
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
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-gray-900 truncate">{plat.nom}</h4>
          {enRupture && (
            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-100 text-red-700 shrink-0">
              Rupture
            </span>
          )}
        </div>

        {plat.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{plat.description}</p>
        )}

        {plat.categorieCuisine && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600 mb-2">
            {plat.categorieCuisine}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="font-bold text-orange-600 text-sm">
              {formatPrix(plat.prix)}
            </span>
            <p className={`text-xs mt-1 ${enRupture ? 'text-red-600' : 'text-gray-500'}`}>
              {enRupture ? 'Plus en stock' : `En stock : ${stockRestant}`}
            </p>
          </div>

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
                  disabled={enRupture}
                  className={`w-7 h-7 rounded-full text-white font-bold transition-colors flex items-center justify-center text-lg leading-none ${enRupture ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAjouter}
                disabled={enRupture}
                className={`w-8 h-8 rounded-full text-white font-bold active:scale-90 transition-all flex items-center justify-center text-xl leading-none shadow-md ${enRupture ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
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