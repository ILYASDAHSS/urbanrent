<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name', 'email', 'password', 'role', 'avatar', 'phone', 'is_superhost',
    'city', 'occupation', 'bio', 'move_in_date', 'budget_min', 'budget_max', 'pets', 'household_size',
    'is_suspended',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_superhost' => 'boolean',
            'is_suspended' => 'boolean',
            'move_in_date' => 'date',
            'budget_min' => 'integer',
            'budget_max' => 'integer',
            'household_size' => 'integer',
        ];
    }

    public function favoriteProperties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'property_favorites');
    }
}
