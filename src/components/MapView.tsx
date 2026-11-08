import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../types';

interface MapViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

const formatPinPrice = (price: number) => {
  if (price >= 1000) {
    const thousands = price / 1000;
    return `$${Number.isInteger(thousands) ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  }
  return `$${price}`;
};

export const MapView: React.FC<MapViewProps> = ({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite
}) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(properties[0]?.id ?? null);

  const located = useMemo(
    () => properties.filter((property) => Number.isFinite(property.lat) && Number.isFinite(property.lng)),
    [properties]
  );
  const selected = located.find((property) => property.id === selectedId) ?? located[0] ?? null;

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    const map = L.map(mapElement.current, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView([37.7749, -122.4194], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();
    const bounds = L.latLngBounds([]);

    located.forEach((property) => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-price-pin ${property.id === selected?.id ? 'is-active' : ''}">${formatPinPrice(property.price)}</div>`,
        iconSize: [72, 32],
        iconAnchor: [36, 32],
      });
      const marker = L.marker([property.lat, property.lng], { icon });
      marker.on('click', () => {
        setSelectedId(property.id);
        map.panTo([property.lat, property.lng]);
      });
      marker.addTo(markers);
      bounds.extend([property.lat, property.lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.25), { maxZoom: 14, animate: false });
    }
  }, [located, selected?.id]);

  const focusProperty = (property: Property) => {
    setSelectedId(property.id);
    mapRef.current?.setView([property.lat, property.lng], Math.max(mapRef.current.getZoom(), 14));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-180px)] min-h-[520px]">
      <aside className="bg-white rounded-2xl border border-[#c7c4d8]/30 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#c7c4d8]/20">
          <h2 className="font-bold text-sm text-[#191c1e]">On the map</h2>
          <p className="text-xs text-[#777587]">{located.length} homes with a street location</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {located.length === 0 ? (
            <p className="p-4 text-xs text-[#777587]">No listings match the current filters.</p>
          ) : (
            located.map((property) => (
              <button
                key={property.id}
                onClick={() => focusProperty(property)}
                className={`w-full text-left px-4 py-3 border-b border-[#c7c4d8]/15 flex gap-3 hover:bg-[#f7f9fb] ${
                  selected?.id === property.id ? 'bg-[#3525cd]/5' : ''
                }`}
              >
                <img src={property.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#191c1e] truncate">{property.title}</span>
                  <span className="block text-[11px] text-[#777587] truncate">
                    {property.neighborhood}, {property.city}
                  </span>
                  <span className="block text-xs font-bold text-[#3525cd] mt-1">
                    ${property.price.toLocaleString()}/mo
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="relative rounded-2xl overflow-hidden border border-[#c7c4d8]/30 min-h-[420px]">
        <div ref={mapElement} className="absolute inset-0" />

        <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2.5 bg-white text-[#191c1e] rounded-xl shadow-lg hover:bg-[#f2f4f6]"
            aria-label="Zoom in"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2.5 bg-white text-[#191c1e] rounded-xl shadow-lg hover:bg-[#f2f4f6]"
            aria-label="Zoom out"
          >
            <span className="material-symbols-outlined text-xl">remove</span>
          </button>
        </div>

        {selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[500] max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#c7c4d8]/40 p-3 flex gap-3.5 items-center">
              <img
                src={selected.image}
                alt={selected.title}
                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#005236] uppercase tracking-wider">
                    {selected.type}
                  </span>
                  <button
                    onClick={(e) => onToggleFavorite(e, selected.id)}
                    className="text-[#777587] hover:text-[#ba1a1a]"
                  >
                    <span
                      className={`material-symbols-outlined text-lg ${
                        favorites.includes(selected.id) ? 'text-[#ba1a1a]' : ''
                      }`}
                      data-weight={favorites.includes(selected.id) ? 'fill' : undefined}
                    >
                      favorite
                    </span>
                  </button>
                </div>
                <h4 className="font-bold text-sm text-[#191c1e] truncate mt-0.5">{selected.title}</h4>
                <p className="text-xs text-[#777587] truncate">
                  {selected.address}, {selected.city}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm text-[#3525cd]">
                    ${selected.price.toLocaleString()}
                    <span className="text-[10px] text-[#777587] font-normal">/mo</span>
                  </span>
                  <button
                    onClick={() => onSelectProperty(selected)}
                    className="px-3 py-1.5 rounded-lg bg-[#3525cd] text-white text-xs font-bold hover:bg-[#4f46e5]"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
