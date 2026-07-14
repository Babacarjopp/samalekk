import { formatPrix } from '../../utils/formatPrix';
import { tempsEcoule } from '../../utils/formatDate';
import Button from '../common/Button';

const statutsConfig = {
  confirmee:      { label: 'Nouvelle',       couleur: 'bg-blue-100 text-blue-700',    icone: 'ti ti-new-section' },
  en_preparation: { label: 'En préparation', couleur: 'bg-orange-100 text-orange-700',icone: 'ti ti-flame' },
  en_livraison:   { label: 'En livraison',   couleur: 'bg-purple-100 text-purple-700',icone: 'ti ti-truck-delivery' },
  livree:         { label: 'Livrée',         couleur: 'bg-green-100 text-green-700',  icone: 'ti ti-flag' },
  annulee:        { label: 'Annulée',        couleur: 'bg-red-100 text-red-700',      icone: 'ti ti-x' },
};

// Composant carte commande reçue pour le restaurateur
const CommandeRecue = ({ commande, onChangerStatut, actionEnCours }) => {
  const statut = statutsConfig[commande.statut] || statutsConfig.confirmee;

  return (
    <div className="border border-gray-100 rounded-2xl p-4 hover:border-orange-200
                    transition-colors bg-white">

      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">{commande.client?.nom}</span>
            <span className={`badge-statut ${statut.couleur} inline-flex items-center gap-2`}>
              <i className={`${statut.icone} text-sm`} /> {statut.label}
            </span>
          </div>
          <p className="text-gray-400 text-xs flex items-center gap-2">
            <i className="ti ti-phone text-sm" /> {commande.client?.telephone} · {tempsEcoule(commande.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <div className="font-bold text-orange-600">{formatPrix(commande.montantTotal)}</div>
          <div className="text-gray-400 text-xs">
            {commande.modePaiement === 'en_ligne' ? '💳 Payé' : '💵 Cash'}
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm">
        {commande.lignes?.map(l => (
          <div key={l.id} className="flex justify-between text-gray-600 py-0.5">
            <span>{l.quantite}× {l.plat?.nom}</span>
            <span className="font-medium">{formatPrix(l.sousTotal)}</span>
          </div>
        ))}
      </div>

      {/* Adresse */}
      <p className="text-gray-400 text-xs mb-3 flex items-center gap-2">
        <i className="ti ti-map-pin text-sm" /> {commande.adresseLivraison}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        {commande.statut === 'confirmee' && (
          <Button
            variante="primaire" taille="sm"
            chargement={actionEnCours === commande.id}
            onClick={() => onChangerStatut(commande.id, 'en_preparation')}
          >
           <i className="ti ti-flame text-base" /> Commencer
          </Button>
        )}
        {commande.statut === 'en_preparation' && (
          <Button
            variante="vert" taille="sm"
            chargement={actionEnCours === commande.id}
            onClick={() => onChangerStatut(commande.id, 'en_livraison')}
          >
            <i className="ti ti-truck-delivery text-base" /> Prête pour livraison
          </Button>
        )}
        {commande.statut === 'en_livraison' && (
          <span className="text-purple-600 text-sm font-medium flex items-center gap-2">
            <i className="ti ti-truck-delivery text-sm" /> En cours de livraison...
          </span>
        )}
      </div>
    </div>
  );
};

export default CommandeRecue;