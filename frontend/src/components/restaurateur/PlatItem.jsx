import { formatPrix } from '../../utils/formatPrix';

const IMAGE_DEFAUT = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';

// Composant ligne de plat dans le tableau de gestion du menu
const PlatItem = ({ plat, onModifier, onSupprimer }) => {
  return (
    <div className={`carte flex gap-4 p-4 transition-all
                     ${!plat.disponible ? 'opacity-50' : 'hover:shadow-md'}`}>

      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 shrink-0">
        <img
          src={plat.image || IMAGE_DEFAUT}
          alt={plat.nom}
          onError={(e) => { e.target.src = IMAGE_DEFAUT; }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{plat.nom}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <span className="badge-statut bg-gray-100 text-gray-500 text-xs capitalize">
              {plat.categorie}
            </span>
            {!plat.disponible && (
              <span className="badge-statut bg-red-100 text-red-500 text-xs">
                Retiré
              </span>
            )}
          </div>
        </div>

        {plat.description && (
          <p className="text-gray-400 text-xs mb-2 line-clamp-2">{plat.description}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-orange-600">{formatPrix(plat.prix)}</span>

          {plat.disponible && (
            <div className="flex gap-3">
              <button
                onClick={() => onModifier(plat)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium
                         transition-colors inline-flex items-center gap-2"
              >
              <i className="ti ti-pencil" /> Modifier
              </button>
              <button
                onClick={() => onSupprimer(plat.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium
                         transition-colors inline-flex items-center gap-2"
              >
              <i className="ti ti-trash" /> Retirer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatItem;