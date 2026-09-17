<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PRO-токен, выдаваемый после успешной оплаты (Robokassa) — снимает
 * водяной знак / включает ускоренную обработку (см. ARCHITECTURE.md §3.3,
 * §4.5). В БД хранится только хэш токена, не значение в открытом виде.
 */
class AccessToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token_hash',
        'order_id',
        'expires_at',
        'is_used',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'is_used' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isValid(): bool
    {
        return $this->expires_at->isFuture();
    }

    public static function hash(string $rawToken): string
    {
        return hash('sha256', $rawToken);
    }
}
