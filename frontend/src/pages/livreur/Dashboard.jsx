import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { livraisonService } from '../../services/livraisonService';
import { formatPrix } from '../../utils/formatPrix';
import { tempsEcoule } from '../../utils/formatDate';
import api from '../../services/api';

const DashboardLivreur = () => {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();

  const [missions,      setMissions]      = useState([]);
  const [chargement,    setChargement]    = useState(true);
  const [disponible,    setDisponible]    = useState(false);
  const [toggleEnCours, setToggleEnCours] = useState(false);
  const [acceptEnCours, setAcceptEnCours] = useState(null);

  // Charger profil + missions au démarrage
  useEffect(() => {
    chargerDonnees();
    const interval = setInterval(chargerMissions, 30000);
    return () => clearInterval(interval);
  }, []);

  const chargerDonnees = async () => {
    setChargement(true);
    try {
      // Charger la disponibilité depuis le profil
      const profilRes = await api.get('/auth/profil');
      setDisponible(profilRes.data.utilisateur?.disponible || false);

      // Charger les missions
      await chargerMissions();
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setChargement(false);
    }
  };

  const chargerMissions = async () => {
    try {
      const res = await livraisonService.missionsDisponibles();
      setMissions(res.data.livraisons || []);
    } catch (err) {
      console.error('Erreur chargement missions:', err);
    }
  };

  // ✅ Toggle avec protection contre les clics multiples
  const toggleDisponibilite = async () => {
    if (toggleEnCours) return; // bloquer si déjà en cours
    setToggleEnCours(true);

    const nouvelleValeur = !disponible;
    // Mettre à jour l'UI immédiatement (optimistic update)
    setDisponible(nouvelleValeur);

    try {
      await api.put('/auth/profil', { disponible: nouvelleValeur });
      // Si disponible → recharger les missions
      if (nouvelleValeur) await chargerMissions();
    } catch (err) {
      // Revenir à l'ancienne valeur si erreur
      setDisponible(!nouvelleValeur);
      console.error('Erreur toggle disponibilité:', err);
      alert('Erreur lors du changement de disponibilité. Vérifiez votre connexion.');
    } finally {
      setToggleEnCours(false);
    }
  };

  const accepterMission = async (livraisonId) => {
    setAcceptEnCours(livraisonId);
    try {
      await livraisonService.accepterMission(livraisonId);
      navigate(`/livreur/mission/${livraisonId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'acceptation.');
      setAcceptEnCours(null);
    }
  };

  // ── LOADING ──
  if (chargement) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#FBF7F3',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid #FDF0E6',
          borderTopColor: '#D4600A',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#9C8E84', fontSize: 14 }}>Chargement des missions...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: '#FBF7F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── En-tête livreur ── */}
        <div style={{
          background: '#fff', border: '1px solid #E8DDD4',
          borderRadius: 20, padding: '22px 24px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 22, fontWeight: 700, color: '#16120E', marginBottom: 4,
              }}>
                Mon espace livreur
              </h1>
              <p style={{ fontSize: 14, color: '#9C8E84' }}>
                Bienvenue, <strong style={{ color: '#3D3026' }}>{utilisateur?.nom}</strong>
              </p>
            </div>

            {/* ── Toggle disponibilité ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                onClick={toggleDisponibilite}
                disabled={toggleEnCours}
                style={{
                  position: 'relative',
                  width: 52, height: 28,
                  background: disponible ? '#1D5C3A' : '#D8CDBF',
                  borderRadius: 14, border: 'none',
                  cursor: toggleEnCours ? 'not-allowed' : 'pointer',
                  transition: 'background 0.25s ease',
                  opacity: toggleEnCours ? 0.7 : 1,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 3, left: disponible ? 26 : 3,
                  width: 22, height: 22,
                  background: '#fff', borderRadius: '50%',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.25s ease',
                }} />
                {/* Spinner si en cours */}
                {toggleEnCours && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                  </div>
                )}
              </button>

              <span style={{
                fontSize: 12, fontWeight: 600,
                color: disponible ? '#1D5C3A' : '#9C8E84',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: disponible ? '#1D5C3A' : '#9C8E84',
                  animation: disponible ? 'gpsPulse 1.4s ease infinite' : 'none',
                }} />
                {disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>

          {/* Message selon statut */}
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: disponible ? '#EAF5EF' : '#FAF8F5',
            border: `1px solid ${disponible ? '#8ECBA8' : '#E8DDD4'}`,
            borderRadius: 12, fontSize: 13,
            color: disponible ? '#1D5C3A' : '#9C8E84',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className={`ti ${disponible ? 'ti-circle-check' : 'ti-info-circle'}`} style={{ fontSize: 16 }} />
            {disponible
              ? 'Vous recevez les nouvelles missions en temps réel.'
              : 'Activez votre disponibilité pour recevoir des missions.'}
          </div>
        </div>

        {/* ── Missions disponibles ── */}
        <div style={{
          background: '#fff', border: '1px solid #E8DDD4',
          borderRadius: 20, padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, color: '#16120E' }}>
              Missions disponibles
            </h2>
            {missions.length > 0 && (
              <span style={{
                background: '#FDF0E6', color: '#D4600A',
                border: '1px solid #EDBA8C', borderRadius: 20,
                padding: '3px 12px', fontSize: 13, fontWeight: 600,
              }}>
                {missions.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#9C8E84', marginBottom: 20 }}>
            Actualisé automatiquement toutes les 30 secondes
          </p>

          {/* Indisponible */}
          {!disponible && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{
                width: 64, height: 64,
                background: '#FAF8F5', border: '1px solid #E8DDD4',
                borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <i className="ti ti-moon" style={{ fontSize: 28, color: '#9C8E84' }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#3D3026', marginBottom: 6 }}>
                Vous êtes indisponible
              </p>
              <p style={{ fontSize: 14, color: '#9C8E84' }}>
                Activez votre disponibilité pour voir les missions
              </p>
            </div>
          )}

          {/* Disponible mais pas de missions */}
          {disponible && missions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{
                width: 64, height: 64,
                background: '#FDF0E6', border: '1px solid #EDBA8C',
                borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <i className="ti ti-motorbike" style={{ fontSize: 28, color: '#D4600A' }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#3D3026', marginBottom: 6 }}>
                Aucune mission disponible
              </p>
              <p style={{ fontSize: 14, color: '#9C8E84' }}>
                Les nouvelles commandes apparaîtront ici automatiquement
              </p>
            </div>
          )}

          {/* Liste missions */}
          {disponible && missions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {missions.map(mission => (
                <div key={mission.id} style={{
                  border: '1px solid #E8DDD4', borderRadius: 16, overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}>
                  {/* Restaurant */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8DDD4', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40,
                      background: '#FDF0E6', borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className="ti ti-building-store" style={{ fontSize: 20, color: '#D4600A' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#16120E', marginBottom: 2 }}>
                        {mission.commande?.restaurant?.nom}
                      </div>
                      <div style={{ fontSize: 13, color: '#9C8E84', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <i className="ti ti-map-pin" style={{ fontSize: 13, flexShrink: 0 }} />
                        {mission.commande?.restaurant?.adresse}
                      </div>
                    </div>
                    <i className="ti ti-arrow-narrow-right" style={{ fontSize: 20, color: '#D4600A', flexShrink: 0 }} />
                  </div>

                  {/* Client */}
                  <div style={{ padding: '12px 16px', background: '#FDF9F6', borderBottom: '1px solid #E8DDD4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <i className="ti ti-user" style={{ fontSize: 14, color: '#D4600A' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#16120E' }}>
                        {mission.commande?.client?.nom}
                      </span>
                      <span style={{ fontSize: 13, color: '#9C8E84' }}>
                        · {mission.commande?.client?.telephone}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <i className="ti ti-map-pin" style={{ fontSize: 14, color: '#D4600A', marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#9C8E84', lineHeight: 1.5 }}>
                        {mission.commande?.adresseLivraison}
                      </span>
                    </div>
                  </div>

                  {/* Infos + Bouton */}
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#9C8E84', marginBottom: 2 }}>Montant</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#16120E' }}>
                          {formatPrix(mission.commande?.montantTotal)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#9C8E84', marginBottom: 2 }}>Reçue</div>
                        <div style={{ fontSize: 13, color: '#3D3026' }}>
                          {tempsEcoule(mission.createdAt)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#9C8E84', marginBottom: 2 }}>Paiement</div>
                        <div style={{ fontSize: 13, color: '#3D3026', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className={`ti ${mission.commande?.modePaiement === 'en_ligne' ? 'ti-device-mobile' : 'ti-cash'}`} style={{ fontSize: 14 }} />
                          {mission.commande?.modePaiement === 'en_ligne' ? 'En ligne' : 'Cash'}
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={acceptEnCours === mission.id}
                      onClick={() => accepterMission(mission.id)}
                      style={{
                        width: '100%', padding: '12px',
                        background: acceptEnCours === mission.id ? '#E8846C' : '#D4600A',
                        color: '#fff', border: 'none', borderRadius: 12,
                        fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700,
                        cursor: acceptEnCours === mission.id ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 3px 12px rgba(212,96,10,0.3)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {acceptEnCours === mission.id
                        ? <><i className="ti ti-loader-2" style={{ fontSize: 18, animation: 'spin 0.7s linear infinite' }} /> Acceptation...</>
                        : <><i className="ti ti-motorbike" style={{ fontSize: 18 }} /> Accepter cette mission</>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes gpsPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
};

export default DashboardLivreur;