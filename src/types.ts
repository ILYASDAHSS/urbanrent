export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  price: number;
  beds: number | string; // e.g. 2, "Studio"
  baths: number;
  sqft: number;
  image: string;
  gallery: string[];
  badge?: 'AVAILABLE NOW' | 'SPECIAL OFFER' | 'JUST LISTED' | 'FEATURED';
  type: 'Apartment' | 'Loft' | 'Studio' | 'Penthouse' | 'Townhouse';
  petFriendly: boolean;
  inUnitLaundry: boolean;
  parking: boolean;
  balcony: boolean;
  gym: boolean;
  pool: boolean;
  evCharging: boolean;
  description: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  host: {
    name: string;
    avatar: string;
    phone: string;
    email: string;
    isSuperhost: boolean;
  };
  amenities: string[];
  deposit: number;
  leaseTerms: string;
  availableDate: string;
}

export interface FilterState {
  searchQuery: string;
  propertyType: string[]; // e.g. 'Apartments', 'Lofts', etc.
  minPrice: number;
  maxPrice: number;
  beds: string; // 'any', 'studio', '1', '2', '3+'
  baths: string; // 'any', '1', '1.5', '2+'
  petFriendly: boolean;
  inUnitLaundry: boolean;
  parking: boolean;
  gym: boolean;
  pool: boolean;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'newest';
}

export interface TourBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  date: string;
  time: string;
  type: 'in-person' | 'virtual';
  status: 'Confirmed' | 'Pending' | 'Completed';
  hostName: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'price_drop' | 'tour' | 'message' | 'offer';
}
