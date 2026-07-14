import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#2A2420] text-[#7A7470] py-8 px-4 mt-auto border-t-2 border-[#D0C8C0]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
          
          <div className="flex items-center gap-2">
            <span className="text-[#8B5A2B] text-xl font-semibold">Sama Lekk</span>
          </div>

          <div className="flex gap-6 text-sm">
            <Link to="/restaurants" className="hover:text-[#8B5A2B]">Restos</Link>
            <Link to="/inscription" className="hover:text-[#8B5A2B]">S'inscrire</Link>
            <Link to="/connexion" className="hover:text-[#8B5A2B]">Connexion</Link>
          </div>
        </div>

        <div className="text-center text-xs">
          <p>Touba, Sénégal • 2026</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;