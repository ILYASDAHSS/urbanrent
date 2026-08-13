import React, { useState } from 'react';
import { Property } from '../types';

interface PostPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (propertyData: any) => Promise<void>;
}

const IMAGE_TEMPLATES = [
  {
    name: 'Modern Villa',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Loft Interior',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Resort Apartment',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sky Penthouse',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  },
];

export const PostPropertyModal: React.FC<PostPropertyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [neighborhood, setNeighborhood] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [price, setPrice] = useState(2000);
  const [beds, setBeds] = useState('2');
  const [baths, setBaths] = useState(2);
  const [sqft, setSqft] = useState(1000);
  const [type, setType] = useState('Apartment');
  const [image, setImage] = useState(IMAGE_TEMPLATES[0].url);
  const [description, setDescription] = useState('');
  const [deposit, setDeposit] = useState(2000);
  const [leaseTerms, setLeaseTerms] = useState('12 Months');
  const [availableDate, setAvailableDate] = useState('Immediately');

  // Amenities
  const [petFriendly, setPetFriendly] = useState(false);
  const [inUnitLaundry, setInUnitLaundry] = useState(false);
  const [parking, setParking] = useState(false);
  const [balcony, setBalcony] = useState(false);
  const [gym, setGym] = useState(false);
  const [pool, setPool] = useState(false);
  const [evCharging, setEvCharging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amenitiesList: string[] = [];
    if (petFriendly) amenitiesList.push('Pet Friendly');
    if (inUnitLaundry) amenitiesList.push('In-Unit Laundry');
    if (parking) amenitiesList.push('Garage Parking');
    if (balcony) amenitiesList.push('Balcony / Terrace');
    if (gym) amenitiesList.push('Fitness Center');
    if (pool) amenitiesList.push('Resort Pool');
    if (evCharging) amenitiesList.push('EV Charger');

    const propertyData = {
      title,
      address,
      city,
      neighborhood,
      zipCode,
      price: Number(price),
      beds,
      baths: Number(baths),
      sqft: Number(sqft),
      type,
      image,
      description,
      deposit: Number(deposit),
      leaseTerms,
      availableDate,
      petFriendly,
      inUnitLaundry,
      parking,
      balcony,
      gym,
      pool,
      evCharging,
      amenities: amenitiesList,
    };

    try {
      await onSubmit(propertyData);
      onClose();
      // Reset form
      setTitle('');
      setAddress('');
      setNeighborhood('');
      setZipCode('');
      setPrice(2000);
      setBeds('2');
      setBaths(2);
      setSqft(1000);
      setDescription('');
      setDeposit(2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit property listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f7f9fb] w-full max-w-2xl rounded-2xl border border-[#c7c4d8]/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#c7c4d8]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3525cd]">add_business</span>
            <h2 className="text-xl font-bold text-[#191c1e]">Post a New Listing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#777587] hover:bg-gray-100 hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#3525cd] uppercase tracking-wider">
              Basic Details
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-[#464555] mb-1">Property Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern High-Floor Luxury Condo"
                className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">Property Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm cursor-pointer"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Loft">Loft</option>
                  <option value="Studio">Studio</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Townhouse">Townhouse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">Lease Terms</label>
                <input
                  type="text"
                  required
                  value={leaseTerms}
                  onChange={(e) => setLeaseTerms(e.target.value)}
                  placeholder="e.g. 12 Months"
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#3525cd] uppercase tracking-wider">
              Location Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#464555] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm cursor-pointer"
                >
                  <option value="San Francisco">San Francisco</option>
                  <option value="Chicago">Chicago</option>
                  <option value="Los Angeles">Los Angeles</option>
                  <option value="New York">New York</option>
                  <option value="Seattle">Seattle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">Neighborhood</label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g. River North"
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#464555] mb-1">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="94103"
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Specs & Rent */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#3525cd] uppercase tracking-wider">
              Specs & Financials
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">Rent / mo</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">Beds</label>
                <input
                  type="text"
                  required
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  placeholder="e.g. 2 or Studio"
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">Baths</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={baths}
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#464555] mb-1">Square Feet</label>
                <input
                  type="number"
                  required
                  value={sqft}
                  onChange={(e) => setSqft(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#464555] mb-1">Deposit</label>
                <input
                  type="number"
                  required
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#464555] mb-1">Available Date</label>
                <input
                  type="text"
                  required
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  placeholder="e.g. Immediately"
                  className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Image Template Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#3525cd] uppercase tracking-wider">
              Listing Image
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {IMAGE_TEMPLATES.map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.name}
                  onClick={() => setImage(tmpl.url)}
                  className={`p-1.5 rounded-xl border text-left overflow-hidden flex flex-col gap-1 transition-all ${
                    image === tmpl.url
                      ? 'border-[#3525cd] bg-[#3525cd]/5 ring-1 ring-[#3525cd]'
                      : 'border-[#c7c4d8]/40 hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={tmpl.url}
                    alt={tmpl.name}
                    className="w-full h-16 object-cover rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-[#191c1e] text-center w-full block">
                    {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#464555] mb-1">Or Custom Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm"
              />
            </div>
          </div>

          {/* Section 5: Amenities */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#3525cd] uppercase tracking-wider">
              Amenities & Tags
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#464555] bg-white p-3 rounded-xl border border-[#c7c4d8]/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                Pet Friendly
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#464555] bg-white p-3 rounded-xl border border-[#c7c4d8]/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inUnitLaundry}
                  onChange={(e) => setInUnitLaundry(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                In-Unit Laundry
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#464555] bg-white p-3 rounded-xl border border-[#c7c4d8]/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={parking}
                  onChange={(e) => setParking(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                Garage Parking
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#464555] bg-white p-3 rounded-xl border border-[#c7c4d8]/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={balcony}
                  onChange={(e) => setBalcony(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                Private Balcony
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#464555] bg-white p-3 rounded-xl border border-[#c7c4d8]/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={gym}
                  onChange={(e) => setGym(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                Fitness Gym
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#464555] bg-white p-3 rounded-xl border border-[#c7c4d8]/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pool}
                  onChange={(e) => setPool(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                Resort Pool
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#464555] bg-white p-3 rounded-xl border border-[#c7c4d8]/30 col-span-2 sm:col-span-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={evCharging}
                  onChange={(e) => setEvCharging(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                EV Charging
              </label>
            </div>
          </div>

          {/* Section 6: Description */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#3525cd] uppercase tracking-wider">
              Description
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#464555] mb-1">About the Listing</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give details about your property (finishes, amenities, local transit, views, etc.)..."
                className="w-full px-4 py-2 rounded-xl border border-[#c7c4d8]/50 bg-white focus:border-[#3525cd] outline-none text-sm resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-[#c7c4d8]/20 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#c7c4d8]/50 hover:bg-gray-100 font-bold text-sm text-[#464555] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2c1eb5] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-75"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Publish Listing
                <span className="material-symbols-outlined text-sm">publish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
