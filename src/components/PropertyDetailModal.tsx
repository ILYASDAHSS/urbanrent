import React, { useState } from 'react';
import { Property } from '../types';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onOpenScheduleTour: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenScheduleTour
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showContactHost, setShowContactHost] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  if (!property) return null;

  const handleApply = () => {
    setApplicationSubmitted(true);
    setTimeout(() => {
      setApplicationSubmitted(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto relative">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-3 border-b border-[#c7c4d8]/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3525cd]">apartment</span>
            <span className="font-bold text-[#191c1e] truncate max-w-xs sm:max-w-md">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleFavorite(e, property.id)}
              className="p-2 rounded-full hover:bg-[#eceef0] transition-colors"
              title="Save to favorites"
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  isFavorite ? 'text-[#ba1a1a]' : 'text-[#777587]'
                }`}
                data-weight={isFavorite ? 'fill' : undefined}
              >
                favorite
              </span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: property.title,
                    text: `Check out ${property.title} on UrbanRent!`,
                    url: window.location.href
                  });
                } else {
                  alert('Link copied to clipboard!');
                }
              }}
              className="p-2 rounded-full hover:bg-[#eceef0] text-[#777587] transition-colors"
              title="Share property"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#eceef0] text-[#191c1e] transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Image & Gallery Selector */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#e0e3e5]">
              <img
                src={property.gallery[activeImageIdx] || property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.badge && (
                <div className="absolute top-4 left-4 bg-[#005236] text-white px-3 py-1 rounded text-xs font-bold tracking-wider uppercase shadow-md">
                  {property.badge}
                </div>
              )}
            </div>

            {property.gallery && property.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {property.gallery.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIdx(index)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIdx === index
                        ? 'border-[#3525cd] scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#c7c4d8]/30">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#191c1e]">
                {property.title}
              </h1>
              <p className="text-sm text-[#777587] flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-base text-[#3525cd]">
                  location_on
                </span>
                {property.address} ({property.neighborhood})
              </p>
            </div>

            <div className="sm:text-right">
              <div className="text-3xl font-bold text-[#191c1e]">
                ${property.price.toLocaleString()}
                <span className="text-sm text-[#777587] font-normal">/mo</span>
              </div>
              <p className="text-xs text-[#005236] font-semibold mt-0.5">
                Deposit: ${property.deposit.toLocaleString()} • Available {property.availableDate}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#f2f4f6] text-[#191c1e]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#3525cd]">bed</span>
              <div>
                <p className="text-xs text-[#777587]">Bedrooms</p>
                <p className="font-bold text-sm">
                  {typeof property.beds === 'number'
                    ? `${property.beds} Bedrooms`
                    : property.beds}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#3525cd]">bathtub</span>
              <div>
                <p className="text-xs text-[#777587]">Bathrooms</p>
                <p className="font-bold text-sm">{property.baths} Baths</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#3525cd]">square_foot</span>
              <div>
                <p className="text-xs text-[#777587]">Square Feet</p>
                <p className="font-bold text-sm">{property.sqft.toLocaleString()} sqft</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#3525cd]">verified</span>
              <div>
                <p className="text-xs text-[#777587]">Lease Term</p>
                <p className="font-bold text-sm">{property.leaseTerms}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-[#191c1e] mb-2">About this Home</h3>
            <p className="text-sm text-[#464555] leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-lg font-bold text-[#191c1e] mb-3">Property Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f7f9fb] border border-[#c7c4d8]/20 text-xs font-semibold text-[#191c1e]"
                >
                  <span className="material-symbols-outlined text-sm text-[#3525cd]">
                    check_circle
                  </span>
                  {amenity}
                </div>
              ))}
              {property.petFriendly && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f7f9fb] border border-[#c7c4d8]/20 text-xs font-semibold text-[#191c1e]">
                  <span className="material-symbols-outlined text-sm text-[#3525cd]">pets</span>
                  Pet Friendly
                </div>
              )}
              {property.inUnitLaundry && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f7f9fb] border border-[#c7c4d8]/20 text-xs font-semibold text-[#191c1e]">
                  <span className="material-symbols-outlined text-sm text-[#3525cd]">local_laundry_service</span>
                  In-Unit Laundry
                </div>
              )}
              {property.gym && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f7f9fb] border border-[#c7c4d8]/20 text-xs font-semibold text-[#191c1e]">
                  <span className="material-symbols-outlined text-sm text-[#3525cd]">fitness_center</span>
                  Fitness Center
                </div>
              )}
            </div>
          </div>

          {/* Host Profile & Contact */}
          <div className="p-4 rounded-2xl bg-[#f7f9fb] border border-[#c7c4d8]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={property.host.avatar}
                alt={property.host.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#3525cd]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#191c1e]">{property.host.name}</h4>
                  {property.host.isSuperhost && (
                    <span className="bg-[#3525cd]/10 text-[#3525cd] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Premier Host
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#777587]">
                  Property Manager • Response time &lt; 15 mins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowContactHost(!showContactHost)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-[#3525cd] text-[#3525cd] font-semibold text-xs hover:bg-[#3525cd]/10 transition-colors"
              >
                {showContactHost ? 'Hide Details' : 'Contact Manager'}
              </button>
            </div>
          </div>

          {showContactHost && (
            <div className="p-4 rounded-xl bg-[#3525cd]/5 border border-[#3525cd]/20 space-y-2 text-xs text-[#191c1e] animate-fade-in">
              <p>
                <strong>Phone:</strong> {property.host.phone}
              </p>
              <p>
                <strong>Email:</strong> {property.host.email}
              </p>
              <p className="text-[#777587]">
                Reference Listing ID: #{property.id}
              </p>
            </div>
          )}

          {applicationSubmitted && (
            <div className="p-4 rounded-xl bg-[#005236] text-white flex items-center gap-3 animate-fade-in">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
              <div>
                <p className="font-bold text-sm">Application Request Sent!</p>
                <p className="text-xs text-white/90">
                  {property.host.name} has received your inquiry for {property.title}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-[#c7c4d8]/30 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-center sm:text-left">
            <span className="text-xs text-[#777587]">Total Monthly</span>
            <div className="text-xl font-bold text-[#191c1e]">
              ${property.price.toLocaleString()} <span className="text-xs text-[#777587]">/mo</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onOpenScheduleTour(property)}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-[#3525cd] text-[#3525cd] hover:bg-[#3525cd]/10 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              Schedule Tour
            </button>

            <button
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#3525cd] text-white hover:bg-[#4f46e5] font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
