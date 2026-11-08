<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AddressGeocoder
{
    /**
     * @return array{lat: float, lng: float, label: string}
     */
    public function locate(string $address, string $city, ?string $neighborhood = null, ?string $zip = null): array
    {
        $query = trim(implode(', ', array_filter([
            $address,
            $neighborhood,
            $city,
            $zip,
        ])));

        if ($query !== '' && ! app()->environment('testing')) {
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'UrbanRent/1.0 (property listing map)',
                    'Accept' => 'application/json',
                ])->timeout(8)->get('https://nominatim.openstreetmap.org/search', [
                    'format' => 'jsonv2',
                    'limit' => 1,
                    'addressdetails' => 1,
                    'q' => $query,
                ]);

                $hit = $response->json()[0] ?? null;
                if (is_array($hit) && isset($hit['lat'], $hit['lon'])) {
                    return [
                        'lat' => (float) $hit['lat'],
                        'lng' => (float) $hit['lon'],
                        'label' => (string) ($hit['display_name'] ?? $query),
                    ];
                }
            } catch (\Throwable) {
                // Fall back to the city center when the geocoder is unreachable.
            }
        }

        $centers = [
            'San Francisco' => [37.7749, -122.4194],
            'Chicago' => [41.8781, -87.6298],
            'Los Angeles' => [34.0522, -118.2437],
            'New York' => [40.7128, -74.0060],
            'Seattle' => [47.6062, -122.3321],
        ];
        $base = $centers[$city] ?? [37.7749, -122.4194];

        return [
            'lat' => $base[0],
            'lng' => $base[1],
            'label' => $query !== '' ? $query : $city,
        ];
    }
}
