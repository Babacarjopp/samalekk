import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatPrix } from '../../utils/formatPrix';
import Loader from '../../components/common/Loader';

const Statistiques = () => {
  const [donnees,   setDonnees]   = useState([]);
  const [periode,   setPeriode]   = useState('mois');
  const [chargement,setChargement]= useState(true);

  useEffect(() => {
    adminService.statistiques(periode)
      .then(res => setDonnees(res.data.commandes))
      .catch(console.error)
      .finally(() => setChargement(false));
  }, [periode]);

  const totalCommandes = donnees.reduce((t, d) => t + parseInt(d.total || 0), 0);
  const totalRevenu    = donnees.reduce((t, d) => t + parseInt(d.revenu || 0), 0);
  const maxCommandes   = Math.max(...donnees.map(d => parseInt(d.total || 0)), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <div className="flex gap-2">
          {[
            { val: 'jour',    label: 'Aujourd\'hui' },
            { val: 'semaine', label: 'Semaine' },
            { val: 'mois',    label: 'Mois' },
          ].map(p => (
            <button
              key={p.val}
              onClick={() => setPeriode(p.val)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                          ${periode === p.val
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-600 border-gray-200'
                          }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="carte p-6 bg-orange-50">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-3xl font-bold text-orange-700">{totalCommandes}</div>
          <div className="text-orange-600 text-sm mt-1">Commandes sur la période</div>
        </div>
        <div className="carte p-6 bg-green-50">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-green-700">{formatPrix(totalRevenu)}</div>
          <div className="text-green-600 text-sm mt-1">Revenu sur la période</div>
        </div>
      </div>

      {/* Graphique en barres */}
      <div className="carte p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Commandes par jour
        </h2>
        {chargement ? (
          <Loader texte="Chargement..." />
        ) : donnees.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Aucune donnée sur cette période
          </div>
        ) : (
          <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
            {donnees.map(d => {
              const hauteur = Math.max((parseInt(d.total) / maxCommandes) * 100, 4);
              return (
                <div key={d.date} className="flex flex-col items-center gap-1 min-w-[40px]">
                  <span className="text-xs font-bold text-orange-700">{d.total}</span>
                  <div
                    style={{ height: `${hauteur}%` }}
                    className="w-full bg-orange-500 hover:bg-orange-600
                               rounded-t-lg transition-colors min-h-[4px]"
                    title={`${d.total} commandes — ${formatPrix(d.revenu)}`}
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(d.date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistiques;