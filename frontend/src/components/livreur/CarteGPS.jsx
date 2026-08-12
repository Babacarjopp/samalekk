import { useEffect, useRef } from 'react';

const TOUBA = { lat: 14.8534, lng: -15.8823 };

const CarteGPS = ({
  positionLivreur    = null,
  positionRestaurant = null,
  positionClient     = null,
  nomLivreur         = 'Livreur',
  nomRestaurant      = 'Restaurant',
  hauteur            = '300px'
}) => {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    chargerLeaflet();
    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (leafletRef.current) {
      mettreAJourMarkers();
    }
  }, [positionLivreur, positionRestaurant, positionClient]);

  const chargerLeaflet = () => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id  = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href= 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initCarte = () => {
      if (!mapRef.current || leafletRef.current) return;
      const L = window.L;

      const centre = positionClient || positionRestaurant || positionLivreur || TOUBA;

      const map = L.map(mapRef.current, {
        center:      [centre.lat, centre.lng],
        zoom:        14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = map;
      mettreAJourMarkers();
    };

    if (window.L) {
      initCarte();
    } else {
      const script = document.createElement('script');
      script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initCarte;
      document.head.appendChild(script);
    }
  };

  const creerIcone = (emoji, couleur) => {
    return window.L.divIcon({
      html: `
        <div style="
          width: 44px; height: 44px;
          background: ${couleur};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fff;
          box-shadow: 0 3px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="transform:rotate(45deg); font-size:20px; line-height:1;">
            ${emoji}
          </span>
        </div>
      `,
      iconSize:   [44, 44],
      iconAnchor: [22, 44],
      className:  '',
    });
  };

  const mettreAJourMarkers = () => {
    const L   = window.L;
    const map = leafletRef.current;
    if (!L || !map) return;

    const bounds = [];

    // ── Marker Livreur 🛵 ──
    if (positionLivreur) {
      const icone = L.divIcon({
        html: `
          <div style="
            width: 48px; height: 48px;
            background: #D4600A;
            border-radius: 50%;
            border: 3px solid #fff;
            box-shadow: 0 3px 14px rgba(212,96,10,0.5);
            display: flex; align-items: center; justify-content: center;
            font-size: 22px;
          ">🛵</div>
        `,
        iconSize:   [48, 48],
        iconAnchor: [24, 24],
        className:  '',
      });

      if (markersRef.current.livreur) {
        markersRef.current.livreur.setLatLng([positionLivreur.lat, positionLivreur.lng]);
      } else {
        const m = L.marker([positionLivreur.lat, positionLivreur.lng], { icon: icone }).addTo(map);
        m.bindPopup(`<b>🛵 ${nomLivreur}</b><br>Livreur en route`);
        markersRef.current.livreur = m;
      }
      bounds.push([positionLivreur.lat, positionLivreur.lng]);
    }

    // ── Marker Restaurant 🍽️ ──
    if (positionRestaurant) {
      if (!markersRef.current.restaurant) {
        const m = L.marker(
          [positionRestaurant.lat, positionRestaurant.lng],
          { icon: creerIcone('🍽️', '#8B4513') }
        ).addTo(map);
        m.bindPopup(`<b>🍽️ ${nomRestaurant}</b><br>Point de récupération`);
        markersRef.current.restaurant = m;
      }
      bounds.push([positionRestaurant.lat, positionRestaurant.lng]);
    }

    // ── Marker Client 🏠 ──
    if (positionClient) {
      if (!markersRef.current.client) {
        const m = L.marker(
          [positionClient.lat, positionClient.lng],
          { icon: creerIcone('🏠', '#1D5C3A') }
        ).addTo(map);
        m.bindPopup(`<b>🏠 Client</b><br>Adresse de livraison`);
        markersRef.current.client = m;
      } else {
        markersRef.current.client.setLatLng([positionClient.lat, positionClient.lng]);
      }
      bounds.push([positionClient.lat, positionClient.lng]);
    }

    // Ajuster la vue pour voir tous les markers
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  };

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8DDD4' }}>
      <div ref={mapRef} style={{ height: hauteur, width: '100%', background: '#EDE6DC' }} />

      {/* Légende */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #E8DDD4',
        borderRadius: 12, padding: '8px 14px',
        display: 'flex', flexDirection: 'column', gap: 4,
        zIndex: 1000,
      }}>
        {positionLivreur    && <div style={{ fontSize: 12, color: '#3D3026', display: 'flex', gap: 6 }}><span>🛵</span> Vous</div>}
        {positionRestaurant && <div style={{ fontSize: 12, color: '#3D3026', display: 'flex', gap: 6 }}><span>🍽️</span> Restaurant</div>}
        {positionClient     && <div style={{ fontSize: 12, color: '#3D3026', display: 'flex', gap: 6 }}><span>🏠</span> Client</div>}
      </div>

      {/* Message si pas de position */}
      {!positionLivreur && !positionClient && !positionRestaurant && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 12, padding: '12px 20px',
          fontSize: 13, color: '#9C8E84', textAlign: 'center',
          zIndex: 1000,
        }}>
          📍 En attente de la position GPS...
        </div>
      )}
    </div>
  );
};

export default CarteGPS;