<?php

namespace Tests\Feature;

use App\Models\AccessToken;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TokensApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function validate_accepts_a_valid_non_expired_token(): void
    {
        $order = Order::create([
            'product_type' => 'remove_watermark',
            'amount' => 19900,
            'currency' => 'RUB',
            'status' => Order::STATUS_PAID,
        ]);

        AccessToken::create([
            'token_hash' => AccessToken::hash('raw-valid-token'),
            'order_id' => $order->id,
            'expires_at' => now()->addHours(48),
        ]);

        $response = $this->postJson('/api/tokens/validate', ['token' => 'raw-valid-token']);

        $response->assertOk()->assertJson([
            'valid' => true,
            'product_type' => 'remove_watermark',
        ]);
    }

    #[Test]
    public function validate_rejects_an_expired_token(): void
    {
        $order = Order::create([
            'product_type' => 'remove_watermark',
            'amount' => 19900,
            'currency' => 'RUB',
            'status' => Order::STATUS_PAID,
        ]);

        AccessToken::create([
            'token_hash' => AccessToken::hash('raw-expired-token'),
            'order_id' => $order->id,
            'expires_at' => now()->subHour(),
        ]);

        $response = $this->postJson('/api/tokens/validate', ['token' => 'raw-expired-token']);

        $response->assertOk()->assertJson(['valid' => false]);
    }

    #[Test]
    public function validate_rejects_an_unknown_token(): void
    {
        $response = $this->postJson('/api/tokens/validate', ['token' => 'never-issued']);

        $response->assertOk()->assertJson(['valid' => false]);
    }

    #[Test]
    public function validate_requires_token_field(): void
    {
        $response = $this->postJson('/api/tokens/validate', []);

        $response->assertStatus(422);
    }
}
