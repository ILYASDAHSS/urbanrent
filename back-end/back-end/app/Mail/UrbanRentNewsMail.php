<?php

namespace App\Mail;

use App\Models\Property;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UrbanRentNewsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public ?Property $property = null,
        public ?string $context = null,
        public ?string $customMessage = null,
    ) {}

    public function build(): static
    {
        $context = $this->context ?? ($this->property ? 'property' : 'general');
        $propertyTitle = $this->property?->title ?? 'your property';
        $propertyLocation = $this->property ? trim(implode(', ', array_filter([
            $this->property->address,
            $this->property->city,
            $this->property->neighborhood,
        ]))) : 'your next home';

        $features = [
            'Save favorite listings to compare homes faster.',
            'Book a tour or apply online without leaving the app.',
            'Track rent payments and listing updates from a single dashboard.',
        ];

        $headline = match ($context) {
            'listing' => 'Your UrbanRent listing is live',
            'purchase' => 'Your UrbanRent purchase update is ready',
            'application' => 'Your application status has changed',
            'booking' => 'Your tour has been confirmed',
            default => 'UrbanRent has new features for you',
        };

        $message = $this->customMessage ?? match ($context) {
            'listing' => 'We have highlighted your listing and the latest platform features so you can keep growing your portfolio.',
            'purchase' => 'We have updated your account with the latest app features and the property you are purchasing.',
            'application' => 'Your application is moving forward and we want to keep you informed about the latest UrbanRent tools.',
            'booking' => 'Your tour is scheduled and we wanted to share the recent UrbanRent feature updates with you.',
            default => 'We are excited to share the latest UrbanRent feature updates and the property you are exploring.',
        };

        return $this->subject('UrbanRent update: new features and your property')
            ->markdown('emails.urbanrent-news', [
                'userName' => $this->user->name ?: 'there',
                'headline' => $headline,
                'message' => $message,
                'propertyTitle' => $propertyTitle,
                'propertyLocation' => $propertyLocation,
                'features' => $features,
                'appUrl' => config('app.frontend_url', 'http://localhost:3000'),
            ]);
    }
}
