import React from 'react';
import { FilterState } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  resultsCount: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onReset,
  resultsCount
}) => {
  if (!isOpen) return null;

  const propertyTypesList = ['Apartment', 'Loft', 'Studio', 'Penthouse', 'Townhouse'];

  const togglePropertyType = (type: string) => {
    setFilters((prev) => {
      const exists = prev.propertyType.includes(type);
      return {
        ...prev,
        propertyType: exists
          ? prev.propertyType.filter((t) => t !== type)
          : [...prev.propertyType, type]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#c7c4d8]/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3525cd]">tune</span>
            <h2 className="text-xl font-bold text-[#191c1e]">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#eceef0] text-[#777587] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Property Type */}
          <div>
            <h3 className="text-sm font-semibold text-[#191c1e] mb-3">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {propertyTypesList.map((type) => {
                const isSelected = filters.propertyType.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#3525cd] text-white border-[#3525cd]'
                        : 'bg-[#f2f4f6] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#e0e3e5]'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-[#191c1e]">Monthly Rent Range</h3>
              <span className="text-sm font-bold text-[#3525cd]">
                ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-[#777587] mb-1 block">Min Price ($)</label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="100"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: Number(e.target.value)
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#c7c4d8]/40 bg-[#f7f9fb] text-sm text-[#191c1e] font-medium"
                />
              </div>

              <span className="text-[#777587] mt-5">-</span>

              <div className="flex-1">
                <label className="text-xs text-[#777587] mb-1 block">Max Price ($)</label>
                <input
                  type="number"
                  min="1000"
                  max="15000"
                  step="100"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: Number(e.target.value)
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#c7c4d8]/40 bg-[#f7f9fb] text-sm text-[#191c1e] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <h3 className="text-sm font-semibold text-[#191c1e] mb-3">Bedrooms</h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Any', value: 'any' },
                { label: 'Studio', value: 'studio' },
                { label: '1 Bed', value: '1' },
                { label: '2 Beds', value: '2' },
                { label: '3+ Beds', value: '3+' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, beds: item.value }))
                  }
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border text-center transition-all ${
                    filters.beds === item.value
                      ? 'bg-[#3525cd] text-white border-[#3525cd]'
                      : 'bg-[#f2f4f6] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#e0e3e5]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <h3 className="text-sm font-semibold text-[#191c1e] mb-3">Bathrooms</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Any', value: 'any' },
                { label: '1 Bath', value: '1' },
                { label: '1.5 Bath', value: '1.5' },
                { label: '2+ Baths', value: '2+' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, baths: item.value }))
                  }
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border text-center transition-all ${
                    filters.baths === item.value
                      ? 'bg-[#3525cd] text-white border-[#3525cd]'
                      : 'bg-[#f2f4f6] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#e0e3e5]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities & Policies */}
          <div>
            <h3 className="text-sm font-semibold text-[#191c1e] mb-3">
              Amenities & Policies
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'petFriendly', label: 'Pet Friendly', icon: 'pets' },
                { key: 'inUnitLaundry', label: 'In-Unit Laundry', icon: 'local_laundry_service' },
                { key: 'parking', label: 'Parking Included', icon: 'directions_car' },
                { key: 'gym', label: 'Fitness Center', icon: 'fitness_center' },
                { key: 'pool', label: 'Swimming Pool', icon: 'pool' }
              ].map((item) => {
                const checked = filters[item.key as keyof FilterState] as boolean;
                return (
                  <label
                    key={item.key}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-[#3525cd]/10 border-[#3525cd] text-[#3525cd]'
                        : 'bg-[#f7f9fb] border-[#c7c4d8]/30 text-[#464555] hover:bg-[#eceef0]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">Sort By</h3>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FilterState['sortBy']
                }))
              }
              className="w-full px-4 py-2.5 rounded-xl border border-[#c7c4d8]/30 bg-[#f7f9fb] text-sm text-[#191c1e] font-semibold outline-none focus:border-[#3525cd]"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Listings</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#c7c4d8]/30 bg-[#f7f9fb] flex items-center justify-between gap-4">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-semibold text-[#777587] hover:text-[#191c1e] transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[#3525cd] text-white font-semibold text-sm shadow-md hover:bg-[#4f46e5] active:scale-95 transition-all flex items-center gap-2"
          >
            Show {resultsCount} Properties
          </button>
        </div>
      </div>
    </div>
  );
};
