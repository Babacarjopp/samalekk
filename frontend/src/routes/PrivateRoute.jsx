import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const PrivateRoute = ({
  children,
  roles,
  allowEnAttente = false,
  allowPendingAccount = false,
}) => {
  const { chargement, estConnecte, utilisateur } = useAuth();

  if (chargement) {
    return <Loader texte="Vérification de la session..." />;
  }

  if (!estConnecte) {
    return <Navigate to="/connexion" replace />;
  }

  if (roles && !roles.includes(utilisateur?.role)) {
    return <Navigate to="/" replace />;
  }

  if (!allowPendingAccount) {
    if (utilisateur?.statut === 'suspendu') {
      return <Navigate to="/compte-en-attente" replace />;
    }

    if (utilisateur?.statut === 'en_attente' && !allowEnAttente) {
      if (utilisateur.role === 'restaurateur') {
        return <Navigate to="/restaurant/onboarding" replace />;
      }
      return <Navigate to="/compte-en-attente" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
