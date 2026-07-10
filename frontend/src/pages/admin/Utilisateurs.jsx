import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const rolesConfig = {
  client:       { label: 'Client',       couleur: 'bg-blue-100 text-blue-700',    emoji: '👤' },
  restaurateur: { label: 'Restaurateur', couleur: 'bg-orange-100 text-orange-700',emoji: '🍴' },
  livreur:      { label: 'Livreur',      couleur: 'bg-purple-100 text-purple-700',emoji: '🛵' },
  admin:        { label: 'Admin',        couleur: 'bg-red-100 text-red-700',      emoji: '🔧' },
};

const statutsConfig = {
  actif:      { label: 'Actif',      couleur: 'bg-green-100 text-green-700' },
  suspendu:   { label: 'Suspendu',   couleur: 'bg-red-100 text-red-700' },
  en_attente: { label: 'En attente', couleur: 'bg-yellow-100 text-yellow-700' },
};

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement,   setChargement]   = useState(true);
  const [filtreRole,   setFiltreRole]   = useState('');
  const [recherche,    setRecherche]    = useState('');
  const [action,       setAction]       = useState(null);

  useEffect(() => {
    chargerUtilisateurs();
  }, [filtreRole]);

  const chargerUtilisateurs = async () => {
    setChargement(true);
    try {
      const params = {};
      if (filtreRole) params.role = filtreRole;
      const res = await adminService.tousLesUtilisateurs(params);
      setUtilisateurs(res.data.utilisateurs);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const changerStatut = async (id, statut) => {
    setAction(id);
    try {
      await adminService.changerStatutUtilisateur(id, statut);
      chargerUtilisateurs();
    } catch (err) {
      console.error(err);
    } finally {
      setAction(null);
    }
  };

  const utilisateursFiltres = utilisateurs.filter(u =>
    u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    u.email.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Gestion des utilisateurs
      </h1>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="champ flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          {['', 'client', 'restaurateur', 'livreur'].map(role => (
            <button
              key={role}
              onClick={() => setFiltreRole(role)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                          ${filtreRole === role
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                          }`}
            >
              {role ? rolesConfig[role]?.emoji + ' ' + rolesConfig[role]?.label : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      {chargement ? (
        <Loader texte="Chargement des utilisateurs..." />
      ) : (
        <div className="carte overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Utilisateur', 'Rôle', 'Statut', 'Téléphone', 'Inscrit le', 'Actions'].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold
                                             text-gray-500 uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {utilisateursFiltres.map(user => {
                  const role   = rolesConfig[user.role]   || rolesConfig.client;
                  const statut = statutsConfig[user.statut] || statutsConfig.actif;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-orange-100 rounded-full
                                          flex items-center justify-center
                                          text-orange-700 font-bold text-sm shrink-0">
                            {user.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{user.nom}</p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge-statut ${role.couleur}`}>
                          {role.emoji} {role.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge-statut ${statut.couleur}`}>
                          {statut.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {user.telephone}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        {user.role !== 'admin' && (
                          <Button
                            variante={user.statut === 'suspendu' ? 'vert' : 'danger'}
                            taille="sm"
                            chargement={action === user.id}
                            onClick={() => changerStatut(
                              user.id,
                              user.statut === 'suspendu' ? 'actif' : 'suspendu'
                            )}
                          >
                            {user.statut === 'suspendu' ? 'Réactiver' : 'Suspendre'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {utilisateursFiltres.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilisateurs;