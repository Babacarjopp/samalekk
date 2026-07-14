import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePanier } from '../../context/PanierContext';

const Navbar = () => {
  const { utilisateur, estConnecte, seDeconnecter } = useAuth();
  const { nombreArticles } = usePanier();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fermer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOuvert(false);
    };
    document.addEventListener('mousedown', fermer);
    return () => document.removeEventListener('mousedown', fermer);
  }, []);

  const handleDeconnexion = () => {
    seDeconnecter();
    setMenuOuvert(false);
    navigate('/');
  };

  const lienDashboard = {
    client:       '/mes-commandes',
    restaurateur: '/restaurant/dashboard',
    livreur:      '/livreur/dashboard',
    admin:        '/admin/dashboard'
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-ico">
            <i className="ti ti-bowl-chopsticks" />
          </div>
          <div className="nav-logo-text">
            <strong>Sama</strong>
            <span>Lekk</span>
          </div>
        </Link>

        {/* Liens centre */}
        <div className="nav-links">
          <Link to="/restaurants" className="nav-link">Restos</Link>
          {estConnecte && utilisateur?.role !== 'client' && (
            <Link to={lienDashboard[utilisateur?.role]} className="nav-link">
              Compte
            </Link>
          )}
        </div>

        {/* Actions droite */}
        <div className="nav-right">

          {/* Panier client */}
          {estConnecte && utilisateur?.role === 'client' && (
            <Link to="/panier" className="nav-cart">
              <i className="ti ti-shopping-cart" />
              {nombreArticles > 0 && (
                <span className="nav-cart-dot">{nombreArticles}</span>
              )}
            </Link>
          )}

          {estConnecte ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                className="nav-avatar"
                onClick={() => setMenuOuvert(!menuOuvert)}
              >
                {utilisateur?.nom?.charAt(0).toUpperCase()}
              </button>

              {menuOuvert && (
                <div className="nav-dropdown">
                  <div className="nav-dd-user">
                    <div className="nav-dd-name">{utilisateur?.nom}</div>
                    <div className="nav-dd-role capitalize">{utilisateur?.role}</div>
                  </div>

                  {lienDashboard[utilisateur?.role] && (
                    <Link
                      to={lienDashboard[utilisateur?.role]}
                      className="nav-dd-item"
                      onClick={() => setMenuOuvert(false)}
                    >
                      <i className="ti ti-layout-dashboard" />
                      Mon compte
                    </Link>
                  )}

                  <button className="nav-dd-item red" onClick={handleDeconnexion}>
                    <i className="ti ti-logout" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="row gap-8">
              <Link to="/connexion" className="nav-link">Connexion</Link>
              <Link to="/inscription">
                <button className="btn btn-primary btn-sm">S'inscrire</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
