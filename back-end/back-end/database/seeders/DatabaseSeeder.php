<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@urbanrent.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
            'phone' => '(800) 555-0199',
            'is_superhost' => false,
        ]);

        $victoria = User::create([
            'name' => 'Victoria Vance',
            'email' => 'owner@urbanrent.com',
            'password' => Hash::make('password123'),
            'role' => 'homeowner',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            'phone' => '(415) 890-2341',
            'is_superhost' => true,
        ]);

        $marcus = User::create([
            'name' => 'Marcus Sterling',
            'email' => 'marcus@urbanrent.com',
            'password' => Hash::make('password123'),
            'role' => 'homeowner',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            'phone' => '(312) 402-9982',
            'is_superhost' => true,
        ]);

        $alex = User::create([
            'name' => 'Alex Rivera',
            'email' => 'user@urbanrent.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
            'phone' => '(555) 234-5678',
            'is_superhost' => false,
        ]);

        // 2. Seed Properties
        $p1 = Property::create([
            'host_id' => $victoria->id,
            'title' => 'The Lumina Residences',
            'address' => '1045 Mission St, San Francisco',
            'city' => 'San Francisco',
            'neighborhood' => 'Downtown / SoMa',
            'zip_code' => '94103',
            'price' => 2500,
            'beds' => '2',
            'baths' => 2.0,
            'sqft' => 1200,
            'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7n4tiioraSk6X_D_pKe-9BloCksP2p28m3JzswNefcHTfjfgRWL-zHmF2pu3kwA0iiF8IMXam0U0Up1DcPsIu3crd1MUtyfk1BbCxaG-A4ei4lQbI7KlBDQC9VYW0PDD7d4w1Kwyu4MAbWw2JX2q9iIdrBBtcD9LZCk6hM9OIDx3soWbpEJshG2W85t3fqk480z-UFXWzQCnec2l-YD8YyUVGFQr5t1F4bkHeog-x9lFBSX6xgb03',
            'gallery' => [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuD7n4tiioraSk6X_D_pKe-9BloCksP2p28m3JzswNefcHTfjfgRWL-zHmF2pu3kwA0iiF8IMXam0U0Up1DcPsIu3crd1MUtyfk1BbCxaG-A4ei4lQbI7KlBDQC9VYW0PDD7d4w1Kwyu4MAbWw2JX2q9iIdrBBtcD9LZCk6hM9OIDx3soWbpEJshG2W85t3fqk480z-UFXWzQCnec2l-YD8YyUVGFQr5t1F4bkHeog-x9lFBSX6xgb03',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
            ],
            'badge' => 'AVAILABLE NOW',
            'type' => 'Apartment',
            'pet_friendly' => true,
            'in_unit_laundry' => true,
            'parking' => true,
            'balcony' => true,
            'gym' => true,
            'pool' => true,
            'ev_charging' => true,
            'description' => 'Experience refined urban living at The Lumina Residences. High-floor corner residence featuring floor-to-ceiling glass wrapped around panoramic cityscape views. Outfitted with Gaggenau appliances, custom Italian cabinetry, motorized shades, and continuous hardwood flooring.',
            'rating' => 4.9,
            'review_count' => 28,
            'lat' => 37.7818,
            'lng' => -122.4082,
            'amenities' => ['24/7 Concierge', 'Rooftop Lounge & BBQ', 'Hydrotherapy Spa Pool', 'Private Theater', 'Rock Climbing Wall', 'Valet Parking'],
            'deposit' => 2500,
            'lease_terms' => '12 Months Minimum',
            'available_date' => 'Immediately'
        ]);

        $p2 = Property::create([
            'host_id' => $marcus->id,
            'title' => 'Astor Tower Lofts',
            'address' => '550 N State St, Chicago',
            'city' => 'Chicago',
            'neighborhood' => 'River North',
            'zip_code' => '60654',
            'price' => 3200,
            'beds' => '1',
            'baths' => 1.5,
            'sqft' => 950,
            'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLqJcciqSSb7347ZObLBEY1sG_XkncXkwIXpsPXRFZq6acM1eJvkB91Hhq8sj3jV416shNPKF-QX2fb413eOBTEV24rpHS_wwvVrbVz1LcKvgG0g8by1_zwYXmFjf58f8UtVuS0Jm5arvJ_Jb6pxI7M8lzgr1Hg84_QR9OU7-tCOl67lZpxXkBlJJktN1PfNb2EnTRv1BMIvX5xOk8y0YCwgCxSaByivJFMljVVHYa8wc09Odd9Yqx',
            'gallery' => [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCLqJcciqSSb7347ZObLBEY1sG_XkncXkwIXpsPXRFZq6acM1eJvkB91Hhq8sj3jV416shNPKF-QX2fb413eOBTEV24rpHS_wwvVrbVz1LcKvgG0g8by1_zwYXmFjf58f8UtVuS0Jm5arvJ_Jb6pxI7M8lzgr1Hg84_QR9OU7-tCOl67lZpxXkBlJJktN1PfNb2EnTRv1BMIvX5xOk8y0YCwgCxSaByivJFMljVVHYa8wc09Odd9Yqx',
                'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
            ],
            'badge' => 'JUST LISTED',
            'type' => 'Loft',
            'pet_friendly' => true,
            'in_unit_laundry' => true,
            'parking' => true,
            'balcony' => false,
            'gym' => true,
            'pool' => false,
            'ev_charging' => true,
            'description' => 'An architectural masterpiece in River North. Modern loft featuring matte black chef kitchen cabinetry, white quartz waterfall islands, integrated Miele appliances, and custom under-cabinet cove lighting.',
            'rating' => 4.8,
            'review_count' => 19,
            'lat' => 41.8924,
            'lng' => -87.6278,
            'amenities' => ['Skyline Sun Deck', 'Co-working Suites', 'Fitness Center', 'Bike Storage', 'Doorman Service'],
            'deposit' => 3200,
            'lease_terms' => '6 to 18 Months',
            'available_date' => 'Sep 1, 2026'
        ]);

        $p3 = Property::create([
            'host_id' => $victoria->id,
            'title' => 'The Harrison',
            'address' => '205 Folsom St, San Francisco',
            'city' => 'San Francisco',
            'neighborhood' => 'Downtown / Rincon Hill',
            'zip_code' => '94105',
            'price' => 1850,
            'beds' => 'Studio',
            'baths' => 1.0,
            'sqft' => 650,
            'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG2xe-q8vdOC47Og8HxHmQhdY8URKmZ3OKc8XkikTMZZpopn9-rTSUxCKPcUc28t2c_3GE1E_PhSy0LGjxTQ5LvFKuvDKtD3gZgtAMOaiH9gO981j4-OU_x4bYACZ9IqI4OrEiZ3L3qGp3gOEIgfKdl7IHixu_FSKk3c0On2Bsr6gUvCagt5IwFnDMZ_I6inR5HU1FOoP01igd81csen_Z-m6xrym3EUiOI8xqofw8-ET7NYMkrSZU',
            'gallery' => [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDG2xe-q8vdOC47Og8HxHmQhdY8URKmZ3OKc8XkikTMZZpopn9-rTSUxCKPcUc28t2c_3GE1E_PhSy0LGjxTQ5LvFKuvDKtD3gZgtAMOaiH9gO981j4-OU_x4bYACZ9IqI4OrEiZ3L3qGp3gOEIgfKdl7IHixu_FSKk3c0On2Bsr6gUvCagt5IwFnDMZ_I6inR5HU1FOoP01igd81csen_Z-m6xrym3EUiOI8xqofw8-ET7NYMkrSZU',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80'
            ],
            'badge' => 'SPECIAL OFFER',
            'type' => 'Studio',
            'pet_friendly' => false,
            'in_unit_laundry' => true,
            'parking' => false,
            'balcony' => true,
            'gym' => true,
            'pool' => true,
            'ev_charging' => false,
            'description' => 'Designed by Ken Fulk, The Harrison redefines luxury high-rise studio living in San Francisco. Enjoy breathtaking views towards the Bay Bridge, marble accents, and access to Uncle Harrys 49th floor lounge.',
            'rating' => 4.95,
            'review_count' => 42,
            'lat' => 37.7885,
            'lng' => -122.3923,
            'amenities' => ['Uncle Harrys 49th Floor Lounge', 'Outdoor Swimming Pool', 'Private Wine Cellar', 'Fitness Center', 'Valet Parking'],
            'deposit' => 1850,
            'lease_terms' => '12 Months',
            'available_date' => 'Immediately'
        ]);

        $p4 = Property::create([
            'host_id' => $victoria->id,
            'title' => 'Grand View Tower & Suites',
            'address' => '888 S Hope St, Los Angeles',
            'city' => 'Los Angeles',
            'neighborhood' => 'Downtown LA',
            'zip_code' => '90017',
            'price' => 2950,
            'beds' => '2',
            'baths' => 2.0,
            'sqft' => 1100,
            'image' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            'gallery' => [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
            ],
            'badge' => 'FEATURED',
            'type' => 'Apartment',
            'pet_friendly' => true,
            'in_unit_laundry' => true,
            'parking' => true,
            'balcony' => true,
            'gym' => true,
            'pool' => true,
            'ev_charging' => true,
            'description' => 'Ultra-modern resort style high rise featuring resort poolside cabanas, state of the art wellness center, private dog run, and floor to ceiling windows looking out to DTLA skyline.',
            'rating' => 4.7,
            'review_count' => 15,
            'lat' => 34.0478,
            'lng' => -118.2588,
            'amenities' => ['Resort Pool', 'Pet Park', 'Fitness & Yoga Studio', '24h Security'],
            'deposit' => 2950,
            'lease_terms' => '12 Months',
            'available_date' => 'Immediately'
        ]);

        $p5 = Property::create([
            'host_id' => $marcus->id,
            'title' => 'The Hudson Sky Penthouse',
            'address' => '120 Hudson St, New York',
            'city' => 'New York',
            'neighborhood' => 'Tribeca',
            'zip_code' => '10013',
            'price' => 4500,
            'beds' => '3',
            'baths' => 2.5,
            'sqft' => 1800,
            'image' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
            'gallery' => [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'
            ],
            'badge' => 'AVAILABLE NOW',
            'type' => 'Penthouse',
            'pet_friendly' => true,
            'in_unit_laundry' => true,
            'parking' => true,
            'balcony' => true,
            'gym' => true,
            'pool' => false,
            'ev_charging' => true,
            'description' => 'Exquisite multi-level penthouse in prime Tribeca. Soaring 14ft beamed ceilings, exposed brick accent walls, private elevator entry, and a 500 sqft landscaped private rooftop terrace.',
            'rating' => 5.0,
            'review_count' => 34,
            'lat' => 40.7191,
            'lng' => -74.0089,
            'amenities' => ['Private Rooftop Deck', 'Direct Elevator Access', 'Wine Cellar', 'Fireplace'],
            'deposit' => 4500,
            'lease_terms' => '12-24 Months',
            'available_date' => 'Oct 1, 2026'
        ]);

        $p6 = Property::create([
            'host_id' => $victoria->id,
            'title' => 'Emerald Bay Residences',
            'address' => '1100 2nd Ave, Seattle',
            'city' => 'Seattle',
            'neighborhood' => 'Downtown',
            'zip_code' => '98101',
            'price' => 2150,
            'beds' => '1',
            'baths' => 1.0,
            'sqft' => 780,
            'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'gallery' => [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
            ],
            'badge' => 'SPECIAL OFFER',
            'type' => 'Apartment',
            'pet_friendly' => true,
            'in_unit_laundry' => true,
            'parking' => true,
            'balcony' => true,
            'gym' => true,
            'pool' => false,
            'ev_charging' => true,
            'description' => 'Sleek luxury home boasting views of Puget Sound and Mount Rainier. Modern quartz surfaces, stainless steel smart range, floor-to-ceiling double paned soundproof glass.',
            'rating' => 4.85,
            'review_count' => 22,
            'lat' => 47.6062,
            'lng' => -122.3321,
            'amenities' => ['Rooftop Deck', 'Dog Wash Station', 'Electric Vehicle Chargers', 'Storage Units'],
            'deposit' => 2150,
            'lease_terms' => '12 Months',
            'available_date' => 'Immediately'
        ]);

        // 3. Seed Bookings
        Booking::create([
            'user_id' => $alex->id,
            'property_id' => $p1->id,
            'date' => '2026-08-11',
            'time' => '02:00 PM',
            'type' => 'in-person',
            'status' => 'Confirmed',
            'host_name' => 'Victoria Vance'
        ]);
    }
}
