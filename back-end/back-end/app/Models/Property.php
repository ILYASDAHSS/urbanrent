<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'host_id', 'title', 'address', 'city', 'neighborhood', 'zip_code', 'price',
    'beds', 'baths', 'sqft', 'image', 'gallery', 'badge', 'type',
    'pet_friendly', 'in_unit_laundry', 'parking', 'balcony', 'gym', 'pool', 'ev_charging',
    'description', 'rating', 'review_count', 'lat', 'lng', 'amenities',
    'deposit', 'lease_terms', 'available_date'
])]
class Property extends Model
{
    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'amenities' => 'array',
            'pet_friendly' => 'boolean',
            'in_unit_laundry' => 'boolean',
            'parking' => 'boolean',
            'balcony' => 'boolean',
            'gym' => 'boolean',
            'pool' => 'boolean',
            'ev_charging' => 'boolean',
            'lat' => 'double',
            'lng' => 'double',
            'rating' => 'double',
            'review_count' => 'integer',
            'price' => 'integer',
            'deposit' => 'integer',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }
}
