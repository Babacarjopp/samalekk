import { createContext, useState, useCallback, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const ajouterNotification = useCallback((notification) => {
    const id = Date.now();
    const nouvelleNotif = {
      id,
      ...notification,
      createdAt: new Date()
    };

    setNotifications((prev) => [nouvelleNotif, ...prev]);

    // Auto-remove après 5 secondes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);

    return id;
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, ajouterNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = window.__notificationContext;
  if (!context) {
    throw new Error('useNotification doit être utilisé dans un NotificationProvider');
  }
  return context;
};
