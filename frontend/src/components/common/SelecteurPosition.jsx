import { useState, useEffect, useRef } from 'react';
import useGeolocation from '../../hooks/useGeolocation';

const TOUBA = { lat: 14.8534, lng: -15.8823 };

const SelecteurPosition = ({ 
  onPositionChange, 
  positionInitiale = null,
  hauteur = '400px',
  allowClick = true 
}) => {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markerRef = useRef(null);
  
  const [position, setPosition] = useState(positionInitiale);
  const { position: gpsPosition, erreur: gpsErreur, chargement: gpsChargement } = useGeolocation(false);
  const [modeGPS, setModeGPS] = useState(true);

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
    if (gpsPosition && modeGPS) {
      setPosition(gpsPosition);
    }
  }, [gpsPosition, modeGPS]);

  useEffect(() => {
    if (position && leafletRef.current) {
      mettreAJourMarker();
    }
  }, [position]);

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

      const centre = position || TOUBA;

      const map = L.map(mapRef.current, {
        center:      [centre.lat, centre.lng],
        zoom:        15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Permettre le clic sur la carte
      if (allowClick) {
        map.on('click', (e) => {
          const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
          setPosition(newPos);
          setModeGPS(false);
          if (onPositionChange) {
            onPositionChange(newPos);
          }
        });
      }

      leafletRef.current = map;
      mettreAJourMarker();
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

  const mettreAJourMarker = () => {
    const L = window.L;
    const map = leafletRef.current;
    if (!L || !map || !position) return;

    const icone = L.divIcon({
      html: `
        <div style="
          width: 44px; height: 44px;
          background: #D4600A;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fff;
          box-shadow: 0 3px 12px rgba(212,96,10,0.5);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="transform:rotate(45deg); font-size:20px; line-height:1;">
            📍
          </span>
        </div>
      `,
      iconSize:   [44, 44],
      iconAnchor: [22, 44],
      className:  '',
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng]);
    } else {
      const m = L.marker([position.lat, position.lng], { icon: icone }).addTo(map);
      m.bindPopup('<b>Votre position</b><br>Cliquez ailleurs pour ajuster');
      markerRef.current = m;
    }

    map.setView([position.lat, position.lng], 16);
  };

  const utiliserGPS = () => {
    setModeGPS(true);
    if (gpsPosition) {
      setPosition(gpsPosition);
      if (onPositionChange) {
        onPositionChange(gpsPosition);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Contrôles */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={utiliserGPS}
          disabled={gpsChargement}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${modeGPS 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${gpsChargement ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="ti ti-crosshair mr-1" />
          {gpsChargement ? 'Localisation...' : 'Ma position GPS'}
        </button>
        
        {gpsErreur && (
          <span className="text-red-600 text-sm flex items-center">
            <i className="ti ti-alert-circle mr-1" />
            {gpsErreur}
          </span>
        )}
        
        {!modeGPS && (
          <span className="text-blue-600 text-sm flex items-center">
            <i className="ti ti-map-pin mr-1" />
            Position manuelle (cliquez sur la carte)
          </span>
        )}
      </div>

      {/* Carte */}
      <div style={{ 
        position: 'relative', 
        borderRadius: 16, 
        overflow: 'hidden', 
        border: '2px solid #E8DDD4' 
      }}>
        <div 
          ref={mapRef} 
          style={{ 
            height: hauteur, 
            width: '100%', 
            background: '#EDE6DC',
            cursor: allowClick ? 'crosshair' : 'default'
          }} 
        />

        {/* Instructions */}
        {allowClick && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #E8DDD4',
            borderRadius: 8, padding: '8px 12px',
            fontSize: 12, color: '#3D3026',
            zIndex: 1000,
            maxWidth: 200,
          }}>
            🖱️ Cliquez sur la carte pour préciser votre position
          </div>
        )}

        {/* Coordonnées */}
        {position && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #E8DDD4',
            borderRadius: 8, padding: '8px 12px',
            fontSize: 11, color: '#3D3026',
            fontFamily: 'monospace',
            zIndex: 1000,
          }}>
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelecteurPosition;