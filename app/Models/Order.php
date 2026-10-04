<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_FAILED = 'failed';

    public const STATUS_REFUNDED = 'refunded';

    public const PRODUCT_REMOVE_WATERMARK = 'remove_watermark';

    public const PRODUCT_FAST_RENDER = 'fast_render';

    public const PRODUCT_SOCIAL_PRESETS = 'social_presets';

    protected $fillable = [
        'user_id',
        'guest_email',
        'product_type',
        'amount',
        'currency',
        'status',
        'payment_id',
        'raw_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'raw_response' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accessToken(): HasOne
    {
        return $this->hasOne(AccessToken::class);
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }
}
