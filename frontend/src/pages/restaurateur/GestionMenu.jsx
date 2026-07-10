import { useState, useEffect } from 'react';
import { restaurantService } from '../../services/restaurantService';
import { formatPrix } from '../../utils/formatPrix';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import api from '../../services/api';

const categories = ['plat principal', 'entrée', 'accompagnement', 'dessert', 'boisson'];
const IMAGE_DEFAUT = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';

const formVide = { nom: '', description: '', prix: '', categorie: 'plat principal', image: null };

const GestionMenu = () => {
  const [restaurant, setRestaurant]   = useState(null);
  const [chargement, setChargement]   = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [platSelectionne, setPlatSelectionne] = useState(null);
  const [form,       setForm]         = useState(formVide);
  const [envoi,      setEnvoi]        = useState(false);
  const [erreur,     setErreur]       = useState('');

  useEffect(() => {
    chargerRestaurant();
  }, []);

  const chargerRestaurant = async () => {
    try {
      const res = await restaurantService.monRestaurant();
      setRestaurant(res.data.restaurant);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const ouvrirAjout = () => {
    setPlatSelectionne(null);
    setForm(formVide);
    setErreur('');
    setModalOuvert(true);
  };

  const ouvrirModification = (plat) => {
    setPlatSelectionne(plat);
    setForm({
      nom:         plat.nom,
      description: plat.description || '',
      prix:        plat.prix,
      categorie:   plat.categorie,
      image:       null
    });
    setErreur('');
    setModalOuvert(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prix) {
      setErreur('Nom et prix sont obligatoires.');
      return;
    }
    setEnvoi(true);
    setErreur('');
    try {
      const formData = new FormData();
      formData.append('nom',         form.nom);
      formData.append('description', form.description);
      formData.append('prix',        form.prix);
      formData.append('categorie',   form.categorie);
      if (form.image) formData.append('image', form.image);

      if (platSelectionne) {
        await api.put(`/plats/${platSelectionne.id}`, formData);
      } else {
        await api.post('/plats', formData);
      }

      setModalOuvert(false);
      chargerRestaurant();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setEnvoi(false);
    }
  };

  const supprimerPlat = async (platId) => {
    if (!window.confirm('Retirer ce plat du menu ?')) return;
    try {
      await api.delete(`/plats/${platId}`);
      chargerRestaurant();
    } catch (err) {
      console.error(err);
    }
  };

  if (chargement) return <Loader texte="Chargement du menu..." />;

  const plats = restaurant?.plats || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gérer le menu</h1>
          <p className="text-gray-500 mt-1">
            {plats.length} plat{plats.length > 1 ? 's' : ''} au menu
          </p>
        </div>
        <Button variante="primaire" onClick={ouvrirAjout}>
          + Ajouter un plat
        </Button>
      </div>

      {/* Liste des plats */}
      {plats.length === 0 ? (
        <div className="carte p-16 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Votre menu est vide
          </h3>
          <p className="text-gray-400 mb-6">
            Ajoutez votre premier plat pour commencer à recevoir des commandes
          </p>
          <Button variante="primaire" onClick={ouvrirAjout}>
            + Ajouter mon premier plat
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => {
            const platsCategorie = plats.filter(p => p.categorie === cat);
            if (platsCategorie.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="text-lg font-bold text-gray-700 mb-3 capitalize
                               flex items-center gap-2 pb-2 border-b border-gray-100">
                  {cat}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platsCategorie.map(plat => (
                    <div key={plat.id}
                         className={`carte flex gap-4 p-4
                                     ${!plat.disponible ? 'opacity-50' : ''}`}>
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
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {plat.nom}
                          </h3>
                          {!plat.disponible && (
                            <span className="badge-statut bg-gray-100 text-gray-500 shrink-0">
                              Retiré
                            </span>
                          )}
                        </div>
                        {plat.description && (
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {plat.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-orange-600">
                            {formatPrix(plat.prix)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => ouvrirModification(plat)}
                              className="text-blue-600 hover:text-blue-800 text-sm
                                         font-medium transition-colors"
                            >
                              Modifier
                            </button>
                            {plat.disponible && (
                              <button
                                onClick={() => supprimerPlat(plat.id)}
                                className="text-red-500 hover:text-red-700 text-sm
                                           font-medium transition-colors"
                              >
                                Retirer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ajout/modification */}
      <Modal
        estOuvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        titre={platSelectionne ? 'Modifier le plat' : 'Ajouter un plat'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-xl p-3 text-sm">
              ⚠️ {erreur}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du plat *
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Ex : Thiéboudienne, Yassa Poulet..."
              className="champ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez ce plat..."
              rows={2}
              className="champ resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                name="prix"
                value={form.prix}
                onChange={handleChange}
                placeholder="2500"
                min="100"
                className="champ"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                name="categorie"
                value={form.categorie}
                onChange={handleChange}
                className="champ"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Photo du plat
            </label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/jpg,image/jpeg,image/png,image/webp"
              className="champ text-sm file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:text-sm
                         file:font-semibold file:bg-orange-50 file:text-orange-700
                         hover:file:bg-orange-100"
            />
            <p className="text-gray-400 text-xs mt-1">
              JPG, PNG ou WEBP — Max 5 Mo
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variante="gris"
              onClick={() => setModalOuvert(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variante="primaire"
              chargement={envoi}
              className="flex-1"
            >
              {platSelectionne ? 'Enregistrer' : 'Ajouter au menu'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionMenu;