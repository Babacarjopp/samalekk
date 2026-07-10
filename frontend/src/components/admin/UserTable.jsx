import Button from '../common/Button';

// Tableau réutilisable pour afficher les utilisateurs dans l'interface admin
const UserTable = ({ utilisateurs = [], onChangerStatut, actionEnCours }) => {

  const rolesConfig = {
    client:       { label: 'Client',       couleur: 'bg-blue-100 text-blue-700',    emoji: '👤' },
    restaurateur: { label: 'Restaurateur', couleur: 'bg-orange-100 text-orange-700',emoji: '🍴' },
    livreur:      { label: 'Livreur',      couleur: 'bg-purple-100 text-purple-700',emoji: '🛵' },
    admin:        { label: 'Admin',        couleur: 'bg-red-100 text-red-700',      emoji: '🔧' },
  };

  const statutsConfig = {
    actif:      { label: 'Actif',      couleur: 'bg-green-100 text-green-700'  },
    suspendu:   { label: 'Suspendu',   couleur: 'bg-red-100 text-red-700'      },
    en_attente: { label: 'En attente', couleur: 'bg-yellow-100 text-yellow-700'},
  };

  if (utilisateurs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {['Utilisateur', 'Rôle', 'Statut', 'Téléphone', 'Actions'].map(col => (
              <th key={col}
                  className="text-left px-4 py-3 text-xs font-semibold
                             text-gray-500 uppercase tracking-wide">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {utilisateurs.map(user => {
            const role   = rolesConfig[user.role]    || rolesConfig.client;
            const statut = statutsConfig[user.statut] || statutsConfig.actif;
            return (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center
                                    justify-center text-orange-700 font-bold text-sm shrink-0">
                      {user.nom?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.nom}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge-statut ${role.couleur}`}>
                    {role.emoji} {role.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge-statut ${statut.couleur}`}>
                    {statut.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.telephone}</td>
                <td className="px-4 py-3">
                  {user.role !== 'admin' && onChangerStatut && (
                    <Button
                      variante={user.statut === 'suspendu' ? 'vert' : 'danger'}
                      taille="sm"
                      chargement={actionEnCours === user.id}
                      onClick={() => onChangerStatut(
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
    </div>
  );
};

export default UserTable;