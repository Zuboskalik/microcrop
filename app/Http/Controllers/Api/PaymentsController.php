<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateOrderRequest;
use App\Models\AccessToken;
use App\Models\Order;
use App\Services\RobokassaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Платежи Robokassa: создание заказа, приём ResultURL-callback'а,
 * polling статуса. См. ARCHITECTURE.md §6.1/§6.2/§6.4.
 */
class PaymentsController extends Controller
{
    public function __construct(private readonly RobokassaService $robokassa)
    {
    }

    /**
     * POST /api/payments/create
     */
    public function create(CreateOrderRequest $request): JsonResponse
    {
        $productType = $request->string('product_type')->value();
        $amount = (int) config("robokassa.prices.{$productType}");

        $order = Order::create([
            'user_id' => $request->user()?->id,
            'guest_email' => $request->input('guest_email'),
            'product_type' => $productType,
            'amount' => $amount,
            'currency' => 'RUB',
            'status' => Order::STATUS_PENDING,
        ]);

        $paymentUrl = $this->robokassa->buildPaymentUrl(
            invId: $order->id,
            outSum: $amount / 100,
            description: "MicroCrop: {$productType}",
            email: $request->input('guest_email'),
        );

        return response()->json([
            'order_id' => $order->id,
            'payment_url' => $paymentUrl,
        ]);
    }

    /**
     * POST /api/payments/callback — вызывается сервером Robokassa (ResultURL),
     * не браузером пользователя. Маршрут зарегистрирован в routes/api.php,
     * который использует middleware-группу 'api' без CSRF-проверки —
     * дополнительное исключение из VerifyCsrfToken не требуется (Task 4.8).
     */
    public function callback(Request $request): \Illuminate\Http\Response
    {
        $outSum = (string) $request->input('OutSum', '');
        $invId = (string) $request->input('InvId', '');
        $signature = (string) $request->input('SignatureValue', '');

        if ($outSum === '' || $invId === '' || $signature === ''
            || ! $this->robokassa->verifyCallbackSignature($outSum, $invId, $signature)) {
            Log::warning('Robokassa callback: invalid signature', $request->all());

            return response('bad sign', 400);
        }

        $order = Order::find($invId);

        if (! $order) {
            Log::warning('Robokassa callback: unknown InvId', $request->all());

            return response('order not found', 400);
        }

        if (! $order->isPaid()) {
            $order->update([
                'status' => Order::STATUS_PAID,
                'payment_id' => $invId,
                'raw_response' => $request->all(),
            ]);

            $rawToken = Str::random(64);

            AccessToken::create([
                'token_hash' => AccessToken::hash($rawToken),
                'order_id' => $order->id,
                'expires_at' => now()->addHours((int) config('robokassa.token_ttl_hours')),
            ]);

            // Raw-токен нигде не хранится в открытом виде в БД — временно
            // кладём его в кэш, чтобы status() смог отдать его фронтенду
            // один раз (см. ARCHITECTURE.md §6.4).
            Cache::put("orders.{$order->id}.raw_token", $rawToken, now()->addMinutes(30));
        }

        return response("OK{$invId}");
    }

    /**
     * GET /api/payments/{order}/status
     */
    public function status(Order $order): JsonResponse
    {
        $rawToken = null;

        if ($order->isPaid()) {
            $rawToken = Cache::pull("orders.{$order->id}.raw_token");
        }

        return response()->json([
            'status' => $order->status,
            'token' => $rawToken,
        ]);
    }
}
