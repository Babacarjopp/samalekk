import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { redirectionApresAuth } from '../../utils/redirectionAuth';

const Login = () => {
  const { seConnecter } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setChargement(true);
    try {
      const user = await seConnecter(form.email, form.motDePasse);
      navigate(redirectionApresAuth(user));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box anim">
        <div className="auth-logo">
          <div className="auth-logo-ico">
            <i className="ti ti-bowl-chopsticks" />
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-head">
            <h1>Bon retour !</h1>
            <p>Connectez-vous à votre compte</p>
          </div>

          {erreur && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <i className="ti ti-alert-circle" />
              {erreur}
            </div>
          )}

          <form className="auth-fields" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="login-email">Adresse email</label>
              <input
                id="login-email"
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="vous@exemple.sn"
                className="input" required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password" name="motDePasse"
                value={form.motDePasse} onChange={handleChange}
                placeholder="••••••••"
                className="input" required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={chargement}
            >
              {chargement && <i className="ti ti-loader-2 spinning" />}
              Se connecter
            </button>
          </form>

          <div className="auth-footer">
            Pas encore de compte ?{' '}
            <Link to="/inscription">S'inscrire</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
