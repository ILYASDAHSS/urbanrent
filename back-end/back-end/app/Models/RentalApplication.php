<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'property_id',
    'tenant_id',
    'message',
    'move_in_date',
    'occupants',
    'employment',
    'status',
])]
class RentalApplication extends Model
{
    protected function casts(): array
    {
        return [
            'move_in_date' => 'date',
            'occupants' => 'integer',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }
}
