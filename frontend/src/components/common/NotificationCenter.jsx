import { useEffect, useState } from 'react';
import useSocket from '../../hooks/useSocket';

const NotificationCenter = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Écouter les nouvelles notifications
    socket.on('notification:nouvelle', (notification) => {
      const id = Date.now();
      const notif = {
        id,
        ...notification
      };

      setNotifications((prev) => [notif, ...prev]);

      // Auto-remove après 5 secondes
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    });

    return () => {
      socket.off('notification:nouvelle');
    };
  }, [socket]);

  const getIcon = (type) => {
    switch (type) {
      case 'commande':
        return <i className="ti ti-shopping-cart" />;
      case 'livraison':
        return <i className="ti ti-truck" />;
      case 'paiement':
        return <i className="ti ti-circle-check" />;
      default:
        return <i className="ti ti-bell" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'commande':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'livraison':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'paiement':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`rounded-lg border-2 p-4 shadow-lg animate-in slide-in-from-right ${getColor(notif.type)}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-1">{getIcon(notif.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{notif.message}</p>
              {notif.date && (
                <p className="text-xs opacity-75 mt-1">
                  À l'instant
                </p>
              )}
            </div>
            <button
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <i className="ti ti-x" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
