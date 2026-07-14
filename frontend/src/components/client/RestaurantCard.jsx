import { Link } from 'react-router-dom';

// Image par défaut si le restaurant n'en a pas
const IMAGE_DEFAUT = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80';

const RestaurantCard = ({ restaurant }) => {
  const {
    id, nom, description, categorie,
    image, noteMoyenne, nombreAvis,
    estOuvert, heureOuverture, heureFermeture
  } = restaurant;

  return (
    <Link to={`/restaurants/${id}/menu`} className="carte group block animer">

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || IMAGE_DEFAUT}
          alt={nom}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300"
          onError={(e) => { e.target.src = IMAGE_DEFAUT; }}
        />

        {/* Badge ouvert/fermé */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold
                         ${estOuvert
                           ? 'bg-green-500 text-white'
                           : 'bg-gray-700 text-gray-200'
                         }`}>
          <span className="inline-flex items-center gap-1">
            <i className={estOuvert ? 'ti ti-circle-check' : 'ti ti-circle-x'} />
            {estOuvert ? 'Ouvert' : 'Fermé'}
          </span>
        </div>

        {/* Catégorie */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm
                        px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
          {categorie}
        </div>
      </div>

      {/* Infos */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-orange-600
                       transition-colors">
          {nom}
        </h3>

        {description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3
                        border-t border-gray-100">
          {/* Note */}
          <div className="flex items-center gap-1">
            <i className="ti ti-star text-amber-400" />
            <span className="font-semibold text-gray-800 text-sm">
              {noteMoyenne > 0 ? noteMoyenne.toFixed(1) : 'Nouveau'}
            </span>
            {nombreAvis > 0 && (
              <span className="text-gray-400 text-xs">({nombreAvis} avis)</span>
            )}
          </div>

          {/* Horaires */}
          <div className="text-gray-400 text-xs flex items-center gap-1">
            <i className="ti ti-clock" />
            {heureOuverture} – {heureFermeture}
          </div>
        </div>

        {/* Bouton commander */}
        <div className="mt-4">
          <div className={`w-full py-2.5 rounded-xl text-center text-sm font-semibold
                          transition-all duration-200
                          ${estOuvert
                            ? 'bg-orange-600 text-white group-hover:bg-orange-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}>
            {estOuvert ? 'Voir le menu →' : 'Actuellement fermé'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;