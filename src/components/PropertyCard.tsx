import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onSelectProperty: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite,
  onToggleFavorite,
  onSelectProperty
}) => {
  return (
    <article
      onClick={() => onSelectProperty(property)}
      className="group bg-white rounded-xl border border-[#c7c4d8]/30 overflow-hidden shadow-[0px_4px_20px_rgba(79,70,229,0.05)] hover:shadow-[0px_10px_30px_rgba(79,70,229,0.12)] transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e0e3e5]">
        <img
          src={property.image}
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges */}
        {property.badge && (
          <div className="absolute top-4 left-4 flex gap-2">
            {property.badge === 'AVAILABLE NOW' && (
              <span className="bg-[#005236] text-white px-2.5 py-1 rounded text-[12px] font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm bg-opacity-95">
                Available Now
              </span>
            )}
            {property.badge === 'SPECIAL OFFER' && (
              <span className="bg-[#4d44e3] text-white px-2.5 py-1 rounded text-[12px] font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm bg-opacity-95">
                Special Offer
              </span>
            )}
            {property.badge === 'JUST LISTED' && (
              <span className="bg-[#191c1e] text-white px-2.5 py-1 rounded text-[12px] font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm bg-opacity-95">
                Just Listed
              </span>
            )}
            {property.badge === 'FEATURED' && (
              <span className="bg-[#3525cd] text-white px-2.5 py-1 rounded text-[12px] font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm bg-opacity-95">
                Featured
              </span>
            )}
          </div>
        )}

        {/* Favorite FAB */}
        <button
          aria-label="Save to favorites"
          onClick={(e) => onToggleFavorite(e, property.id)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white transition-all shadow-sm group/btn z-10 active:scale-90"
        >
          <span
            className={`material-symbols-outlined transition-colors text-xl ${
              isFavorite
                ? 'text-[#ba1a1a]'
                : 'text-[#777587] group-hover/btn:text-[#ba1a1a]'
            }`}
            data-weight={isFavorite ? 'fill' : undefined}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <div className="text-2xl font-bold text-[#191c1e] tracking-tight">
            ${property.price.toLocaleString()}
            <span className="text-sm font-normal text-[#777587]">/mo</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold leading-snug text-[#191c1e] mb-1 truncate">
          {property.title}
        </h2>

        <p className="text-sm text-[#777587] mb-4 flex items-center gap-1 truncate">
          <span className="material-symbols-outlined text-[18px]">location_on</span>{' '}
          {property.address}
        </p>

        {/* Specs Footer */}
        <div className="mt-auto pt-3 border-t border-[#c7c4d8]/30 flex justify-between items-center text-[#464555]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">bed</span>
            <span className="text-xs font-semibold">
              {typeof property.beds === 'number'
                ? `${property.beds} Bed`
                : property.beds}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">bathtub</span>
            <span className="text-xs font-semibold">{property.baths} Bath</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">square_foot</span>
            <span className="text-xs font-semibold">
              {property.sqft.toLocaleString()} sqft
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
