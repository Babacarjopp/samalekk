import { useState, useEffect } from 'react';
import { restaurantService } from '../../services/restaurantService';
import RestaurantCard from '../../components/client/RestaurantCard';
import Loader from '../../components/common/Loader';

const Restaurants = () => {
  const [restaurants, setRestaurants]   = useState([]);
  const [chargement,  setChargement]    = useState(true);
  const [recherche,   setRecherche]     = useState('');

  useEffect(() => {
    chargerRestaurants();
  }, [recherche]);

  const chargerRestaurants = async () => {
    setChargement(true);
    try {
      const params = {};
      if (recherche) params.recherche = recherche;
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
      <form onSubmit={handleRecherche} className="mb-8">
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