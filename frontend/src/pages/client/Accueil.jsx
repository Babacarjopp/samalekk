import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const categories = [
  { nom: 'Sénégalaise', emoji: '🍚', couleur: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { nom: 'Grillades',   emoji: '🍖', couleur: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { nom: 'Fast-food',   emoji: '🍔', couleur: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { nom: 'Sandwicherie',emoji: '🥖', couleur: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  { nom: 'Pâtisserie',  emoji: '🍰', couleur: 'bg-pink-100 text-pink-700 hover:bg-pink-200' },
];

const etapes = [
  { num: '01', emoji: '🔍', titre: 'Choisissez', desc: 'Parcourez les restaurants de Touba et leur menu complet' },
  { num: '02', emoji: '🛒', titre: 'Commandez', desc: 'Ajoutez vos plats au panier et payez en ligne ou à la livraison' },
  { num: '03', emoji: '🛵', titre: 'Recevez', desc: "Un livreur récupère votre commande et vous l'apporte chez vous" },
];

const stats = [
  { val: '50+', label: 'Restaurants' },
  { val: '500+', label: 'Plats disponibles' },
  { val: '30min', label: 'Livraison moyenne' },
  { val: '24/7', label: 'Service disponible' },
];

const HeroButton = ({ to, variant = 'primary', children }) => {
  const base =
    'inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full px-8 py-3.5 text-base font-bold transition duration-200 sm:w-auto sm:min-w-[220px] sm:text-lg';
  const styles = {
    primary:
      'bg-white text-orange-600 shadow-lg shadow-black/15 hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-xl',
    secondary:
      'border-2 border-white/35 bg-white/10 text-white backdrop-blur-sm hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20',
  };

  return (
    <Link to={to} className={`${base} ${styles[variant]}`}>
      {children}
    </Link>
  );
};

const Accueil = () => {
  const { estConnecte } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5EFE8]">

      {/* ── Hero ── */}
      <section className="relative isolate overflow-x-hidden bg-gradient-to-br from-[#C8441A] via-orange-500 to-amber-500">
        {/* Motif de fond décoratif */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.12]" aria-hidden="true">
          <div className="absolute left-[8%] top-[12%] text-7xl sm:text-8xl">🍽️</div>
          <div className="absolute right-[12%] top-[18%] text-5xl sm:text-6xl">🛵</div>
          <div className="absolute bottom-[18%] left-[30%] text-6xl sm:text-7xl">🍖</div>
          <div className="absolute bottom-[22%] right-[8%] text-4xl sm:text-5xl">🥘</div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-white/20 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center text-base leading-none">🌍</span>
              <span>La plateforme de livraison de Touba</span>
            </div>

            <h1 className="mb-6 max-w-4xl text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Vos plats préférés,
              <span className="mt-2 block text-amber-100">livrés chez vous</span>
            </h1>

            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-orange-50 sm:text-xl">
              Découvrez les meilleurs restaurants de Touba et commandez en quelques clics.
              Livraison rapide partout dans la ville.
            </p>

            <div className="flex w-full max-w-xl flex-col items-stretch gap-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
              <HeroButton to="/restaurants" variant="primary">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-xl leading-none">🍴</span>
                <span>Commander maintenant</span>
              </HeroButton>
              {!estConnecte && (
                <HeroButton to="/inscription" variant="secondary">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-xl leading-none">📝</span>
                  <span>Inscrire mon restaurant</span>
                </HeroButton>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Comment ça marche ?
          </h2>
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {etapes.map(etape => (
              <div
                key={etape.num}
                className="group rounded-3xl border border-gray-200 bg-slate-50 p-8 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-center gap-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-4xl transition group-hover:bg-orange-200">
                    {etape.emoji}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                    {etape.num}
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{etape.titre}</h3>
                <p className="mx-auto max-w-xs leading-relaxed text-gray-500">{etape.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catégories ── */}
      <section className="bg-orange-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Toutes les cuisines
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categories.map(cat => (
              <Link
                key={cat.nom}
                to={`/restaurants?categorie=${cat.nom.toLowerCase()}`}
                className={`${cat.couleur} flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center text-2xl leading-none">{cat.emoji}</span>
                <span>{cat.nom}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chiffres ── */}
      <section className="bg-gray-900 px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
            {stats.map(stat => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-lg shadow-black/10"
              >
                <div className="mb-3 text-4xl font-bold text-orange-300">{stat.val}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA rejoindre ── */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-gray-200 bg-slate-50 p-10 text-center shadow-sm sm:p-14">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Vous êtes restaurateur à Touba ?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600">
            Rejoignez notre plateforme et touchez des milliers de clients.
            Inscription gratuite, commission réduite, visibilité instantanée.
          </p>
          <Link
            to="/inscription"
            className="btn btn-primary btn-lg inline-flex items-center justify-center gap-3"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center text-2xl leading-none">🍴</span>
            <span>Inscrire mon restaurant</span>
          </Link>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="bg-gray-900 px-5 py-10 text-center text-gray-400">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center text-2xl leading-none">🍽️</span>
          <span className="font-bold text-white">Sama Lekk</span>
        </div>
        <p className="text-sm">
          © 2026 Sama Lekk — La plateforme de livraison de Touba, Sénégal
        </p>
      </footer>
    </div>
  );
};

export default Accueil;
