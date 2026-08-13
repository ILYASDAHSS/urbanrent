import React, { useState } from 'react';
import { Property } from '../types';

interface MapViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite
}) => {
  const [selectedPin, setSelectedPin] = useState<Property | null>(
    properties[0] || null
  );

  return (
    <div className="relative w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-[#c7c4d8]/30 shadow-inner bg-[#e6e8ea]">
      {/* Map Graphic Canvas Simulation */}
      <div className="absolute inset-0 bg-[#e0e3e5] bg-[radial-gradient(#c7c4d8_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
        {/* Decorative Map Roads & River Simulation */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
          <path
            d="M 0 150 Q 300 200 600 100 T 1200 300"
            fill="none"
            stroke="#3525cd"
            strokeWidth="12"
          />
          <path
            d="M 200 0 Q 250 400 500 800"
            fill="none"
            stroke="#d0e1fb"
            strokeWidth="40"
          />
          <path
            d="M 0 500 Q 500 450 1000 600"
            fill="none"
            stroke="#ffffff"
            strokeWidth="8"
          />
        </svg>

        {/* Map Location Pins with Prices */}
        <div className="absolute inset-0 p-8 sm:p-12 relative max-w-5xl mx-auto h-full">
          {properties.map((prop, idx) => {
            const isSelected = selectedPin?.id === prop.id;
            // Spread pins organically across container
            const topPositions = ['25%', '45%', '65%', '35%', '55%', '75%'];
            const leftPositions = ['20%', '55%', '30%', '75%', '80%', '40%'];

            const top = topPositions[idx % topPositions.length];
            const left = leftPositions[idx % leftPositions.length];

            return (
              <div
                key={prop.id}
                style={{ top, left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300"
              >
                <button
                  onClick={() => setSelectedPin(prop)}
                  className={`px-3 py-1.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-1.5 transition-all transform hover:scale-110 active:scale-95 ${
                    isSelected
                      ? 'bg-[#191c1e] text-white ring-4 ring-[#3525cd] scale-110 z-20'
                      : 'bg-[#3525cd] text-white hover:bg-[#4f46e5]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  ${prop.price.toLocaleString()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => alert('Map zoomed in')}
          className="p-2.5 bg-white text-[#191c1e] rounded-xl shadow-lg hover:bg-[#f2f4f6] active:scale-90"
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
        <button
          onClick={() => alert('Map zoomed out')}
          className="p-2.5 bg-white text-[#191c1e] rounded-xl shadow-lg hover:bg-[#f2f4f6] active:scale-90"
        >
          <span className="material-symbols-outlined text-xl">remove</span>
        </button>
      </div>

      {/* Selected Property Preview Bottom Floating Card */}
      {selectedPin && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#c7c4d8]/40 p-3 flex gap-3.5 items-center">
            <img
              src={selectedPin.image}
              alt={selectedPin.title}
              className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-[#005236] uppercase tracking-wider">
                  {selectedPin.type}
                </span>
                <button
                  onClick={(e) => onToggleFavorite(e, selectedPin.id)}
                  className="text-[#777587] hover:text-[#ba1a1a]"
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      favorites.includes(selectedPin.id) ? 'text-[#ba1a1a]' : ''
                    }`}
                    data-weight={
                      favorites.includes(selectedPin.id) ? 'fill' : undefined
                    }
                  >
                    favorite
                  </span>
                </button>
              </div>

              <h4 className="font-bold text-sm text-[#191c1e] truncate mt-0.5">
                {selectedPin.title}
              </h4>
              <p className="text-xs text-[#777587] truncate mb-2">{selectedPin.address}</p>

              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#3525cd]">
                  ${selectedPin.price.toLocaleString()}
                  <span className="text-[10px] text-[#777587] font-normal">/mo</span>
                </span>

                <button
                  onClick={() => onSelectProperty(selectedPin)}
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
  );
};
