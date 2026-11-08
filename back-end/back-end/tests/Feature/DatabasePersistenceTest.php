<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            ->assertJsonPath('title', 'Persistent Listing');
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
}
