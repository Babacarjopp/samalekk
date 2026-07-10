import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// Hook pour gérer la connexion WebSocket avec Socket.io
const useSocket = (url = null) => {
  const socketRef = useRef(null);
  const sallesEnAttenteRef = useRef([]);
  const [connecte, setConnecte] = useState(false);

  const serverUrl = url || import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setConnecte(false);
      return;
    }

    const socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnecte(true);
      sallesEnAttenteRef.current.forEach((salle) => {
        socket.emit('client:suivre', salle);
      });
      sallesEnAttenteRef.current = [];
    });

    socket.on('disconnect', () => {
      setConnecte(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket.io :', err.message);
      setConnecte(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      sallesEnAttenteRef.current = [];
    };
  }, [serverUrl]);

  // Rejoindre une salle (pour le suivi d'une livraison)
  const rejoindre = useCallback((salle) => {
    if (!salle) return;

    if (!socketRef.current) {
      if (!sallesEnAttenteRef.current.includes(salle)) {
        sallesEnAttenteRef.current.push(salle);
      }
      return;
    }

    if (socketRef.current.connected) {
      socketRef.current.emit('client:suivre', salle);
    } else if (!sallesEnAttenteRef.current.includes(salle)) {
      sallesEnAttenteRef.current.push(salle);
    }
  }, []);

  // Écouter un événement
  const ecouter = useCallback((evenement, callback) => {
    socketRef.current?.on(evenement, callback);
    return () => socketRef.current?.off(evenement, callback);
  }, []);

  // Émettre un événement
  const emettre = useCallback((evenement, donnees) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(evenement, donnees);
    }
  }, []);

  return { socket: socketRef.current, connecte, rejoindre, ecouter, emettre };
};

export default useSocket;