import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanier } from '../../context/PanierContext';
import { useAuth } from '../../context/AuthContext';
import { commandeService } from '../../services/commandeService';
import { formatPrix } from '../../utils/formatPrix';

const FRAIS_LIVRAISON = 500;

// Liste des quartiers de Touba avec coordonnées GPS
const QUARTIERS = [
  { nom: 'Darou Khoudoss',      lat: 14.8648, lng: -15.8833 },
  { nom: 'Darou Marnane',       lat: 14.8601, lng: -15.8798 },
  { nom: 'Darou Miname',        lat: 14.8623, lng: -15.8756 },
  { nom: 'Guédé',               lat: 14.8534, lng: -15.8823 },
  { nom: 'Keur Niang',          lat: 14.8489, lng: -15.8701 },
  { nom: 'Gouye Mbind',         lat: 14.8712, lng: -15.8867 },
  { nom: 'Ndamatou',            lat: 14.8578, lng: -15.8912 },
  { nom: 'Madiyana',            lat: 14.8445, lng: -15.8934 },
  { nom: 'Sam Sam',             lat: 14.8667, lng: -15.8745 },
  { nom: 'Touba Mosquée',       lat: 14.8631, lng: -15.8793 },
  { nom: 'Lampadaire',          lat: 14.8556, lng: -15.8756 },
  { nom: 'Darou Salam',         lat: 14.8523, lng: -15.8845 },
  { nom: 'Bagdad',              lat: 14.8734, lng: -15.8923 },
  { nom: 'Castors',             lat: 14.8612, lng: -15.8712 },
  { nom: 'Keur Mbaye Fall',     lat: 14.8489, lng: -15.8823 },
  { nom: 'Darou Karim',         lat: 14.8678, lng: -15.8812 },
  { nom: 'Ahmadou Bamba',       lat: 14.8545, lng: -15.8867 },
  { nom: 'Taïf',                lat: 14.8601, lng: -15.8934 },
  { nom: 'Université de Touba', lat: 14.8712, lng: -15.8756 },
];

const modesPaiement = [
  { valeur: 'en_ligne',       label: 'Payer en ligne',       icone: 'ti ti-mobile', desc: 'Wave ou Orange Money' },
  { valeur: 'a_la_livraison', label: 'Payer à la livraison', icone: 'ti ti-cash', desc: 'Cash au livreur' },
];

export default function Commande() {
  const navigate = useNavigate();
  const { articles, restaurantId, restaurantNom, sousTotal, viderPanier } = usePanier();

  const [quartierChoisi, setQuartierChoisi] = useState('');
  const [detail,         setDetail]         = useState('');
  const [modePaiement,   setModePaiement]   = useState('a_la_livraison');
  const [posGPS,         setPosGPS]         = useState(null);
  const [gpsActif,       setGpsActif]       = useState(false);
  const [chargement,     setChargement]     = useState(false);
  const [erreur,         setErreur]         = useState('');
  const [success,        setSuccess]        = useState(false);

  const total = sousTotal + FRAIS_LIVRAISON;

  // Tenter GPS réel en parallèle
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsActif(true);
        },
        () => setGpsActif(false)
      );
    }
  }, []);

  useEffect(() => {
    if (articles.length === 0 && !success) navigate('/restaurants');
  }, [articles]);

  // Quartier sélectionné
  const quartierData = QUARTIERS.find(q => q.nom === quartierChoisi);

  // Adresse finale = quartier + détail
  const adresseLivraison = quartierChoisi
    ? `${quartierChoisi}${detail ? `, ${detail}` : ''}, Touba` 
    : '';

  // Coordonnées : GPS réel si disponible, sinon centre du quartier choisi
  const coordonnees = {
    lat: posGPS?.lat || quartierData?.lat || null,
    lng: posGPS?.lng || quartierData?.lng || null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quartierChoisi) {
      setErreur('Veuillez choisir votre quartier.');
      return;
    }
    setChargement(true);
    setErreur('');
    try {
      await commandeService.passer({
        restaurantId,
        plats:              articles.map(a => ({ platId: a.id, quantite: a.quantite })),
        adresseLivraison,
        latitudeLivraison:  coordonnees.lat,
        longitudeLivraison: coordonnees.lng,
        modePaiement,
      });
      viderPanier();
      setSuccess(true);
      setTimeout(() => navigate('/mes-commandes'), 2500);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la commande.');
    } finally {
      setChargement(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF7F3' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 700, color: '#16120E', marginBottom: 10 }}>
          Commande envoyée !
        </h2>
        <p style={{ fontSize: 15, color: '#9C8E84' }}>
          Le restaurant a été notifié. Vous allez être redirigé...
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#FBF7F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 700, color: '#16120E', marginBottom: 28 }}>
          Finaliser la commande
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

          {/* ── Formulaire gauche ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ÉTAPE 1 — Quartier */}
            <div style={{ background: '#fff', border: '1px solid #E8DDD4', borderRadius: 20, padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, background: '#D4600A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>
                  1
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: '#16120E' }}>
                  Où livrer ?
                </h2>
              </div>

              {/* Sélecteur quartier */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3D3026', marginBottom: 8 }}>
                  Choisissez votre quartier *
                </label>
                <select
                  value={quartierChoisi}
                  onChange={e => { setQuartierChoisi(e.target.value); setErreur(''); }}
                  style={{
                    width: '100%', padding: '13px 16px',
                    border: `1px solid ${quartierChoisi ? '#D4600A' : '#D8CDBF'}`,
                    borderRadius: 12, fontSize: 15,
                    fontFamily: 'inherit', color: quartierChoisi ? '#16120E' : '#9C8E84',
                    background: '#FAF8F5', outline: 'none',
                    appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">-- Sélectionnez votre quartier --</option>
                  {QUARTIERS.map(q => (
                    <option key={q.nom} value={q.nom}>{q.nom}</option>
                  ))}
                </select>
              </div>

              {/* Détail adresse */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3D3026', marginBottom: 8 }}>
                  Précisez votre adresse (optionnel)
                </label>
                <textarea
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  placeholder="Ex : Près de la pharmacie, maison bleue, côté mosquée..."
                  rows={2}
                  style={{
                    width: '100%', padding: '13px 16px',
                    border: '1px solid #D8CDBF', borderRadius: 12,
                    fontSize: 14, fontFamily: 'inherit',
                    color: '#16120E', background: '#FAF8F5',
                    outline: 'none', resize: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#D4600A'}
                  onBlur={e => e.target.style.borderColor = '#D8CDBF'}
                />
                <p style={{ fontSize: 12, color: '#9C8E84', marginTop: 5 }}>
                  Ajoutez des détails pour aider le livreur à vous trouver
                </p>
              </div>

              {/* Aperçu adresse + GPS */}
              {quartierChoisi && (
                <div style={{
                  padding: '12px 14px',
                  background: '#FDF0E6', border: '1px solid #EDBA8C',
                  borderRadius: 12, fontSize: 13, color: '#7A3A10',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 15 }} />
                    Adresse de livraison
                  </div>
                  <div style={{ color: '#3D3026' }}>{adresseLivraison}</div>

                  {/* Indicateur GPS */}
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    {gpsActif ? (
                      <>
                        <div style={{ width: 7, height: 7, background: '#1D5C3A', borderRadius: '50%' }} />
                        <span style={{ color: '#1D5C3A', fontWeight: 500 }}>
                          GPS précis activé — position exacte transmise au livreur
                        </span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 7, height: 7, background: '#D4600A', borderRadius: '50%' }} />
                        <span style={{ color: '#D4600A', fontWeight: 500 }}>
                          Centre de {quartierChoisi} transmis au livreur
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ÉTAPE 2 — Paiement */}
            <div style={{ background: '#fff', border: '1px solid #E8DDD4', borderRadius: 20, padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, background: '#D4600A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>
                  2
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: '#16120E' }}>
                  Mode de paiement
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {modesPaiement.map(mode => (
                  <button
                    key={mode.valeur}
                    type="button"
                    onClick={() => setModePaiement(mode.valeur)}
                    style={{
                      width: '100%', padding: '14px 18px',
                      border: `1.5px solid ${modePaiement === mode.valeur ? '#D4600A' : '#E8DDD4'}`,
                      borderRadius: 14, textAlign: 'left',
                      background: modePaiement === mode.valeur ? '#FDF0E6' : '#fff',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'all 0.15s',
                    }}
                  >
                    <i className={`ti ${mode.icone}`} style={{ fontSize: 24, color: modePaiement === mode.valeur ? '#D4600A' : '#9C8E84', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#16120E', marginBottom: 2 }}>
                        {mode.label}
                      </div>
                      <div style={{ fontSize: 13, color: '#9C8E84' }}>{mode.desc}</div>
                    </div>
                    {modePaiement === mode.valeur && (
                      <i className="ti ti-circle-check" style={{ fontSize: 20, color: '#D4600A', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 18px',
                background: '#FCEAEA', border: '1px solid #EEB4B4',
                borderRadius: 12, color: '#B83232', fontSize: 14,
              }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 18, flexShrink: 0 }} />
                {erreur}
              </div>
            )}
          </div>

          {/* ── Récapitulatif droite ── */}
          <div>
            <div style={{
              background: '#fff', border: '1px solid #E8DDD4',
              borderRadius: 20, overflow: 'hidden',
              position: 'sticky', top: 24,
            }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #E8DDD4' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: '#16120E', marginBottom: 3 }}>
                  Récapitulatif
                </h3>
                <p style={{ fontSize: 13, color: '#9C8E84', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="ti ti-building-store" style={{ fontSize: 14 }} />
                  {restaurantNom}
                </p>
              </div>

              {/* Articles */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8DDD4', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {articles.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#3D3026' }}>{a.quantite}× {a.nom}</span>
                    <span style={{ fontWeight: 500, color: '#16120E' }}>
                      {(a.prix * a.quantite).toLocaleString()} F
                    </span>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8DDD4', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#9C8E84' }}>Sous-total</span>
                  <span style={{ color: '#3D3026' }}>{sousTotal.toLocaleString()} F</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#9C8E84' }}>Livraison</span>
                  <span style={{ color: '#3D3026' }}>{FRAIS_LIVRAISON.toLocaleString()} F</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, paddingTop: 10, marginTop: 4, borderTop: '1px solid #E8DDD4' }}>
                  <span style={{ color: '#16120E' }}>Total</span>
                  <span style={{ color: '#D4600A' }}>{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Bouton commander */}
              <div style={{ padding: '16px 20px' }}>
                <button
                  onClick={handleSubmit}
                  disabled={chargement || !quartierChoisi}
                  style={{
                    width: '100%', padding: '14px',
                    background: chargement || !quartierChoisi ? '#E8846C' : '#D4600A',
                    color: '#fff', border: 'none', borderRadius: 14,
                    fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700,
                    cursor: chargement || !quartierChoisi ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(212,96,10,0.3)',
                    transition: 'all 0.15s',
                  }}
                >
                  {chargement
                    ? <><i className="ti ti-loader-2" style={{ fontSize: 18, animation: 'spin 0.7s linear infinite' }} /> Envoi...</>
                    : <><i className="ti ti-check" style={{ fontSize: 18 }} /> Confirmer la commande</>
                  }
                </button>
                {!quartierChoisi && (
                  <p style={{ fontSize: 12, color: '#9C8E84', textAlign: 'center', marginTop: 8 }}>
                    Choisissez votre quartier pour commander
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}