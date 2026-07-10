import { createContext, useContext, useState } from 'react';

const PanierContext = createContext(null);

export const PanierProvider = ({ children }) => {
  const [articles,    setArticles]    = useState([]);
  const [restaurantId,setRestaurantId]= useState(null);
  const [restaurantNom,setRestaurantNom]= useState('');

  // Ajouter un plat au panier
  const ajouterAuPanier = (plat, restaurant) => {
    // Si le panier contient des plats d'un autre restaurant → vider d'abord
    if (restaurantId && restaurantId !== restaurant.id) {
      const confirmer = window.confirm(
        `Votre panier contient des articles de "${restaurantNom}". Voulez-vous vider le panier et commander chez "${restaurant.nom}" ?`
      );
      if (!confirmer) return;
      setArticles([]);
    }

    setRestaurantId(restaurant.id);
    setRestaurantNom(restaurant.nom);

    setArticles(prev => {
      const existant = prev.find(a => a.id === plat.id);
      if (existant) {
        return prev.map(a =>
          a.id === plat.id ? { ...a, quantite: a.quantite + 1 } : a
        );
      }
      return [...prev, { ...plat, quantite: 1 }];
    });
  };

  // Retirer un plat du panier
  const retirerDuPanier = (platId) => {
    setArticles(prev => {
      const article = prev.find(a => a.id === platId);
      if (article?.quantite === 1) {
        const nouveaux = prev.filter(a => a.id !== platId);
        if (nouveaux.length === 0) {
          setRestaurantId(null);
          setRestaurantNom('');
        }
        return nouveaux;
      }
      return prev.map(a =>
        a.id === platId ? { ...a, quantite: a.quantite - 1 } : a
      );
    });
  };

  // Vider le panier
  const viderPanier = () => {
    setArticles([]);
    setRestaurantId(null);
    setRestaurantNom('');
  };

  // Calculs
  const nombreArticles  = articles.reduce((t, a) => t + a.quantite, 0);
  const sousTotal       = articles.reduce((t, a) => t + a.prix * a.quantite, 0);

  return (
    <PanierContext.Provider value={{
      articles,
      restaurantId,
      restaurantNom,
      nombreArticles,
      sousTotal,
      ajouterAuPanier,
      retirerDuPanier,
      viderPanier
    }}>
      {children}
    </PanierContext.Provider>
  );
};

export const usePanier = () => {
  const context = useContext(PanierContext);
  if (!context) throw new Error('usePanier doit être utilisé dans PanierProvider');
  return context;
};