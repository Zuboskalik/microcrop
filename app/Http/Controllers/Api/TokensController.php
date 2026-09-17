<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Проверка PRO-токена перед отключением водяного знака на клиенте.
 * См. ARCHITECTURE.md §6.3.
 */
class TokensController extends Controller
{
    /**
     * POST /api/tokens/validate
     */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $tokenHash = AccessToken::hash($request->string('token')->value());

        $accessToken = AccessToken::where('token_hash', $tokenHash)
            ->where('expires_at', '>', now())
            ->first();

        if (! $accessToken) {
            return response()->json(['valid' => false]);
        }

        return response()->json([
            'valid' => true,
            'expires_at' => $accessToken->expires_at->toIso8601String(),
            'product_type' => $accessToken->order->product_type,
        ]);
    }
}
