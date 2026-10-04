<?php

namespace Tests\Feature;

use App\Models\AccessToken;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PaymentsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'robokassa.merchant_login' => 'merchant_x',
            'robokassa.password1' => 'pass1',
            'robokassa.password2' => 'pass2',
            'robokassa.is_test' => true,
            'robokassa.prices.remove_watermark' => 19900,
        ]);
    }

    #[Test]
    public function create_endpoint_creates_a_pending_order_and_returns_payment_url(): void
    {
        $response = $this->postJson('/api/payments/create', [
            'product_type' => 'remove_watermark',
            'guest_email' => 'user@example.com',
        ]);

        $response->assertOk()->assertJsonStructure(['order_id', 'payment_url']);

        $order = Order::findOrFail($response->json('order_id'));

        $this->assertSame(Order::STATUS_PENDING, $order->status);
        $this->assertSame(19900, $order->amount);
        $this->assertSame('user@example.com', $order->guest_email);
        $this->assertStringContainsString('MerchantLogin=merchant_x', $response->json('payment_url'));
    }

    #[Test]
    public function create_endpoint_rejects_unknown_product_type(): void
    {
        $response = $this->postJson('/api/payments/create', [
            'product_type' => 'not_a_real_product',
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function callback_with_valid_signature_marks_order_paid_and_issues_access_token(): void
    {
        $order = Order::create([
            'product_type' => 'remove_watermark',
            'amount' => 19900,
            'currency' => 'RUB',
            'status' => Order::STATUS_PENDING,
        ]);

        $signature = md5("199.00:{$order->id}:pass2");

        $response = $this->post('/api/payments/callback', [
            'OutSum' => '199.00',
            'InvId' => $order->id,
            'SignatureValue' => $signature,
        ]);

        $response->assertOk();
        $response->assertSee("OK{$order->id}", false);

        $order->refresh();
        $this->assertSame(Order::STATUS_PAID, $order->status);
        $this->assertSame(1, AccessToken::where('order_id', $order->id)->count());
    }

    #[Test]
    public function callback_with_invalid_signature_is_rejected_and_order_stays_pending(): void
    {
        $order = Order::create([
            'product_type' => 'remove_watermark',
            'amount' => 19900,
            'currency' => 'RUB',
            'status' => Order::STATUS_PENDING,
        ]);

        $response = $this->post('/api/payments/callback', [
            'OutSum' => '199.00',
            'InvId' => $order->id,
            'SignatureValue' => 'deadbeef',
        ]);

        $response->assertStatus(400);

        $order->refresh();
        $this->assertSame(Order::STATUS_PENDING, $order->status);
        $this->assertSame(0, AccessToken::where('order_id', $order->id)->count());
    }

    #[Test]
    public function status_endpoint_returns_raw_token_only_once(): void
    {
        $order = Order::create([
            'product_type' => 'remove_watermark',
            'amount' => 19900,
            'currency' => 'RUB',
            'status' => Order::STATUS_PENDING,
        ]);

        $signature = md5("199.00:{$order->id}:pass2");
        $this->post('/api/payments/callback', [
            'OutSum' => '199.00',
            'InvId' => $order->id,
            'SignatureValue' => $signature,
        ])->assertOk();

        $first = $this->getJson("/api/payments/{$order->id}/status");
        $first->assertOk()->assertJson(['status' => 'paid']);
        $this->assertNotNull($first->json('token'));

        $second = $this->getJson("/api/payments/{$order->id}/status");
        $second->assertOk()->assertJson(['status' => 'paid', 'token' => null]);
    }

    #[Test]
    public function status_endpoint_for_pending_order_returns_no_token(): void
    {
        $order = Order::create([
            'product_type' => 'remove_watermark',
            'amount' => 19900,
            'currency' => 'RUB',
            'status' => Order::STATUS_PENDING,
        ]);

        $response = $this->getJson("/api/payments/{$order->id}/status");

        $response->assertOk()->assertJson(['status' => 'pending', 'token' => null]);
    }
}
