import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PanierProvider } from './context/PanierContext';
import PrivateRoute from './routes/PrivateRoute';
import Navbar from './components/common/Navbar';

// Pages Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages Client
import Accueil      from './pages/client/Accueil';
import Restaurants  from './pages/client/Restaurants';
import Menu         from './pages/client/Menu';
import Commande     from './pages/client/Commande';
import Paiement     from './pages/client/Paiement';
import Suivi        from './pages/client/Suivi';

// Pages Restaurateur
import DashboardResto  from './pages/restaurateur/Dashboard';
import GestionMenu     from './pages/restaurateur/GestionMenu';
import CommandesResto  from './pages/restaurateur/Commandes';
import CreerRestaurant from './pages/restaurateur/CreerRestaurant';

// Pages Auth statut
import CompteEnAttente from './pages/auth/CompteEnAttente';

// Pages Livreur
import DashboardLivreur from './pages/livreur/Dashboard';
import Mission          from './pages/livreur/Mission';

// Pages Admin
import DashboardAdmin   from './pages/admin/Dashboard';
import Utilisateurs     from './pages/admin/Utilisateurs';
import Statistiques     from './pages/admin/Statistiques';

// Composant layout avec Navbar
const Layout = ({ children, avecNavbar = true }) => (
  <div className="min-h-screen bg-[#F5EFE8]">
    {avecNavbar && <Navbar />}
    <main>{children}</main>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PanierProvider>
          <Routes>

            {/* ── Pages publiques ── */}
            <Route path="/" element={
              <Layout><Accueil /></Layout>
            }/>

            <Route path="/restaurants" element={
              <Layout><Restaurants /></Layout>
            }/>

            <Route path="/restaurants/:id/menu" element={
              <Layout><Menu /></Layout>
            }/>

            {/* ── Auth (sans navbar) ── */}
            <Route path="/connexion"  element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/compte-en-attente" element={
              <PrivateRoute allowPendingAccount>
                <CompteEnAttente />
              </PrivateRoute>
            } />

            {/* ── Client ── */}
            <Route path="/panier" element={
              <PrivateRoute roles={['client']}>
                <Layout><Commande /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/paiement/:commandeId" element={
              <PrivateRoute roles={['client']}>
                <Layout><Paiement /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/mes-commandes" element={
              <PrivateRoute roles={['client']}>
                <Layout><Suivi /></Layout>
              </PrivateRoute>
            }/>

            {/* ── Restaurateur ── */}
            <Route path="/restaurant/onboarding" element={
              <PrivateRoute roles={['restaurateur']} allowEnAttente>
                <Layout><CreerRestaurant /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/restaurant/dashboard" element={
              <PrivateRoute roles={['restaurateur']}>
                <Layout><DashboardResto /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/restaurant/menu" element={
              <PrivateRoute roles={['restaurateur']}>
                <Layout><GestionMenu /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/restaurant/commandes" element={
              <PrivateRoute roles={['restaurateur']}>
                <Layout><CommandesResto /></Layout>
              </PrivateRoute>
            }/>

            {/* ── Livreur ── */}
            <Route path="/livreur/dashboard" element={
              <PrivateRoute roles={['livreur']}>
                <Layout><DashboardLivreur /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/livreur/mission/:id" element={
              <PrivateRoute roles={['livreur']}>
                <Layout><Mission /></Layout>
              </PrivateRoute>
            }/>

            {/* ── Admin ── */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute roles={['admin']}>
                <Layout><DashboardAdmin /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/admin/utilisateurs" element={
              <PrivateRoute roles={['admin']}>
                <Layout><Utilisateurs /></Layout>
              </PrivateRoute>
            }/>

            <Route path="/admin/statistiques" element={
              <PrivateRoute roles={['admin']}>
                <Layout><Statistiques /></Layout>
              </PrivateRoute>
            }/>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </PanierProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;