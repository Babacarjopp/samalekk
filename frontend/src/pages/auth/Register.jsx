import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { redirectionApresAuth } from '../../utils/redirectionAuth';
import Button from '../../components/common/Button';

const roles = [
  { valeur: 'client',       label: 'Client',       emoji: '🛒', desc: 'Commander de la nourriture' },
  { valeur: 'restaurateur', label: 'Restaurateur',  emoji: '🍴', desc: 'Gérer mon restaurant' },
  { valeur: 'livreur',      label: 'Livreur',       emoji: '🛵', desc: 'Effectuer des livraisons' },
];

const Register = () => {
  const { sInscrire } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '', email: '', telephone: '',
    motDePasse: '', role: 'client', vehicule: ''
  });
  const [erreur,     setErreur]     = useState('');
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setChargement(true);
    try {
      const user = await sInscrire(form);
      navigate(redirectionApresAuth(user));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box anim" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <div className="auth-logo-ico">
            <i className="ti ti-bowl-chopsticks" />
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-head">
            <h1>Créer un compte</h1>
            <p>Rejoignez Sama Lekk</p>
          </div>

          {erreur && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <i className="ti ti-alert-circle" />
              {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-fields">

            {/* Choix du rôle */}
            <div className="field">
              <span className="field-label">Je suis...</span>
              <div className="role-pick">
                {roles.map(r => (
                  <button
                    key={r.valeur}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.valeur })}
                    className={`role-opt ${form.role === r.valeur ? 'on' : ''}`}
                  >
                    <span className="role-ico">{r.emoji}</span>
                    <span className="role-label">{r.label}</span>
                    <span className="role-sub">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg-nom">Nom complet</label>
              <input
                id="reg-nom"
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Moussa Diallo"
                className="input"
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg-email">Adresse email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                className="input"
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg-tel">Numéro de téléphone</label>
              <input
                id="reg-tel"
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                placeholder="77 123 45 67"
                className="input"
                required
              />
            </div>

            {form.role === 'livreur' && (
              <div className="field">
                <label className="field-label" htmlFor="reg-vehicule">Type de véhicule</label>
                <input
                  id="reg-vehicule"
                  type="text"
                  name="vehicule"
                  value={form.vehicule}
                  onChange={handleChange}
                  placeholder="Ex : Moto Jakarta, Vélo..."
                  className="input"
                />
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="reg-password">Mot de passe</label>
              <input
                id="reg-password"
                type="password"
                name="motDePasse"
                value={form.motDePasse}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
                className="input"
                required
              />
            </div>

            {(form.role === 'restaurateur' || form.role === 'livreur') && (
              <div className="alert alert-info">
                <i className="ti ti-info-circle" />
                Votre compte sera validé par un administrateur avant d'être actif.
              </div>
            )}

            <Button
              type="submit"
              variante="primaire"
              chargement={chargement}
              className="btn-full"
            >
              Créer mon compte
            </Button>
          </form>

          <div className="auth-footer">
            Déjà un compte ?{' '}
            <Link to="/connexion">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
