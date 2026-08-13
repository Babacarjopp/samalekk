import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { livraisonService } from '../../services/livraisonService';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import CarteGPS from '../../components/livreur/CarteGPS';

const Mission = () => {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { utilisateur } = useAuth();
  const { connecte, emettre, ecouter } = useSocket();

  const [livraison,     setLivraison]     = useState(null);
  const [chargement,    setChargement]    = useState(true);
  const [envoi,         setEnvoi]         = useState(false);
  const [posLivreur,    setPosLivreur]    = useState(null);
  const [posClientLive, setPosClientLive] = useState(null);
  const [gpsActif,      setGpsActif]      = useState(false);
  const watchRef = useRef(null);

  useEffect(() => {
    chargerLivraison();
    demarrerGPS();

    if (connecte) emettre('livreur:suivre', id);

    const desecouter = ecouter('client:position:update', (data) => {
      if (data.livraisonId === id) {
        setPosClientLive({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      desecouter();
    };
  }, [id, connecte]);

  const chargerLivraison = async () => {
    try {
      const res = await livraisonService.missionLivreur(id);
      setLivraison(res.data.livraison);
    } catch (err) {
      console.error('Erreur chargement livraison:', err);
    } finally {
      setChargement(false);
    }
  };

  const demarrerGPS = () => {
    if (!navigator.geolocation) return;

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosLivreur({ lat, lng });
        setGpsActif(true);

        try {
          await livraisonService.mettreAJourPosition({ lat, lng, livraisonId: id });
          if (connecte) {
            emettre('livreur:position', {
              livraisonId: id,
              lat,
              lng,
              livreurId: utilisateur?.id,
            });
          }
        } catch (err) {
          console.error('Erreur envoi position:', err);
        }
      },
      (err) => {
        console.warn('GPS indisponible:', err);
        setGpsActif(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const confirmerRecuperation = async () => {
    setEnvoi(true);
    try {
      await livraisonService.confirmerRecup(id);
      await chargerLivraison();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la confirmation.');
    } finally {
      setEnvoi(false);
    }
  };

  const confirmerLivraison = async () => {
    setEnvoi(true);
    try {
      await livraisonService.confirmerLivraison(id);
      await chargerLivraison();
      setTimeout(() => navigate('/livreur/dashboard'), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la confirmation.');
    } finally {
      setEnvoi(false);
    }
  };

  // ── CHARGEMENT ──
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
        <p style={{ color: '#9C8E84', fontSize: 14 }}>Chargement de la mission...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── MISSION INTROUVABLE ──
  if (!livraison) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ color: '#9C8E84', fontSize: 15 }}>Mission introuvable.</p>
    </div>
  );

  const commande = livraison.commande;
  const etape    = { acceptee: 1, recuperee: 2, livree: 3 }[livraison.statut] || 1;

  // Position client : live (Socket.io) en priorité, sinon GPS sauvegardé à la commande
  const positionClient =
    posClientLive ||
    (commande?.latitudeLivraison && commande?.longitudeLivraison
      ? {
          lat: parseFloat(commande.latitudeLivraison),
          lng: parseFloat(commande.longitudeLivraison),
        }
      : null);

  // Position restaurant si coordonnées disponibles en base
  const positionRestaurant =
    commande?.restaurant?.latitude && commande?.restaurant?.longitude
      ? {
          lat: parseFloat(commande.restaurant.latitude),
          lng: parseFloat(commande.restaurant.longitude),
        }
      : null;

  return (
    <div style={{ background: '#FBF7F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── En-tête + Progression ── */}
        <div style={{
          background: '#fff', border: '1px solid #E8DDD4',
          borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E8DDD4' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 12,
            }}>
              <div>
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 17, fontWeight: 700, color: '#16120E',
                }}>
                  Mission en cours
                </div>
                <div style={{ fontSize: 13, color: '#9C8E84', marginTop: 2 }}>
                  Étape {etape} / 3
                </div>
              </div>

              {/* Badge GPS actif */}
              {gpsActif && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px',
                  background: '#EAF5EF', border: '1px solid #8ECBA8',
                  borderRadius: 20,
                }}>
                  <div style={{
                    width: 8, height: 8,
                    background: '#1D5C3A', borderRadius: '50%',
                    animation: 'gpsPulse 1.4s ease infinite',
                  }} />
                  <span style={{ fontSize: 12, color: '#1D5C3A', fontWeight: 500 }}>
                    GPS actif
                  </span>
                </div>
              )}
            </div>

            {/* Barre de progression */}
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  flex: 1, height: 5, borderRadius: 3,
                  background: n <= etape ? '#D4600A' : '#E8DDD4',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {['Acceptée', 'Récupérée', 'Livrée'].map((lbl, i) => (
                <span key={lbl} style={{
                  fontSize: 11,
                  color: i + 1 <= etape ? '#D4600A' : '#9C8E84',
                  fontWeight: i + 1 <= etape ? 600 : 400,
                }}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          {/* ── Carte GPS ── */}
          <CarteGPS
            positionLivreur={posLivreur}
            positionRestaurant={positionRestaurant}
            positionClient={positionClient}
            nomLivreur={utilisateur?.nom || 'Vous'}
            nomRestaurant={commande?.restaurant?.nom || 'Restaurant'}
            hauteur="300px"
          />
        </div>

        {/* ── Statut GPS client ── */}
        {positionClient ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            background: '#EAF5EF', border: '1px solid #8ECBA8',
            borderRadius: 14, marginBottom: 12,
          }}>
            <i className="ti ti-map-pin-check" style={{ fontSize: 18, color: '#1D5C3A' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1D5C3A' }}>
                Position GPS du client disponible
              </div>
              <div style={{ fontSize: 12, color: '#1D5C3A', opacity: 0.8 }}>
                Le marker 🏠 sur la carte indique sa position exacte
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            background: '#FFF8E6', border: '1px solid #E8D080',
            borderRadius: 14, marginBottom: 12,
          }}>
            <i className="ti ti-map-pin-off" style={{ fontSize: 18, color: '#9A6D00' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#9A6D00' }}>
                Pas de position GPS client
              </div>
              <div style={{ fontSize: 12, color: '#9A6D00', opacity: 0.8 }}>
                Utilisez l'adresse ci-dessous pour livrer
              </div>
            </div>
          </div>
        )}

        {/* ── Infos Restaurant ── */}
        <div style={{
          background: '#fff', border: '1px solid #E8DDD4',
          borderRadius: 20, padding: '18px 20px', marginBottom: 12,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#9C8E84',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
          }}>
            📍 Récupérer chez
          </div>
          <div style={{
            fontSize: 17, fontWeight: 700, color: '#16120E',
            marginBottom: 4, fontFamily: 'Outfit, sans-serif',
          }}>
            {commande?.restaurant?.nom}
          </div>
          <div style={{ fontSize: 14, color: '#9C8E84', marginBottom: 14 }}>
            {commande?.restaurant?.adresse}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Appeler le restaurant */}
            {commande?.restaurant?.telephone && (
              <a
                href={`tel:${commande.restaurant.telephone}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px',
                  background: '#FDF0E6', color: '#D4600A',
                  border: '1px solid #EDBA8C', borderRadius: 22,
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}
              >
                <i className="ti ti-phone" style={{ fontSize: 15 }} />
                Appeler
              </a>
            )}

            {/* Google Maps restaurant */}
            {positionRestaurant && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${positionRestaurant.lat},${positionRestaurant.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px',
                  background: '#EDF2FF', color: '#2F5BE8',
                  border: '1px solid #C0CCFF', borderRadius: 22,
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}
              >
                <i className="ti ti-map-2" style={{ fontSize: 15 }} />
                Google Maps
              </a>
            )}
          </div>
        </div>

        {/* ── Infos Client ── */}
        <div style={{
          background: '#fff', border: '1px solid #E8DDD4',
          borderRadius: 20, padding: '18px 20px', marginBottom: 20,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#9C8E84',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
          }}>
            🏠 Livrer chez
          </div>
          <div style={{
            fontSize: 17, fontWeight: 700, color: '#16120E',
            marginBottom: 4, fontFamily: 'Outfit, sans-serif',
          }}>
            {commande?.client?.nom}
          </div>
          <div style={{ fontSize: 14, color: '#9C8E84', marginBottom: 14 }}>
            {commande?.adresseLivraison}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Appeler le client */}
            {commande?.client?.telephone && (
              <a
                href={`tel:${commande.client.telephone}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px',
                  background: '#EAF5EF', color: '#1D5C3A',
                  border: '1px solid #8ECBA8', borderRadius: 22,
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}
              >
                <i className="ti ti-phone" style={{ fontSize: 15 }} />
                Appeler
              </a>
            )}

            {/* Google Maps client */}
            {positionClient && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${positionClient.lat},${positionClient.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px',
                  background: '#EDF2FF', color: '#2F5BE8',
                  border: '1px solid #C0CCFF', borderRadius: 22,
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}
              >
                <i className="ti ti-map-2" style={{ fontSize: 15 }} />
                Google Maps
              </a>
            )}
          </div>
        </div>

        {/* ── Bouton Étape 1 : Confirmer récupération ── */}
        {livraison.statut === 'acceptee' && (
          <button
            disabled={envoi}
            onClick={confirmerRecuperation}
            style={{
              width: '100%', padding: 16,
              background: envoi ? '#E8846C' : '#D4600A',
              color: '#fff', border: 'none', borderRadius: 16,
              fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700,
              cursor: envoi ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 16px rgba(212,96,10,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {envoi
              ? <i className="ti ti-loader-2" style={{ fontSize: 20, animation: 'spin 0.7s linear infinite' }} />
              : <i className="ti ti-circle-check" style={{ fontSize: 20 }} />
            }
            J'ai récupéré la commande
          </button>
        )}

        {/* ── Bouton Étape 2 : Confirmer livraison ── */}
        {livraison.statut === 'recuperee' && (
          <button
            disabled={envoi}
            onClick={confirmerLivraison}
            style={{
              width: '100%', padding: 16,
              background: envoi ? '#4A8C6A' : '#1D5C3A',
              color: '#fff', border: 'none', borderRadius: 16,
              fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700,
              cursor: envoi ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 16px rgba(29,92,58,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {envoi
              ? <i className="ti ti-loader-2" style={{ fontSize: 20, animation: 'spin 0.7s linear infinite' }} />
              : <i className="ti ti-package-check" style={{ fontSize: 20 }} />
            }
            Livraison effectuée — Confirmer
          </button>
        )}

        {/* ── Étape 3 : Mission terminée ── */}
        {livraison.statut === 'livree' && (
          <div style={{
            background: '#EAF5EF', border: '1px solid #8ECBA8',
            borderRadius: 20, padding: '40px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}></div>
            <div style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 22, fontWeight: 700, color: '#1D5C3A', marginBottom: 8,
            }}>
              Mission accomplie !
            </div>
            <p style={{ fontSize: 14, color: '#1D5C3A', opacity: 0.8 }}>
              Retour au tableau de bord...
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes gpsPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
};

export default Mission;