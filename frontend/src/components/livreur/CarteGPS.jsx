import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTRE_TOUBA = [14.8667, -15.8833];

const creerIcone = (iconClass, couleur) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${couleur};
      width:36px;height:36px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      color:white;
      border:2px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
    "><i class=\"${iconClass} \" style=\"font-size:16px;color:white\"></i></div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
    popupAnchor:[0, -20],
  });

const iconeLivreur = creerIcone('ti ti-truck-delivery', '#C8441A');
const iconeClient  = creerIcone('ti ti-home', '#1A6B3C');

const AjusterVue = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    const valides = positions.filter(p => p?.lat != null && p?.lng != null);
    if (valides.length === 0) return;

    if (valides.length === 1) {
      map.setView([valides[0].lat, valides[0].lng], 15);
    } else {
      map.fitBounds(
        L.latLngBounds(valides.map(p => [p.lat, p.lng])),
        { padding: [48, 48], maxZoom: 16 }
      );
    }
  }, [positions, map]);

  return null;
};

const CarteGPS = ({
  positionLivreur = null,
  positionClient  = null,
  nomLivreur      = 'Livreur',
  hauteur         = '250px',
}) => {
  const positions = [positionLivreur, positionClient].filter(
    p => p?.lat != null && p?.lng != null
  );

  const centre = positions.length > 0
    ? [positions[0].lat, positions[0].lng]
    : CENTRE_TOUBA;

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ height: hauteur }}
    >
      <MapContainer
        center={centre}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjusterVue positions={[positionLivreur, positionClient]} />

        {positionLivreur?.lat != null && positionLivreur?.lng != null && (
          <Marker
            position={[positionLivreur.lat, positionLivreur.lng]}
            icon={iconeLivreur}
          >
            <Popup>{nomLivreur} — en route</Popup>
          </Marker>
        )}

        {positionClient?.lat != null && positionClient?.lng != null && (
          <Marker
            position={[positionClient.lat, positionClient.lng]}
            icon={iconeClient}
          >
            <Popup>Votre adresse de livraison</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default CarteGPS;
