<?php

namespace App\Services;

use App\Mail\UrbanRentNewsMail;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NewsletterService
{
    public function send(User $user, ?Property $property = null, ?string $context = null, ?string $customMessage = null): void
    {
        Mail::to($user->email)->send(new UrbanRentNewsMail(
            user: $user,
            property: $property,
            context: $context,
            customMessage: $customMessage,
        ));
    }
}
