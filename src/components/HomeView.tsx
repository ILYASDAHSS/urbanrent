import React from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface HomeViewProps {
  featuredProperties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onGoToSearch: (query?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  featuredProperties,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  onGoToSearch
}) => {
  const neighborhoods = [
    {
      name: 'Downtown San Francisco',
      count: '18 Available',
      image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=600&q=80',
      query: 'San Francisco'
    },
    {
      name: 'River North Chicago',
      count: '12 Available',
      image: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=600&q=80',
      query: 'Chicago'
    },
    {
      name: 'Tribeca New York',
      count: '15 Available',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
      query: 'New York'
    },
    {
      name: 'Downtown Los Angeles',
      count: '9 Available',
      image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=600&q=80',
      query: 'Los Angeles'
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-[#191c1e] text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#3525cd] text-white text-xs font-bold uppercase tracking-wider">
            Curated Luxury Living
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Elevated Urban Homes & High-Rise Residences
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Browse verified luxury apartments, lofts, and high-rise residences across top metropolitan neighborhoods.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onGoToSearch()}
              className="px-6 py-3.5 rounded-xl bg-[#3525cd] text-white font-bold text-sm shadow-lg hover:bg-[#4f46e5] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">search</span>
              Browse All Properties
            </button>
          </div>
        </div>
      </section>

      {/* Popular Neighborhoods */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#191c1e]">Top Neighborhoods</h2>
            <p className="text-sm text-[#777587]">Explore luxury rentals in high-demand hubs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {neighborhoods.map((n, i) => (
            <div
              key={i}
              onClick={() => onGoToSearch(n.query)}
              className="group relative rounded-2xl overflow-hidden h-44 cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={n.image}
                alt={n.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                <h3 className="font-bold text-base leading-snug">{n.name}</h3>
                <p className="text-xs text-gray-300">{n.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#191c1e]">Featured Listings</h2>
            <p className="text-sm text-[#777587]">Handpicked apartments ready for immediate move-in</p>
          </div>
          <button
            onClick={() => onGoToSearch()}
            className="text-xs font-bold text-[#3525cd] hover:underline flex items-center gap-1"
          >
            See all listings <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 3).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProperty={onSelectProperty}
            />
          ))}
        </div>
      </section>

      {/* Why UrbanRent Perks */}
      <section className="p-8 rounded-3xl bg-white border border-[#c7c4d8]/30 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-[#3525cd]/10 text-[#3525cd] rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <h3 className="font-bold text-base text-[#191c1e]">100% Verified Properties</h3>
          <p className="text-xs text-[#777587]">
            Every home is physically inspected and verified to match images and lease details accurately.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-12 h-12 bg-[#3525cd]/10 text-[#3525cd] rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
          </div>
          <h3 className="font-bold text-base text-[#191c1e]">Instant Tour Booking</h3>
          <p className="text-xs text-[#777587]">
            Schedule in-person viewings or live HD virtual tours directly with premier property managers.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-12 h-12 bg-[#3525cd]/10 text-[#3525cd] rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">description</span>
          </div>
          <h3 className="font-bold text-base text-[#191c1e]">Zero Hidden Fees</h3>
          <p className="text-xs text-[#777587]">
            Transparent pricing with detailed breakdowns of deposits, utility fees, and lease terms upfront.
          </p>
        </div>
      </section>
    </div>
  );
};
