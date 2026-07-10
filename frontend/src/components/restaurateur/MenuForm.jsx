import Button from '../common/Button';

const categories = ['plat principal', 'entrée', 'accompagnement', 'dessert', 'boisson'];

// Formulaire réutilisable pour ajouter ou modifier un plat
const MenuForm = ({ form, onChange, onSubmit, chargement, erreur, estModification }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
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
          onChange={onChange}
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
          onChange={onChange}
          placeholder="Décrivez ce plat, les ingrédients principaux..."
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
            onChange={onChange}
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
            onChange={onChange}
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
          onChange={onChange}
          accept="image/jpg,image/jpeg,image/png,image/webp"
          className="champ text-sm file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0 file:text-sm
                     file:font-semibold file:bg-orange-50 file:text-orange-700
                     hover:file:bg-orange-100"
        />
        <p className="text-gray-400 text-xs mt-1">JPG, PNG ou WEBP — Max 5 Mo</p>
      </div>

      <Button
        type="submit"
        variante="primaire"
        chargement={chargement}
        className="w-full"
      >
        {estModification ? 'Enregistrer les modifications' : 'Ajouter au menu'}
      </Button>
    </form>
  );
};

export default MenuForm;