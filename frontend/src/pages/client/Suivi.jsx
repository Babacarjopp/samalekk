import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commandeService } from '../../services/commandeService';
import { formatPrix } from '../../utils/formatPrix';
import { formatDate, tempsEcoule } from '../../utils/formatDate';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import SuiviLivraison from '../../components/client/SuiviLivraison';

const statutsConfig = {
  en_attente:     { label: 'En attente',     couleur: 'bg-yellow-100 text-yellow-700', icone: 'ti ti-clock' },
  confirmee:      { label: 'Confirmée',      couleur: 'bg-blue-100 text-blue-700',    icone: 'ti ti-check' },
  en_preparation: { label: 'En préparation', couleur: 'bg-orange-100 text-orange-700',icone: 'ti ti-flame' },
  en_livraison:   { label: 'En livraison',   couleur: 'bg-purple-100 text-purple-700',icone: 'ti ti-truck-delivery' },
  livree:         { label: 'Livrée',         couleur: 'bg-green-100 text-green-700',  icone: 'ti ti-flag' },
  annulee:        { label: 'Annulée',        couleur: 'bg-red-100 text-red-700',      icone: 'ti ti-alert-circle' },
};

const Suivi = () => {
  const [commandes,   setCommandes]   = useState([]);
  const [chargement,  setChargement]  = useState(true);
  const [commandeNote, setCommandeNote] = useState(null);
  const [note,        setNote]        = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [envoi,       setEnvoi]       = useState(false);

  useEffect(() => {
    chargerCommandes();
  }, []);

  const chargerCommandes = async () => {
    try {
      const res = await commandeService.mesCommandes();
      setCommandes(res.data.commandes);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const soumettreNote = async () => {
    setEnvoi(true);
    try {
      await commandeService.noter(commandeNote.id, { note, commentaire });
      setCommandeNote(null);
      chargerCommandes();
    } catch (err) {
      console.error(err);
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <Loader texte="Chargement de vos commandes..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes commandes</h1>
      <p className="text-gray-500 mb-8">
        {commandes.length} commande{commandes.length > 1 ? 's' : ''} au total
      </p>

      {commandes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">
            <i className="ti ti-shopping-cart" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Aucune commande pour l'instant
          </h3>
          <p className="text-gray-400 mb-6">
            Découvrez nos restaurants et passez votre première commande !
          </p>
          <a href="/restaurants" className="btn-primaire inline-flex">
            Découvrir les restaurants
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {commandes.map(commande => {
            const statut = statutsConfig[commande.statut] || statutsConfig.en_attente;
            return (
              <div key={commande.id} className="carte p-5 animer">

                {/* En-tête commande */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">
                        {commande.restaurant?.nom}
                      </h3>
                      <span className={`badge-statut ${statut.couleur} inline-flex items-center gap-2`}>
                        <i className={`${statut.icone} text-sm`} /> {statut.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {tempsEcoule(commande.createdAt)} · {formatDate(commande.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600 text-lg">
                      {formatPrix(commande.montantTotal)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      dont {formatPrix(commande.fraisLivraison)} livraison
                    </div>
                  </div>
                </div>

                {/* Articles commandés */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                    Articles commandés
                  </h4>
                  <div className="space-y-2">
                    {commande.lignes?.map(ligne => (
                      <div key={ligne.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {ligne.quantite}× {ligne.plat?.nom}
                        </span>
                        <span className="font-medium text-gray-800">
                          {formatPrix(ligne.sousTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paiement en attente */}
                {commande.statut === 'en_attente' && commande.modePaiement === 'en_ligne' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4
                                  flex items-center justify-between gap-4">
                    <div className="text-sm text-yellow-800">
                      <span className="font-semibold inline-flex items-center gap-2">
                        <i className="ti ti-clock text-sm" /> Paiement en attente
                      </span>
                      <p className="text-yellow-700 mt-0.5">
                        Finalisez votre paiement pour confirmer la commande.
                      </p>
                    </div>
                    <Link
                      to={`/paiement/${commande.id}`}
                      className="btn btn-primary btn-sm shrink-0 whitespace-nowrap"
                    >
                      Payer maintenant
                    </Link>
                  </div>
                )}

                {/* Infos livraison */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <i className="ti ti-map-pin text-sm" /> {commande.adresseLivraison}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ti ti-credit-card text-sm" /> {commande.modePaiement === 'en_ligne' ? 'Payé en ligne' : 'Paiement à la livraison'}
                  </span>
                  {commande.livraison?.livreur && (
                    <span className="flex items-center gap-1">
                      <i className="ti ti-truck-delivery text-sm" /> {commande.livraison.livreur.nom}
                    </span>
                  )}
                </div>

                {/* Suivi GPS temps réel */}
                {commande.livraison?.livreur &&
                  ['acceptee', 'recuperee'].includes(commande.livraison.statut) && (
                  <div className="mb-4">
                    <SuiviLivraison
                      livraisonId={commande.livraison.id}
                      positionClient={
                        commande.latitudeLivraison && commande.longitudeLivraison
                          ? { lat: commande.latitudeLivraison, lng: commande.longitudeLivraison }
                          : null
                      }
                    />
                  </div>
                )}

                {/* Bouton noter */}
                {commande.statut === 'livree' && !commande.note && (
                  <Button
                    variante="secondaire"
                    taille="sm"
                    onClick={() => setCommandeNote(commande)}
                  >
                    <i className="ti ti-star text-base" /> Noter cette commande
                  </Button>
                )}

                {/* Note déjà donnée */}
                {commande.note && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <span className="flex items-center gap-1">
                      {Array.from({ length: commande.note }, (_, index) => (
                        <i key={index} className="ti ti-star text-amber-400" />
                      ))}
                    </span>
                    <span className="text-gray-500">{commande.commentaire}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal notation */}
      <Modal
        estOuvert={!!commandeNote}
        onFermer={() => setCommandeNote(null)}
        titre="Noter votre commande"
      >
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Comment était votre commande chez{' '}
              <strong>{commandeNote?.restaurant?.nom}</strong> ?
            </p>

            {/* Étoiles */}
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setNote(n)}
                  className={`text-4xl transition-transform hover:scale-110
                              ${n <= note ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              {note === 1 && 'Très mauvais'}
              {note === 2 && 'Mauvais'}
              {note === 3 && 'Correct'}
              {note === 4 && 'Bien'}
              {note === 5 && 'Excellent !'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              className="champ resize-none"
            />
          </div>

          <Button
            variante="primaire"
            chargement={envoi}
            onClick={soumettreNote}
            className="w-full"
          >
            Envoyer mon avis
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Suivi;