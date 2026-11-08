<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'rental_application_id',
    'tenant_id',
    'property_id',
    'host_id',
    'property_title',
    'city',
    'owner_name',
    'owner_email',
    'tenant_name',
    'tenant_email',
    'period',
    'amount_cents',
    'currency',
    'method',
    'status',
    'checkout_session_id',
    'checkout_url',
    'paid_at',
])]
class RentPayment extends Model
{
    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(RentalApplication::class, 'rental_application_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }
}
