<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DatabasePersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_persists_the_user_and_api_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Taylor Tenant',
            'email' => 'taylor@example.com',
            'password' => 'a-secure-password',
            'role' => 'user',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'taylor@example.com');

        $user = User::where('email', 'taylor@example.com')->firstOrFail();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Taylor Tenant',
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth_token',
        ]);
    }

    public function test_user_can_upload_a_profile_photo(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('profile.png'),
        ], ['Accept' => 'application/json']);

        $response->assertOk();
        $avatarUrl = $response->json('avatar');
        $this->assertIsString($avatarUrl);
        $this->assertStringStartsWith('/storage/avatars/', $avatarUrl);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $avatarUrl));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'avatar' => $avatarUrl,
        ]);
    }

    public function test_profile_photo_upload_rejects_non_image_files(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['avatar' => 'https://example.com/current.jpg']);

        $this->actingAs($user)->post('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->create('document.txt', 10, 'text/plain'),
        ], ['Accept' => 'application/json'])->assertUnprocessable();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'avatar' => 'https://example.com/current.jpg',
        ]);
        Storage::disk('public')->assertDirectoryEmpty('avatars');
    }

    public function test_property_and_booking_changes_persist_and_property_deletion_cascades(): void
    {
        $host = User::factory()->create(['role' => 'homeowner']);
        $tenant = User::factory()->create(['role' => 'user']);

        $propertyResponse = $this->actingAs($host)->postJson('/api/properties', [
            'title' => 'Persistent Listing',
            'address' => '123 Market Street',
            'city' => 'San Francisco',
            'neighborhood' => 'Downtown',
            'zipCode' => '94105',
            'price' => 2500,
            'beds' => '2',
            'baths' => 2,
            'sqft' => 1200,
            'type' => 'Apartment',
            'description' => 'A test listing persisted through the API.',
            'image' => 'https://example.com/property.jpg',
        ]);

        $propertyResponse->assertCreated()
            ->assertJsonPath('title', 'Persistent Listing')
            ->assertJsonPath('listingStatus', 'pending_review');
        $propertyId = (string) $propertyResponse->json('id');

        $this->assertDatabaseHas('properties', [
            'id' => $propertyId,
            'host_id' => $host->id,
            'title' => 'Persistent Listing',
        ]);

        $this->actingAs($tenant)->postJson('/api/favorites', [
            'propertyId' => $propertyId,
        ])->assertCreated();
        $this->assertDatabaseHas('property_favorites', [
            'user_id' => $tenant->id,
            'property_id' => $propertyId,
        ]);
        $this->actingAs($tenant)->getJson('/api/favorites')
            ->assertOk()
            ->assertJsonPath('0', $propertyId);

        $this->actingAs($tenant)->getJson('/api/properties')
            ->assertOk()
            ->assertJsonCount(0);

        Property::whereKey($propertyId)->update(['listing_status' => 'available']);
        $this->actingAs($tenant)->getJson('/api/properties')
            ->assertOk()
            ->assertJsonFragment(['id' => $propertyId, 'title' => 'Persistent Listing']);

        $bookingResponse = $this->actingAs($tenant)->postJson('/api/bookings', [
            'propertyId' => $propertyId,
            'date' => '2026-12-01',
            'time' => '02:00 PM',
            'type' => 'in-person',
            'tenantName' => 'Taylor Tenant',
            'tenantPhone' => '415-555-0100',
        ]);

        $bookingResponse->assertCreated()
            ->assertJsonPath('status', 'Pending')
            ->assertJsonPath('tenantName', 'Taylor Tenant')
            ->assertJsonPath('tenantPhone', '415-555-0100');
        $bookingId = (string) $bookingResponse->json('id');

        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'user_id' => $tenant->id,
            'property_id' => $propertyId,
            'status' => 'Pending',
            'tenant_name' => 'Taylor Tenant',
            'tenant_phone' => '415-555-0100',
        ]);

        $this->actingAs($tenant)->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonFragment(['id' => $bookingId, 'propertyId' => $propertyId]);

        $this->actingAs($host)->putJson("/api/bookings/{$bookingId}", [
            'status' => 'Confirmed',
        ])->assertOk()->assertJsonPath('status', 'Confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'status' => 'Confirmed',
        ]);

        $this->actingAs($tenant)->putJson("/api/bookings/{$bookingId}", [
            'status' => 'Cancelled',
        ])->assertOk()->assertJsonPath('status', 'Cancelled');
        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'status' => 'Cancelled',
        ]);

        $this->actingAs($host)->deleteJson("/api/properties/{$propertyId}")
            ->assertOk();

        $this->assertDatabaseMissing('properties', ['id' => $propertyId]);
        $this->assertDatabaseMissing('bookings', ['id' => $bookingId]);
        $this->assertDatabaseMissing('property_favorites', [
            'user_id' => $tenant->id,
            'property_id' => $propertyId,
        ]);

        $this->assertSame(0, Booking::count());
        $this->assertSame(0, Property::count());
    }

    public function test_admin_user_role_updates_and_deletions_persist(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin)->putJson("/api/admin/users/{$target->id}/role", [
            'role' => 'homeowner',
        ])->assertOk()->assertJsonPath('role', 'homeowner');

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'role' => 'homeowner',
        ]);

        $this->actingAs($admin)->deleteJson("/api/admin/users/{$target->id}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_only_admins_can_approve_new_listings(): void
    {
        $host = User::factory()->create(['role' => 'homeowner']);
        $tenant = User::factory()->create(['role' => 'user']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->getJson('/api/properties')->assertUnauthorized();

        $response = $this->actingAs($host)->postJson('/api/properties', [
            'title' => 'Review Required',
            'address' => '123 Market Street',
            'city' => 'San Francisco',
            'neighborhood' => 'Downtown',
            'zipCode' => '94105',
            'price' => 2500,
            'beds' => '2',
            'baths' => 2,
            'sqft' => 1200,
            'type' => 'Apartment',
            'description' => 'A listing requiring moderation.',
            'lat' => 37.79,
            'lng' => -122.39,
        ])->assertCreated();
        $propertyId = $response->json('id');

        $this->actingAs($admin)->getJson('/api/properties')
            ->assertOk()
            ->assertJsonFragment([
                'id' => (string) $propertyId,
                'listingStatus' => 'pending_review',
            ]);

        $this->actingAs($host)->putJson("/api/properties/{$propertyId}", [
            'listingStatus' => 'available',
        ])->assertUnprocessable();
        $this->actingAs($tenant)->getJson('/api/properties')
            ->assertOk()
            ->assertJsonCount(0);

        $this->actingAs($admin)->putJson("/api/admin/properties/{$propertyId}/moderation", [
            'listingStatus' => 'available',
        ])->assertOk()->assertJsonPath('listingStatus', 'available');
        $this->actingAs($tenant)->getJson('/api/properties')
            ->assertOk()
            ->assertJsonFragment(['id' => (string) $propertyId]);
    }

    public function test_renter_can_pay_monthly_rent_in_person_and_owner_confirms_it(): void
    {
        [$tenant, $host, $application] = $this->createApprovedApplication();

        $response = $this->actingAs($tenant)->postJson("/api/applications/{$application->id}/payments", [
            'method' => 'in_person',
        ])->assertCreated()
            ->assertJsonPath('method', 'in_person')
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('amountCents', 250000);
        $paymentId = $response->json('id');

        $this->actingAs($host)->putJson("/api/payments/{$paymentId}/confirm")
            ->assertOk()
            ->assertJsonPath('status', 'paid');
        $this->assertDatabaseHas('rent_payments', [
            'id' => $paymentId,
            'tenant_id' => $tenant->id,
            'status' => 'paid',
            'method' => 'in_person',
        ]);

        $property = $application->property;
        $tenant->delete();
        $property->delete();
        $this->assertDatabaseHas('rent_payments', [
            'id' => $paymentId,
            'tenant_id' => null,
            'rental_application_id' => null,
            'property_id' => null,
            'tenant_name' => $tenant->name,
            'property_title' => 'Approved Rental',
        ]);
    }

    public function test_card_rent_checkout_is_confirmed_only_by_a_valid_stripe_webhook(): void
    {
        [$tenant, , $application] = $this->createApprovedApplication();
        config([
            'services.stripe.secret' => 'sk_test_example',
            'services.stripe.webhook_secret' => 'whsec_test_example',
            'services.stripe.frontend_url' => 'https://urbanrent.test',
        ]);
        Http::fake([
            'https://api.stripe.com/v1/checkout/sessions' => Http::response([
                'id' => 'cs_test_rent_123',
                'url' => 'https://checkout.stripe.com/c/pay/cs_test_rent_123',
            ]),
        ]);

        $response = $this->actingAs($tenant)->postJson("/api/applications/{$application->id}/payments", [
            'method' => 'card',
        ])->assertCreated()
            ->assertJsonPath('checkoutUrl', 'https://checkout.stripe.com/c/pay/cs_test_rent_123');
        $paymentId = $response->json('id');
        $this->actingAs($tenant)->postJson("/api/applications/{$application->id}/payments", [
            'method' => 'card',
        ])->assertOk()
            ->assertJsonPath('checkoutUrl', 'https://checkout.stripe.com/c/pay/cs_test_rent_123');
        Http::assertSentCount(1);
        $this->assertDatabaseHas('rent_payments', [
            'id' => $paymentId,
            'checkout_session_id' => 'cs_test_rent_123',
            'status' => 'pending',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_rent_paid',
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_test_rent_123',
                'payment_status' => 'paid',
            ]],
        ], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", 'whsec_test_example');

        $this->call('POST', '/api/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1=invalid",
        ], $payload)->assertBadRequest();
        $this->assertDatabaseHas('rent_payments', [
            'id' => $paymentId,
            'status' => 'pending',
        ]);

        $this->call('POST', '/api/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
        ], $payload)->assertOk()->assertJsonPath('received', true);

        $this->assertDatabaseHas('rent_payments', [
            'id' => $paymentId,
            'status' => 'paid',
        ]);
    }

    public function test_admin_can_suspend_reinstate_accounts_and_export_monthly_csv(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin, 'sanctum')->putJson("/api/admin/users/{$tenant->id}/suspension", [
            'suspended' => true,
        ])->assertOk()->assertJsonPath('is_suspended', true);
        $tenant->refresh();
        $this->actingAs($tenant, 'sanctum')->getJson('/api/me')->assertForbidden();

        $this->actingAs($admin, 'sanctum')->putJson("/api/admin/users/{$tenant->id}/suspension", [
            'suspended' => false,
        ])->assertOk()->assertJsonPath('is_suspended', false);
        $tenant->refresh();
        $this->actingAs($tenant, 'sanctum')->getJson('/api/me')->assertOk();

        $report = $this->actingAs($admin, 'sanctum')->get('/api/admin/reports/monthly?month='.now()->format('Y-m'));
        $report->assertOk();
        $this->assertStringContainsString('record_type,month,property_id', $report->streamedContent());
    }

    private function createApprovedApplication(): array
    {
        $host = User::factory()->create(['role' => 'homeowner']);
        $tenant = User::factory()->create(['role' => 'user']);
        $propertyResponse = $this->actingAs($host)->postJson('/api/properties', [
            'title' => 'Approved Rental',
            'address' => '123 Market Street',
            'city' => 'San Francisco',
            'neighborhood' => 'Downtown',
            'zipCode' => '94105',
            'price' => 2500,
            'beds' => '2',
            'baths' => 2,
            'sqft' => 1200,
            'type' => 'Apartment',
            'description' => 'A listing for rent payment tests.',
            'lat' => 37.79,
            'lng' => -122.39,
        ])->assertCreated();
        $property = Property::findOrFail($propertyResponse->json('id'));
        $property->update(['listing_status' => 'available']);
        $application = RentalApplication::create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id,
            'message' => 'Ready to rent.',
            'status' => 'approved',
        ]);

        return [$tenant, $host, $application];
    }
}
