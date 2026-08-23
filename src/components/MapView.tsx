import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PropertySummary, College } from '../types';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Star, ShieldCheck } from 'lucide-react';

// Custom Map Marker Icons using HTML DivIcons
const createPropertyIcon = (price: number, available: boolean) => {
  const bgClass = available ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-700 border-slate-500';
  const text = `₹${Math.round(price / 1000)}k`;

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="px-2 py-1 rounded-full text-white font-extrabold text-[11px] shadow-lg border-2 flex items-center gap-1 transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform ${bgClass}">
        <span>${text}</span>
        ${available ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>' : ''}
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 24],
  });
};

const createCollegeIcon = (name: string) => {
  return L.divIcon({
    className: 'college-map-marker',
    html: `
      <div class="px-2.5 py-1 rounded-lg text-white font-bold text-xs bg-purple-700 border-2 border-purple-300 shadow-xl flex items-center gap-1 transform -translate-x-1/2 -translate-y-full">
        <span>🎓 ${name}</span>
      </div>
    `,
    iconSize: [80, 26],
    iconAnchor: [40, 26],
  });
};

interface MapViewProps {
  properties: PropertySummary[];
  selectedCollege?: College | null;
  selectedProperty?: PropertySummary | null;
  className?: string;
}

// Controller component to smoothly pan/fit bounds
const MapViewController: React.FC<{
  center: [number, number];
  zoom: number;
  properties: PropertySummary[];
}> = ({ center, zoom, properties }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, properties, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  properties,
  selectedCollege,
  selectedProperty,
  className = 'h-[450px] w-full',
}) => {
  const defaultCenter: [number, number] = selectedCollege
    ? [selectedCollege.latitude, selectedCollege.longitude]
    : properties.length > 0
    ? [properties[0].latitude, properties[0].longitude]
    : [16.4649, 80.5078]; // Default: Andhra Pradesh (Amaravati Region) coordinates

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController center={defaultCenter} zoom={13} properties={properties} />

        {/* Selected College Marker */}
        {selectedCollege && (
          <Marker
            position={[selectedCollege.latitude, selectedCollege.longitude]}
            icon={createCollegeIcon(selectedCollege.short_name)}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h4 className="font-bold text-sm text-indigo-400">🎓 {selectedCollege.name}</h4>
                <p className="text-xs text-slate-300 mt-1">{selectedCollege.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Property Markers */}
        {properties.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.latitude, prop.longitude]}
            icon={createPropertyIcon(prop.monthly_rent, prop.total_available_beds > 0)}
          >
            <Popup>
              <div className="p-2 w-56 font-sans text-slate-100">
                {prop.cover_image && (
                  <img
                    src={prop.cover_image}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm line-clamp-1 text-white">{prop.property_name}</span>
                  <div className="flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                    <Star size={11} className="fill-amber-400" />
                    <span>{prop.rating_average.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-indigo-400" />
                  <span>{prop.distance_from_college_km} km to college</span>
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400">Rent</span>
                    <p className="text-xs font-bold text-emerald-400">{formatCurrency(prop.monthly_rent)}/mo</p>
                  </div>
                  <Link
                    to={`/properties/${prop.id}`}
                    className="px-2 py-1 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                  >
                    View
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
