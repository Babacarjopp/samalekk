import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import RestaurantCard from '../../components/client/RestaurantCard';
import Loader from '../../components/common/Loader';

const categories = [
  { valeur: '',             label: 'Tous',         icone: 'ti ti-restaurant' },
  { valeur: 'sénégalaise',  label: 'Sénégalaise',  icone: 'ti ti-bowl-chopsticks' },
  { valeur: 'grillades',    label: 'Grillades',     icone: 'ti ti-flame' },
  { valeur: 'fast-food',    label: 'Fast-food',     icone: 'ti ti-burger' },
  { valeur: 'sandwicherie', label: 'Sandwicherie',  icone: 'ti ti-bread' },
  { valeur: 'pâtisserie',   label: 'Pâtisserie',    icone: 'ti ti-cake' },
];

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants]   = useState([]);
  const [chargement,  setChargement]    = useState(true);
  const [recherche,   setRecherche]     = useState('');
  const categorieActive = searchParams.get('categorie') || '';

  useEffect(() => {
    chargerRestaurants();
  }, [categorieActive]);

  const chargerRestaurants = async () => {
    setChargement(true);
    try {
      const params = {};
      if (categorieActive) params.categorie = categorieActive;
      if (recherche)        params.recherche = recherche;
      const res = await restaurantService.obtenirTous(params);
      setRestaurants(res.data.restaurants);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const handleRecherche = (e) => {
    e.preventDefault();
    chargerRestaurants();
  };

  const changerCategorie = (valeur) => {
    if (valeur) setSearchParams({ categorie: valeur });
    else        setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Restaurants à Touba
        </h1>
        <p className="text-gray-500">
          {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''} disponible{restaurants.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleRecherche} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              <i className="ti ti-search" />
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Chercher un restaurant..."
              className="champ pl-11"
            />
          </div>
          <button type="submit" className="btn-primaire px-6">
            Rechercher
          </button>
        </div>
      </form>

      {/* Filtres catégories */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat.valeur}
            onClick={() => changerCategorie(cat.valeur)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                        transition-all duration-200 border-2
                        ${categorieActive === cat.valeur
                          ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                        }`}
          >
           <i className={`${cat.icone} text-base`} />
           <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Liste restaurants */}
      {chargement ? (
        <Loader texte="Chargement des restaurants..." />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">
            <i className="ti ti-restaurant" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Aucun restaurant trouvé
          </h3>
          <p className="text-gray-400">
            Essayez une autre catégorie ou modifiez votre recherche
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(resto => (
            <RestaurantCard key={resto.id} restaurant={resto} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants;