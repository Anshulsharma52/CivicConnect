import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet's default icon missing in React bundlers
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Click handler inner component for React Leaflet
const LocationMarker = ({ position, setPosition, onLocationSelected }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelected(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  return position ? <Marker position={position} icon={customMarkerIcon} /> : null;
};

const ComplaintMapPicker = ({ latitude, longitude, onLocationChange }) => {
  // Default to Bengaluru center [12.9716, 77.5946] if not specified
  const initialLat = latitude ? Number(latitude) : 12.9716;
  const initialLng = longitude ? Number(longitude) : 77.5946;

  const [position, setPosition] = useState([initialLat, initialLng]);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleLocationSelected = async (lat, lng) => {
    setPosition([lat, lng]);
    onLocationChange({ latitude: lat, longitude: lng });

    // Optional reverse geocoding via OpenStreetMap Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        onLocationChange({
          latitude: lat,
          longitude: lng,
          suggestedAddress: data.display_name,
        });
      }
    } catch (e) {
      // Nominatim rate limits or offline; coordinate remains valid
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingLocation(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        handleLocationSelected(lat, lng);
      },
      (err) => {
        setDetectingLocation(false);
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          Click anywhere on the map to set the exact issue location
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={detectingLocation}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          {detectingLocation ? 'Locating...' : 'Use My Current Location'}
        </button>
      </div>

      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationSelected={handleLocationSelected}
          />
        </MapContainer>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
        <span>Lat: {position[0].toFixed(5)}</span>
        <span>Lng: {position[1].toFixed(5)}</span>
      </div>
    </div>
  );
};

export default ComplaintMapPicker;
