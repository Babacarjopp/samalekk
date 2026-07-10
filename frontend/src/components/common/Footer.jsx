import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Logo et description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🍽️</span>
              </div>
              <div>
                <span className="text-white font-bold block leading-none">Touba</span>
                <span className="text-orange-400 text-xs">Food Delivery</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              La plateforme de commande et livraison de repas à Touba, Sénégal.
              Rapide, fiable et local.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/restaurants" className="hover:text-orange-400 transition-colors">Restaurants</Link></li>
              <li><Link to="/inscription"  className="hover:text-orange-400 transition-colors">S'inscrire</Link></li>
              <li><Link to="/connexion"    className="hover:text-orange-400 transition-colors">Se connecter</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📍</span> Touba, Sénégal
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> +221 77 000 00 00
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span> contact@toubafood.sn
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>© 2026 Sama Lekk — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;