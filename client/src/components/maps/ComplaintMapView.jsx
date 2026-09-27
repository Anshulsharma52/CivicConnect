import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Navigation } from 'lucide-react';

const viewMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ComplaintMapView = ({ latitude, longitude, address, title, height = 'h-64' }) => {
  if (!latitude || !longitude) {
    return (
      <div className={`${height} bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm`}>
        Location coordinates unavailable
      </div>
    );
  }

  const position = [Number(latitude), Number(longitude)];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <div className={`${height} w-full`}>
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={viewMarkerIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-slate-900">{title || 'Complaint Location'}</p>
                <p className="text-slate-600 mt-1">{address}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/95 text-slate-800 rounded-lg shadow-md hover:bg-white hover:text-indigo-600 border border-slate-200 transition-colors backdrop-blur-sm"
      >
        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
        Open in Google Maps
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </a>
    </div>
  );
};

export default ComplaintMapView;
