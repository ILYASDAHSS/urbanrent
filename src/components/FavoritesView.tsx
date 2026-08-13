import React from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface FavoritesViewProps {
  favorites: string[];
  allProperties: Property[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onSelectProperty: (property: Property) => void;
  onGoToSearch: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  allProperties,
  onToggleFavorite,
  onSelectProperty,
  onGoToSearch
}) => {
  const favoriteProperties = allProperties.filter((p) => favorites.includes(p.id));

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#191c1e]">Saved Favorites</h1>
        <p className="text-sm text-[#777587]">
          {favoriteProperties.length} saved property listings
        </p>
      </div>

      {favoriteProperties.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#c7c4d8]/30 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">favorite</span>
          </div>
          <h2 className="text-xl font-bold text-[#191c1e]">No favorites saved yet</h2>
          <p className="text-xs text-[#777587]">
            Tap the heart icon on any property listing to save it to your personal favorites collection for quick comparison.
          </p>
          <button
            onClick={onGoToSearch}
            className="px-6 py-2.5 rounded-xl bg-[#3525cd] text-white font-bold text-xs shadow-md hover:bg-[#4f46e5]"
          >
            Explore Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelectProperty={onSelectProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
};
