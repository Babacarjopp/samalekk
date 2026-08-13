import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement]   = useState(true);

  const synchroniserUtilisateur = (user) => {
    if (user) {
      localStorage.setItem('utilisateur', JSON.stringify(user));
    } else {
      localStorage.removeItem('utilisateur');
    }
    setUtilisateur(user);
  };

  useEffect(() => {
    const initialiser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setChargement(false);
        return;
      }

      try {
        const res = await authService.monProfil();
        synchroniserUtilisateur(res.data.utilisateur);
      } catch {
        localStorage.removeItem('token');
        synchroniserUtilisateur(null);
      } finally {
        setChargement(false);
      }
    };

    initialiser();
  }, []);

  const seConnecter = async (email, motDePasse) => {
    const res = await authService.seConnecter({ email, motDePasse });
    const { token, utilisateur: user } = res.data;
    localStorage.setItem('token', token);
    synchroniserUtilisateur(user);
    return user;
  };

  const sInscrire = async (donnees) => {
    const res = await authService.sInscrire(donnees);
    const { token, utilisateur: user } = res.data;
    localStorage.setItem('token', token);
    synchroniserUtilisateur(user);
    return user;
  };

  const seDeconnecter = () => {
    localStorage.removeItem('token');
    synchroniserUtilisateur(null);
  };

  const actualiserProfil = async () => {
    const res = await authService.monProfil();
    synchroniserUtilisateur(res.data.utilisateur);
    return res.data.utilisateur;
  };

  const estConnecte  = !!utilisateur;
  const estClient    = utilisateur?.role === 'client';
  const estRestaurant= utilisateur?.role === 'restaurateur';
  const estLivreur   = utilisateur?.role === 'livreur';
  const estAdmin     = utilisateur?.role === 'admin';
  const compteActif  = utilisateur?.statut === 'actif';
  const disponible   = utilisateur?.disponible || false;

  const setDisponible = async (nouvelleDispo) => {
    try {
      await authService.modifierProfil({ disponible: nouvelleDispo });
      setUtilisateur(prev => ({ ...prev, disponible: nouvelleDispo }));
      localStorage.setItem('utilisateur', JSON.stringify({ ...utilisateur, disponible: nouvelleDispo }));
    } catch (error) {
      console.error('Erreur mise à jour disponibilité:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      utilisateur,
      chargement,
      estConnecte,
      estClient,
      estRestaurant,
      estLivreur,
      estAdmin,
      compteActif,
      disponible,
      setDisponible,
      seConnecter,
      sInscrire,
      seDeconnecter,
      actualiserProfil,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};
