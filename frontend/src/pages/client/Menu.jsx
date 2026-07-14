import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import { usePanier } from '../../context/PanierContext';
import { useAuth } from '../../context/AuthContext';
import PlatCard from '../../components/client/PlatCard';
import Panier from '../../components/client/Panier';
import Loader from '../../components/common/Loader';

const categoriesOrdre = [
  'plat principal', 'entrée', 'accompagnement', 'dessert', 'boisson'
];

const Menu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estConnecte } = useAuth();
  const { nombreArticles } = usePanier();

  const [restaurant,    setRestaurant]    = useState(null);
  const [chargement,    setChargement]    = useState(true);
  const [categorieActive, setCategorieActive] = useState('');
  const [panierOuvert,  setPanierOuvert]  = useState(false);

  useEffect(() => {
    chargerRestaurant();
  }, [id]);

  const chargerRestaurant = async () => {
    try {
      const res = await restaurantService.obtenirUn(id);
      setRestaurant(res.data.restaurant);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  if (chargement) return <Loader texte="Chargement du menu..." />;
  if (!restaurant) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Restaurant introuvable.</p>
    </div>
  );

  // Grouper les plats par catégorie
  const platsFiltres = restaurant.plats || [];
  const platsParCategorie = categoriesOrdre.reduce((acc, cat) => {
    const plats = platsFiltres.filter(p => p.categorie === cat);
    if (plats.length > 0) acc[cat] = plats;
    return acc;
  }, {});

  const categories = Object.keys(platsParCategorie);

  const handleCommander = () => {
    if (!estConnecte) {
      navigate('/connexion');
      return;
    }
    setPanierOuvert(true);
  };

  const categorieIcones = {
    'plat principal': 'ti ti-restaurant',
    'entrée': 'ti ti-leaf',
    'accompagnement': 'ti ti-bowl-chopsticks',
    'dessert': 'ti ti-cake',
    'boisson': 'ti ti-cup',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Bannière restaurant */}
      <div className="carte mb-8 overflow-hidden">
        <div className="relative h-56 md:h-72">
          <img
            src={restaurant.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80'}
            alt={restaurant.nom}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold mb-1">{restaurant.nom}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <i className="ti ti-star text-amber-400" /> {restaurant.noteMoyenne > 0 ? restaurant.noteMoyenne.toFixed(1) : 'Nouveau'}
                {restaurant.nombreAvis > 0 && ` (${restaurant.nombreAvis} avis)`}
              </span>
              <span className="flex items-center gap-1">
                <i className="ti ti-clock text-sm" /> {restaurant.heureOuverture} – {restaurant.heureFermeture}
              </span>
              <span className={`flex items-center gap-1 ${restaurant.estOuvert ? 'text-green-400' : 'text-red-400'}`}>
                <i className={restaurant.estOuvert ? 'ti ti-circle-check' : 'ti ti-circle-x'} />
                {restaurant.estOuvert ? 'Ouvert' : 'Fermé'}
              </span>
            </div>
          </div>
        </div>

        {restaurant.description && (
          <div className="p-5">
            <p className="text-gray-600">{restaurant.description}</p>
          </div>
        )}
      </div>

      <div className="flex gap-8">

        {/* Menu */}
        <div className="flex-1">

          {/* Filtres catégories */}
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6">
              <button
                onClick={() => setCategorieActive('')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                            ${!categorieActive
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                            }`}
              >
                Tout voir
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategorieActive(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all capitalize
                              ${categorieActive === cat
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                              }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Plats par catégorie */}
          {platsFiltres.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">
                <i className="ti ti-file-search" />
              </div>
              <p className="text-gray-500">Aucun plat disponible pour le moment.</p>
            </div>
          ) : (
            Object.entries(platsParCategorie)
              .filter(([cat]) => !categorieActive || cat === categorieActive)
              .map(([cat, plats]) => (
                <div key={cat} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize
                                 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <i className={`${categorieIcones[cat]} text-lg`} />
                    <span className="capitalize">{cat}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plats.map(plat => (
                      <PlatCard
                        key={plat.id}
                        plat={plat}
                        restaurant={restaurant}
                        estOuvert={restaurant.estOuvert}
                      />
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Panier flottant desktop */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24">
            <Panier
              restaurant={restaurant}
              onCommander={handleCommander}
            />
          </div>
        </div>
      </div>

      {/* Bouton panier mobile */}
      {nombreArticles > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 lg:hidden z-30">
          <button
            onClick={handleCommander}
            className="w-full btn-primaire py-4 flex items-center justify-between
                       shadow-2xl rounded-2xl"
          >
            <span className="bg-white/30 rounded-lg px-2 py-1 text-sm font-bold">
              {nombreArticles} article{nombreArticles > 1 ? 's' : ''}
            </span>
            <span>Voir mon panier</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;