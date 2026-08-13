import React, { useState, useMemo, useEffect } from 'react';
import { Property, FilterState, TourBooking, NotificationItem } from './types';
import { INITIAL_PROPERTIES, INITIAL_NOTIFICATIONS } from './data/properties';
import { api } from './api';
import { AuthView } from './components/AuthView';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PropertyCard } from './components/PropertyCard';
import { FilterModal } from './components/FilterModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { ScheduleTourModal } from './components/ScheduleTourModal';
import { NotificationModal } from './components/NotificationModal';
import { PostPropertyModal } from './components/PostPropertyModal';
import { MapView } from './components/MapView';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { HomeView } from './components/HomeView';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>('search');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Properties & Favorites
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  // Default favorite matches screenshot card #2 (Astor Tower Lofts)
  const [favorites, setFavorites] = useState<string[]>(['astor-tower-lofts']);

  // Auth state
  const [user, setUser] = useState<any | null>(api.getUser());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);

  // Modals & Selections
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [tourProperty, setTourProperty] = useState<Property | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // User Data State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [bookings, setBookings] = useState<TourBooking[]>([
    {
      id: 'tour-1',
      propertyId: 'lumina-residences',
      propertyTitle: 'The Lumina Residences',
      propertyImage: INITIAL_PROPERTIES[0].image,
      date: '2026-08-11',
      time: '02:00 PM',
      type: 'in-person',
      status: 'Confirmed',
      hostName: 'Victoria Vance',
      tenantName: 'Jordan Fisher',
      tenantEmail: 'jordan.fisher@example.com',
      tenantPhone: '415-555-0198'
    }
  ]);

  useEffect(() => {
    const initAuth = async () => {
      if (api.getToken()) {
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
        } catch (error) {
          api.setAuth(null, null);
          setUser(null);
        }
      }
      setIsAuthLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
    setActiveTab('search');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      setActiveTab('search');
    }
  };

  const handleSubmitNewProperty = async (propertyData: any) => {
    const newProperty: Property = {
      id: `property-${Date.now()}`,
      title: propertyData.title,
      address: propertyData.address,
      city: propertyData.city,
      neighborhood: propertyData.neighborhood,
      zipCode: propertyData.zipCode,
      price: propertyData.price,
      beds: propertyData.beds,
      baths: propertyData.baths,
      sqft: propertyData.sqft,
      image: propertyData.image,
      gallery: [propertyData.image],
      badge: 'JUST LISTED',
      type: propertyData.type,
      petFriendly: propertyData.petFriendly,
      inUnitLaundry: propertyData.inUnitLaundry,
      parking: propertyData.parking,
      balcony: propertyData.balcony,
      gym: propertyData.gym,
      pool: propertyData.pool,
      evCharging: propertyData.evCharging,
      description: propertyData.description,
      rating: 4.8,
      reviewCount: 0,
      lat: propertyData.lat || 37.7749,
      lng: propertyData.lng || -122.4194,
      deposit: propertyData.deposit,
      leaseTerms: propertyData.leaseTerms,
      availableDate: propertyData.availableDate,
      amenities: propertyData.amenities,
      host: {
        name: user?.name || 'Host',
        avatar:
          user?.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        phone: user?.phone || '',
        email: user?.email || 'host@urbanrent.com',
        isSuperhost: false,
      },
    };

    setProperties((prev) => [newProperty, ...prev]);
  };

  const handleDeleteProperty = async (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === id ? { ...booking, status } : booking))
    );
  };

  const handleAddBooking = (newBooking: TourBooking) => {
    setBookings((prev) => [
      {
        ...newBooking,
        tenantName: user?.name || 'Guest',
        tenantEmail: user?.email || '',
        tenantPhone: user?.phone || '',
      },
      ...prev,
    ]);
  };

  // Initial Filter State
  const initialFilterState: FilterState = {
    searchQuery: '',
    propertyType: ['Apartment'],
    minPrice: 1500,
    maxPrice: 3500,
    beds: 'any',
    baths: 'any',
    petFriendly: false,
    inUnitLaundry: false,
    parking: false,
    gym: false,
    pool: false,
    sortBy: 'recommended'
  };

  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Toggle favorite helper
  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter & Search Engine
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Search query
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchAddress = p.address.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          const matchNeighborhood = p.neighborhood.toLowerCase().includes(q);
          const matchZip = p.zipCode.includes(q);
          if (!matchTitle && !matchAddress && !matchCity && !matchNeighborhood && !matchZip) {
            return false;
          }
        }

        // Property type (if any selected)
        if (filters.propertyType.length > 0) {
          if (!filters.propertyType.includes(p.type)) {
            return false;
          }
        }

        // Price range
        if (p.price < filters.minPrice || p.price > filters.maxPrice) {
          return false;
        }

        // Beds filter
        if (filters.beds !== 'any') {
          if (filters.beds === 'studio' && p.beds !== 'Studio') return false;
          if (filters.beds === '1' && p.beds !== 1) return false;
          if (filters.beds === '2' && p.beds !== 2) return false;
          if (filters.beds === '3+' && (typeof p.beds !== 'number' || p.beds < 3)) return false;
        }

        // Baths filter
        if (filters.baths !== 'any') {
          if (filters.baths === '1' && p.baths !== 1) return false;
          if (filters.baths === '1.5' && p.baths !== 1.5) return false;
          if (filters.baths === '2+' && p.baths < 2) return false;
        }

        // Amenities checkboxes
        if (filters.petFriendly && !p.petFriendly) return false;
        if (filters.inUnitLaundry && !p.inUnitLaundry) return false;
        if (filters.parking && !p.parking) return false;
        if (filters.gym && !p.gym) return false;
        if (filters.pool && !p.pool) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'newest') return b.id.localeCompare(a.id);
        return 0; // recommended / default order
      });
  }, [properties, filters]);

  // Quick Chips Actions
  const toggleTypeChip = (type: string) => {
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

  const handleGoToSearchWithQuery = (query?: string) => {
    setActiveTab('search');
    if (query) {
      setFilters((prev) => ({ ...prev, searchQuery: query }));
    }
  };

  const handleCancelBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  if (isAuthLoading) {
    return (
      <div className="bg-[#f7f9fb] min-h-screen flex items-center justify-center text-[#3525cd]">
        <div className="text-center">
          <div className="mb-4 w-12 h-12 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold">Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-sans selection:bg-[#3525cd]/20 selection:text-[#3525cd]">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* Main Container */}
      <main className="max-w-[1280px] w-full mx-auto px-4 md:px-20 py-6 flex-1 relative">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <HomeView
            featuredProperties={properties}
            onSelectProperty={(p) => setSelectedProperty(p)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onGoToSearch={handleGoToSearchWithQuery}
          />
        )}

        {/* TAB 2: SEARCH / EXPLORE */}
        {activeTab === 'search' && (
          <div className="space-y-6 pb-20">
            {/* Search & Filter Bar */}
            <section className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Search Bar Input */}
                <div className="relative w-full flex-grow group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] group-focus-within:text-[#3525cd] transition-colors">
                    search
                  </span>
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                    }
                    placeholder="Search neighborhoods, ZIP codes..."
                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-[#c7c4d8]/30 bg-white focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none transition-all shadow-[0px_4px_20px_rgba(79,70,229,0.05)] text-base placeholder:text-[#777587] text-[#191c1e]"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#777587] hover:text-[#191c1e]"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>

                {/* Filters Trigger Button */}
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#c7c4d8]/50 bg-white hover:bg-[#f2f4f6] transition-all shadow-[0px_4px_20px_rgba(79,70,229,0.05)] text-[#191c1e] font-semibold text-sm whitespace-nowrap active:scale-95"
                >
                  <span className="material-symbols-outlined text-[#777587]">tune</span>
                  Filters
                </button>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex gap-2 overflow-x-auto mt-4 pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {/* Apartment Chip */}
                <button
                  onClick={() => toggleTypeChip('Apartment')}
                  className={`px-4 py-1.5 rounded-full font-semibold text-xs border whitespace-nowrap flex items-center gap-1 transition-all ${
                    filters.propertyType.includes('Apartment')
                      ? 'bg-[#3525cd]/10 text-[#3525cd] border-[#3525cd]/30'
                      : 'bg-[#f2f4f6] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#e0e3e5]'
                  }`}
                >
                  Apartments
                  {filters.propertyType.includes('Apartment') && (
                    <span className="material-symbols-outlined text-sm">close</span>
                  )}
                </button>

                {/* Price Chip */}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, minPrice: 1500, maxPrice: 3000 }))
                  }
                  className={`px-4 py-1.5 rounded-full font-semibold text-xs border whitespace-nowrap transition-all ${
                    filters.minPrice === 1500 && filters.maxPrice === 3000
                      ? 'bg-[#3525cd]/10 text-[#3525cd] border-[#3525cd]/30'
                      : 'bg-[#f2f4f6] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#e0e3e5]'
                  }`}
                >
                  $1.5k - $3k
                </button>

                {/* 2+ Beds Chip */}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      beds: prev.beds === '2' ? 'any' : '2'
                    }))
                  }
                  className={`px-4 py-1.5 rounded-full font-semibold text-xs border whitespace-nowrap transition-all ${
                    filters.beds === '2'
                      ? 'bg-[#3525cd]/10 text-[#3525cd] border-[#3525cd]/30'
                      : 'bg-[#f2f4f6] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#e0e3e5]'
                  }`}
                >
                  2+ Beds
                </button>

                {/* Pet Friendly Chip */}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, petFriendly: !prev.petFriendly }))
                  }
                  className={`px-4 py-1.5 rounded-full font-semibold text-xs border whitespace-nowrap transition-all ${
                    filters.petFriendly
                      ? 'bg-[#3525cd]/10 text-[#3525cd] border-[#3525cd]/30'
                      : 'bg-[#f2f4f6] text-[#464555] border-[#c7c4d8]/30 hover:bg-[#e0e3e5]'
                  }`}
                >
                  Pet Friendly
                </button>
              </div>
            </section>

            {/* Results Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-[#191c1e] mb-1">
                  Properties near Downtown
                </h1>
                <p className="text-sm text-[#777587]">
                  Showing {filteredProperties.length} premium listings
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm text-[#464555] font-semibold">
                <label htmlFor="sortSelect" className="text-xs text-[#777587]">Sort by:</label>
                <select
                  id="sortSelect"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as FilterState['sortBy']
                    }))
                  }
                  className="bg-transparent font-bold text-[#3525cd] cursor-pointer outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* View Switching Layout */}
            {viewMode === 'map' ? (
              <MapView
                properties={filteredProperties}
                onSelectProperty={(p) => setSelectedProperty(p)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {filteredProperties.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-[#c7c4d8]/30 space-y-3">
                    <span className="material-symbols-outlined text-4xl text-[#777587]">
                      search_off
                    </span>
                    <h3 className="font-bold text-lg text-[#191c1e]">
                      No properties match your filters
                    </h3>
                    <p className="text-xs text-[#777587]">
                      Try widening your price range or clearing specific filter tags.
                    </p>
                    <button
                      onClick={() => setFilters(initialFilterState)}
                      className="px-4 py-2 rounded-xl bg-[#3525cd] text-white font-semibold text-xs shadow-md hover:bg-[#4f46e5]"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isFavorite={favorites.includes(property.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectProperty={(p) => setSelectedProperty(p)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FAVORITES */}
        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            allProperties={properties}
            onToggleFavorite={handleToggleFavorite}
            onSelectProperty={(p) => setSelectedProperty(p)}
            onGoToSearch={() => setActiveTab('search')}
          />
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && user && (
          <ProfileView
            user={user}
            bookings={bookings}
            properties={properties}
            onCancelBooking={handleCancelBooking}
            onLogout={handleLogout}
            onAddPropertyOpen={() => setIsPostPropertyModalOpen(true)}
            onDeleteProperty={handleDeleteProperty}
            onUpdateBookingStatus={handleUpdateBookingStatus}
          />
        )}
      </main>

      {/* Floating Map / List Toggle Button (Only in Search tab) */}
      {activeTab === 'search' && (
        <button
          onClick={() => setViewMode((prev) => (prev === 'list' ? 'map' : 'list'))}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-30 bg-[#4d44e3] hover:bg-[#3525cd] text-white px-6 py-3 rounded-full shadow-[0px_10px_30px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2 font-semibold text-sm active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-xl" data-weight="fill">
            {viewMode === 'list' ? 'map' : 'view_module'}
          </span>
          {viewMode === 'list' ? 'Map View' : 'List View'}
        </button>
      )}

      {/* Mobile Bottom Dock Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
      />

      {/* MODALS */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={() => setFilters(initialFilterState)}
        resultsCount={filteredProperties.length}
      />

      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenScheduleTour={(p) => {
          setSelectedProperty(null);
          setTourProperty(p);
        }}
      />

      <ScheduleTourModal
        property={tourProperty}
        onClose={() => setTourProperty(null)}
        onConfirmBooking={handleAddBooking}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkNotificationsRead}
      />

      <PostPropertyModal
        isOpen={isPostPropertyModalOpen}
        onClose={() => setIsPostPropertyModalOpen(false)}
        onSubmit={handleSubmitNewProperty}
      />
    </div>
  );
}
