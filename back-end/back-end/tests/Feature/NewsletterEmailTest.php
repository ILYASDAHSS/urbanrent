<?php

namespace Tests\Feature;

use App\Mail\UrbanRentNewsMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_send_a_newsletter_to_a_user(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin)->postJson('/api/newsletter', [
            'userId' => $user->id,
            'context' => 'general',
        ])->assertOk();

        Mail::assertSent(UrbanRentNewsMail::class, function (UrbanRentNewsMail $mail) use ($user) {
            return $mail->hasTo($user->email)
                && $mail->user->id === $user->id
                && $mail->context === 'general';
        });
    }

    public function test_property_creation_sends_an_email_to_the_owner(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['role' => 'homeowner']);

        $this->actingAs($owner)->postJson('/api/properties', [
            'title' => 'Newsletter Listing',
            'address' => '123 Market Street',
            'city' => 'San Francisco',
            'neighborhood' => 'Downtown',
            'zipCode' => '94105',
            'price' => 2500,
            'beds' => '2',
            'baths' => 2,
            'sqft' => 1200,
            'type' => 'Apartment',
            'description' => 'Test listing with newsletter support.',
            'image' => 'https://example.com/property.jpg',
        ])->assertCreated();

        Mail::assertSent(UrbanRentNewsMail::class, function (UrbanRentNewsMail $mail) use ($owner) {
            return $mail->hasTo($owner->email)
                && $mail->user->id === $owner->id
                && $mail->context === 'listing';
        });
    }
}
