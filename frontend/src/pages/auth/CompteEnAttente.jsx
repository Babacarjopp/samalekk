import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CompteEnAttente = () => {
  const { utilisateur, seDeconnecter } = useAuth();

  const estRestaurateur = utilisateur?.role === 'restaurateur';
  const estLivreur = utilisateur?.role === 'livreur';

  return (
    <div className="auth-page">
      <div className="auth-box anim">
        <div className="auth-logo">
          <div className="auth-logo-ico">
            <span className="text-3xl">⏳</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-head">
            <h1>Validation en cours</h1>
            <p>
              Bonjour {utilisateur?.nom}, votre compte est en cours de vérification.
            </p>
          </div>

          <div className="alert alert-info">
            <i className="ti ti-info-circle" />
            {estRestaurateur && (
              <span>
                Un administrateur doit valider votre compte et votre restaurant
                avant que vous puissiez recevoir des commandes.
              </span>
            )}
            {estLivreur && (
              <span>
                Un administrateur doit valider votre compte avant que vous puissiez
                accepter des missions de livraison.
              </span>
            )}
            {!estRestaurateur && !estLivreur && (
              <span>Votre compte sera activé sous peu.</span>
            )}
          </div>

          {estRestaurateur && (
            <Link to="/restaurant/onboarding" className="btn btn-orange-soft btn-full">
              Voir mon inscription restaurant
            </Link>
          )}

          <div className="row-c gap-12" style={{ marginTop: '1rem' }}>
            <Link to="/" className="btn btn-ghost btn-full">
              Retour à l'accueil
            </Link>
            <button type="button" onClick={seDeconnecter} className="btn btn-ghost btn-full">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompteEnAttente;
