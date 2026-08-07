import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const categories = [
  { valeur: 'sénégalaise', label: 'Sénégalaise' },
  { valeur: 'grillades', label: 'Grillades' },
  { valeur: 'fast-food', label: 'Fast-food' },
  { valeur: 'sandwicherie', label: 'Sandwicherie' },
  { valeur: 'pâtisserie', label: 'Pâtisserie' },
  { valeur: 'autre', label: 'Autre' },
];

const CreerRestaurant = () => {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [restaurantExistant, setRestaurantExistant] = useState(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    categorie: ['sénégalaise'],
    adresse: '',
    telephone: utilisateur?.telephone || '',
    heureOuverture: '08:00',
    heureFermeture: '22:00',
  });

  useEffect(() => {
    const verifier = async () => {
      try {
        const res = await restaurantService.monRestaurant();
        setRestaurantExistant(res.data.restaurant);
      } catch (err) {
        if (err.response?.status !== 404) console.error(err);
      } finally {
        setChargement(false);
      }
    };
    verifier();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErreur('');
  };

  const handleCategorieChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setForm({ ...form, categorie: selected });
    setErreur('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      await restaurantService.creer(form);
      navigate('/compte-en-attente');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création du restaurant.');
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <Loader texte="Chargement..." />;

  if (restaurantExistant) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="carte card-p text-center">
          <div className="text-5xl mb-4"><i className="ti ti-bowl-chopsticks" /></div>
          <h1 className="page-title mb-3">{restaurantExistant.nom}</h1>
          <p className="body-md mb-6">
            {restaurantExistant.statut === 'valide'
              ? 'Votre restaurant est validé. Vous pouvez accéder à votre tableau de bord.'
              : 'Votre restaurant est enregistré et attend la validation d\'un administrateur.'}
          </p>
          {utilisateur?.statut === 'actif' && restaurantExistant.statut === 'valide' ? (
            <Link to="/restaurant/dashboard" className="btn btn-primary">
              Accéder au tableau de bord
            </Link>
          ) : (
            <Link to="/compte-en-attente" className="btn btn-orange-soft">
              Voir le statut de validation
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="page-title mb-2">Inscrire mon restaurant</h1>
        <p className="body-md">
          Complétez les informations de votre établissement pour rejoindre la plateforme.
        </p>
      </div>

      <div className="carte card-p">
        {erreur && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <i className="ti ti-alert-circle" />
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="col gap-20">
          <div className="field">
            <label className="field-label" htmlFor="nom">Nom du restaurant</label>
            <input
              id="nom"
              name="nom"
              className="input"
              value={form.nom}
              onChange={handleChange}
              placeholder="Chez Fatou"
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="input input-area"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez votre cuisine, vos spécialités..."
              rows={4}
            />
          </div>

          <div className="g2">
            <div className="field">
              <label className="field-label" htmlFor="categorie">Catégories</label>
              <select
                id="categorie"
                name="categorie"
                className="input input-select"
                value={form.categorie}
                onChange={handleCategorieChange}
                multiple
                size="5"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.valeur} value={cat.valeur}>{cat.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">Sélectionnez une ou plusieurs catégories.</p>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="telephone">Téléphone</label>
              <input
                id="telephone"
                name="telephone"
                className="input"
                value={form.telephone}
                onChange={handleChange}
                placeholder="77 123 45 67"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="adresse">Adresse à Touba</label>
            <input
              id="adresse"
              name="adresse"
              className="input"
              value={form.adresse}
              onChange={handleChange}
              placeholder="Quartier, rue, point de repère..."
              required
            />
          </div>

          <div className="g2">
            <div className="field">
              <label className="field-label" htmlFor="heureOuverture">Ouverture</label>
              <input
                id="heureOuverture"
                name="heureOuverture"
                type="time"
                className="input"
                value={form.heureOuverture}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="heureFermeture">Fermeture</label>
              <input
                id="heureFermeture"
                name="heureFermeture"
                type="time"
                className="input"
                value={form.heureFermeture}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="alert alert-info">
            <i className="ti ti-info-circle" />
            Votre restaurant sera visible sur la plateforme après validation par un administrateur.
          </div>

          <Button type="submit" variante="primaire" chargement={envoi} className="btn-full">
            Enregistrer mon restaurant
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreerRestaurant;
