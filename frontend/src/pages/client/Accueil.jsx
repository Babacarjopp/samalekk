import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Accueil = () => {
  const { estConnecte } = useAuth();

  return (
    <div className="min-h-screen bg-[#E8E0D8] p-6">
      
      <div className="max-w-4xl mx-auto">
        
        {/* Header simple et brut */}
        <div className="mb-12 pt-8">
          <h1 className="text-4xl font-bold text-[#2A2420] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
            Sama Lekk
          </h1>
          <p className="text-lg text-[#4A4440] leading-relaxed max-w-xl">
            Livraison de repas a Touba. On va chercher ce que vous voulez chez les restos de la ville et on vous l'apporte.
          </p>
        </div>

        {/* Liste directe des categories - pas de grid parfait */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#2A2420] mb-6">À explorer</h2>
          <p className="text-[#4A4440] mb-6">
            Parcourez notre sélection de restaurants et découvrez les différents styles de cuisine proposés par chacun.
          </p>
          <Link 
            to="/restaurants" 
            className="inline-block px-6 py-3 bg-[#8B5A2B] text-white border-2 border-[#6B4423] hover:bg-[#6B4423]"
          >
            Voir tous les restaurants
          </Link>
        </div>

        {/* Section restaurants - layout simple */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#2A2420]">Les restaurants</h2>
            <Link to="/restaurants" className="text-[#8B5A2B] hover:underline">
              Voir tout →
            </Link>
          </div>
          <p className="text-[#4A4440] mb-6">
            Il y a plus de 120 restaurants sur Touba qui livrent avec nous.
          </p>
        </div>

        {/* Section restaurateur - texte brut */}
        {!estConnecte && (
          <div className="mb-12 p-6 bg-[#F4EDE4] border border-[#D0C8C0]">
            <h2 className="text-xl font-semibold text-[#2A2420] mb-3">Vous avez un restaurant ?</h2>
            <p className="text-[#4A4440] mb-4">
              Vous pouvez vous inscrire pour commencer a livrer vos plats. C'est gratuit et ca prend 5 minutes.
            </p>
            <Link 
              to="/inscription" 
              className="inline-block px-6 py-3 bg-[#4A6741] text-white border-2 border-[#3A5231] hover:bg-[#3A5231]"
            >
              S'inscrire
            </Link>
          </div>
        )}

        {/* Footer minimal */}
        <div className="pt-8 border-t border-[#D0C8C0] text-sm text-[#7A7470]">
          <p>Touba, Sénégal • 2026</p>
        </div>

      </div>
    </div>
  );
};

export default Accueil;
