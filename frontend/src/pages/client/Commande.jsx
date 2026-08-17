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
        <div style={{ fontSize: 72, marginBottom: 20 }}></div>
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
    <div className="commande-page">
      <div className="commande-container">

        <h1 className="commande-title">
          Finaliser la commande
        </h1>

        <div className="commande-grid">

          {/* ── Formulaire gauche ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ÉTAPE 1 — Quartier */}
            <div className="commande-section">
              <div className="commande-section-header">
                <div className="step-number">1</div>
                <h2 className="commande-section-title">
                  Où livrer ?
                </h2>
              </div>

              {/* Sélecteur quartier */}
              <div className="form-group">
                <label className="form-label">
                  Choisissez votre quartier *
                </label>
                <select
                  value={quartierChoisi}
                  onChange={e => { setQuartierChoisi(e.target.value); setErreur(''); }}
                  className="form-select"
                >
                  <option value="">-- Sélectionnez votre quartier --</option>
                  {QUARTIERS.map(q => (
                    <option key={q.nom} value={q.nom}>{q.nom}</option>
                  ))}
                </select>
              </div>

              {/* Détail adresse */}
              <div className="form-group">
                <label className="form-label">
                  Précisez votre adresse (optionnel)
                </label>
                <textarea
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  placeholder="Ex : Près de la pharmacie, maison bleue, côté mosquée..."
                  rows={2}
                  className="form-textarea"
                />
                <p className="form-help">
                  Ajoutez des détails pour aider le livreur à vous trouver
                </p>
              </div>

              {/* Aperçu adresse + GPS */}
              {quartierChoisi && (
                <div className="adresse-preview">
                  <div className="adresse-preview-header">
                    <i className="ti ti-map-pin" />
                    Adresse de livraison
                  </div>
                  <div className="adresse-preview-text">{adresseLivraison}</div>

                  {/* Indicateur GPS */}
                  <div className="gps-indicator">
                    {gpsActif ? (
                      <>
                        <div className="gps-dot gps-active" />
                        <span className="gps-text gps-active">
                          GPS précis activé — position exacte transmise au livreur
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="gps-dot gps-inactive" />
                        <span className="gps-text gps-inactive">
                          Centre de {quartierChoisi} transmis au livreur
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ÉTAPE 2 — Paiement */}
            <div className="commande-section">
              <div className="commande-section-header">
                <div className="step-number">2</div>
                <h2 className="commande-section-title">
                  Mode de paiement
                </h2>
              </div>

              <div className="payment-options">
                {modesPaiement.map(mode => (
                  <button
                    key={mode.valeur}
                    type="button"
                    onClick={() => setModePaiement(mode.valeur)}
                    className={`payment-option ${modePaiement === mode.valeur ? 'selected' : ''}`}
                  >
                    <i className={`ti ${mode.icone} payment-icon`} />
                    <div className="payment-info">
                      <div className="payment-label">{mode.label}</div>
                      <div className="payment-desc">{mode.desc}</div>
                    </div>
                    {modePaiement === mode.valeur && (
                      <i className="ti ti-circle-check payment-check" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div className="error-message">
                <i className="ti ti-alert-circle" />
                {erreur}
              </div>
            )}
          </div>

          {/* ── Récapitulatif droite ── */}
          <div className="recapitulatif">
            <div className="recapitulatif-card">
              <div className="recapitulatif-header">
                <h3 className="recapitulatif-title">Récapitulatif</h3>
                <p className="recapitulatif-restaurant">
                  <i className="ti ti-building-store" />
                  {restaurantNom}
                </p>
              </div>

              {/* Articles */}
              <div className="recapitulatif-articles">
                {articles.map(a => (
                  <div key={a.id} className="recapitulatif-article">
                    <span className="article-name">{a.quantite}× {a.nom}</span>
                    <span className="article-price">
                      {(a.prix * a.quantite).toLocaleString()} F
                    </span>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="recapitulatif-totaux">
                <div className="total-line">
                  <span>Sous-total</span>
                  <span>{sousTotal.toLocaleString()} F</span>
                </div>
                <div className="total-line">
                  <span>Livraison</span>
                  <span>{FRAIS_LIVRAISON.toLocaleString()} F</span>
                </div>
                <div className="total-line total-final">
                  <span>Total</span>
                  <span className="total-amount">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Bouton commander */}
              <div className="recapitulatif-action">
                <button
                  onClick={handleSubmit}
                  disabled={chargement || !quartierChoisi}
                  className={`btn-commander ${!quartierChoisi ? 'disabled' : ''}`}
                >
                  {chargement
                    ? <><i className="ti ti-loader-2 loading-icon" /> Envoi...</>
                    : <><i className="ti ti-check" /> Confirmer la commande</>
                  }
                </button>
                {!quartierChoisi && (
                  <p className="btn-help">
                    Choisissez votre quartier pour commander
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .commande-page {
          background: #FBF7F3;
          min-height: 100vh;
        }

        .commande-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 16px;
        }

        @media (min-width: 768px) {
          .commande-container {
            padding: 32px 24px;
          }
        }

        .commande-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #16120E;
          margin-bottom: 20px;
        }

        @media (min-width: 768px) {
          .commande-title {
            font-size: 26px;
            margin-bottom: 28px;
          }
        }

        .commande-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .commande-grid {
            grid-template-columns: 1fr 340px;
            gap: 24px;
          }
        }

        .commande-section {
          background: #fff;
          border: 1px solid #E8DDD4;
          border-radius: 20px;
          padding: 18px 16px;
        }

        @media (min-width: 768px) {
          .commande-section {
            padding: 22px 24px;
          }
        }

        .commande-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (min-width: 768px) {
          .commande-section-header {
            margin-bottom: 18px;
          }
        }

        .step-number {
          width: 28px;
          height: 28px;
          background: #D4600A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .step-number {
            width: 30px;
            height: 30px;
            font-size: 14px;
          }
        }

        .commande-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #16120E;
        }

        @media (min-width: 768px) {
          .commande-section-title {
            font-size: 16px;
          }
        }

        .form-group {
          margin-bottom: 12px;
        }

        @media (min-width: 768px) {
          .form-group {
            margin-bottom: 14px;
          }
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #3D3026;
          margin-bottom: 6px;
        }

        @media (min-width: 768px) {
          .form-label {
            font-size: 13px;
            margin-bottom: 8px;
          }
        }

        .form-select {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #D8CDBF;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          color: #9C8E84;
          background: #FAF8F5;
          outline: none;
          appearance: none;
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .form-select {
            padding: 13px 16px;
            font-size: 15px;
          }
        }

        .form-select:focus {
          border-color: #D4600A;
        }

        .form-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #D8CDBF;
          border-radius: 12px;
          font-size: 13px;
          font-family: inherit;
          color: #16120E;
          background: #FAF8F5;
          outline: none;
          resize: none;
        }

        @media (min-width: 768px) {
          .form-textarea {
            padding: 13px 16px;
            font-size: 14px;
          }
        }

        .form-textarea:focus {
          border-color: #D4600A;
        }

        .form-help {
          font-size: 11px;
          color: #9C8E84;
          margin-top: 4px;
        }

        @media (min-width: 768px) {
          .form-help {
            font-size: 12px;
            margin-top: 5px;
          }
        }

        .adresse-preview {
          padding: 10px 12px;
          background: #FDF0E6;
          border: 1px solid #EDBA8C;
          border-radius: 12px;
          font-size: 12px;
          color: #7A3A10;
        }

        @media (min-width: 768px) {
          .adresse-preview {
            padding: 12px 14px;
            font-size: 13px;
          }
        }

        .adresse-preview-header {
          font-weight: 600;
          margin-bottom: 3;
          display: flex;
          align-items: center;
          gap: 6;
        }

        .adresse-preview-text {
          color: #3D3026;
        }

        .gps-indicator {
          margin-top: 6;
          display: flex;
          align-items: center;
          gap: 6;
          font-size: 11px;
        }

        @media (min-width: 768px) {
          .gps-indicator {
            margin-top: 8;
            font-size: 12px;
          }
        }

        .gps-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        @media (min-width: 768px) {
          .gps-dot {
            width: 7px;
            height: 7px;
          }
        }

        .gps-active {
          background: #1D5C3A;
        }

        .gps-inactive {
          background: #D4600A;
        }

        .gps-text {
          font-weight: 500;
        }

        .gps-text.gps-active {
          color: #1D5C3A;
        }

        .gps-text.gps-inactive {
          color: #D4600A;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 8;
        }

        @media (min-width: 768px) {
          .payment-options {
            gap: 10;
          }
        }

        .payment-option {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #E8DDD4;
          border-radius: 14px;
          text-align: left;
          background: #fff;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 12;
          transition: all 0.15s;
        }

        @media (min-width: 768px) {
          .payment-option {
            padding: 14px 18px;
            gap: 14;
          }
        }

        .payment-option.selected {
          border-color: #D4600A;
          background: #FDF0E6;
        }

        .payment-icon {
          font-size: 20px;
          color: #9C8E84;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .payment-icon {
            font-size: 24px;
          }
        }

        .payment-option.selected .payment-icon {
          color: #D4600A;
        }

        .payment-info {
          flex: 1;
        }

        .payment-label {
          font-size: 14px;
          font-weight: 600;
          color: #16120E;
          margin-bottom: 1;
        }

        @media (min-width: 768px) {
          .payment-label {
            font-size: 15px;
            margin-bottom: 2;
          }
        }

        .payment-desc {
          font-size: 12px;
          color: #9C8E84;
        }

        @media (min-width: 768px) {
          .payment-desc {
            font-size: 13px;
          }
        }

        .payment-check {
          font-size: 18px;
          color: #D4600A;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .payment-check {
            font-size: 20px;
          }
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10;
          padding: 12px 14px;
          background: #FCEAEA;
          border: 1px solid #EEB4B4;
          border-radius: 12px;
          color: #B83232;
          font-size: 13px;
        }

        @media (min-width: 768px) {
          .error-message {
            padding: 14px 18px;
            font-size: 14px;
          }
        }

        .recapitulatif {
          order: -1;
        }

        @media (min-width: 768px) {
          .recapitulatif {
            order: 1;
          }
        }

        .recapitulatif-card {
          background: #fff;
          border: 1px solid #E8DDD4;
          border-radius: 20px;
          overflow: hidden;
          position: sticky;
          top: 20px;
        }

        @media (min-width: 768px) {
          .recapitulatif-card {
            top: 24px;
          }
        }

        .recapitulatif-header {
          padding: 14px 16px;
          border-bottom: 1px solid #E8DDD4;
        }

        @media (min-width: 768px) {
          .recapitulatif-header {
            padding: 18px 20px;
          }
        }

        .recapitulatif-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #16120E;
          margin-bottom: 2;
        }

        @media (min-width: 768px) {
          .recapitulatif-title {
            font-size: 16px;
          }
        }

        .recapitulatif-restaurant {
          font-size: 12px;
          color: #9C8E84;
          display: flex;
          align-items: center;
          gap: 5;
        }

        @media (min-width: 768px) {
          .recapitulatif-restaurant {
            font-size: 13px;
          }
        }

        .recapitulatif-articles {
          padding: 12px 16px;
          border-bottom: 1px solid #E8DDD4;
          display: flex;
          flex-direction: column;
          gap: 6;
        }

        @media (min-width: 768px) {
          .recapitulatif-articles {
            padding: 14px 20px;
            gap: 8;
          }
        }

        .recapitulatif-article {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        @media (min-width: 768px) {
          .recapitulatif-article {
            font-size: 14px;
          }
        }

        .article-name {
          color: #3D3026;
        }

        .article-price {
          font-weight: 500;
          color: #16120E;
        }

        .recapitulatif-totaux {
          padding: 12px 16px;
          border-bottom: 1px solid #E8DDD4;
          display: flex;
          flex-direction: column;
          gap: 4;
        }

        @media (min-width: 768px) {
          .recapitulatif-totaux {
            padding: 14px 20px;
            gap: 6;
          }
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        @media (min-width: 768px) {
          .total-line {
            font-size: 14px;
          }
        }

        .total-line span:first-child {
          color: #9C8E84;
        }

        .total-line span:last-child {
          color: #3D3026;
        }

        .total-final {
          padding-top: 8;
          margin-top: 4;
          border-top: 1px solid #E8DDD4;
          font-size: 16px;
          font-weight: 700;
        }

        @media (min-width: 768px) {
          .total-final {
            padding-top: 10;
            font-size: 17px;
          }
        }

        .total-final span:first-child {
          color: #16120E;
        }

        .total-amount {
          color: #D4600A;
        }

        .recapitulatif-action {
          padding: 14px 16px;
        }

        @media (min-width: 768px) {
          .recapitulatif-action {
            padding: 16px 20px;
          }
        }

        .btn-commander {
          width: 100%;
          padding: 12px;
          background: #D4600A;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8;
          box-shadow: 0 4px 14px rgba(212,96,10,0.3);
          transition: all 0.15s;
        }

        @media (min-width: 768px) {
          .btn-commander {
            padding: 14px;
            font-size: 16px;
          }
        }

        .btn-commander.disabled {
          background: #E8846C;
          cursor: not-allowed;
        }

        .btn-help {
          font-size: 11px;
          color: #9C8E84;
          text-align: center;
          margin-top: 6px;
        }

        @media (min-width: 768px) {
          .btn-help {
            font-size: 12px;
            margin-top: 8px;
          }
        }

        .loading-icon {
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}