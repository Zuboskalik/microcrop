<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateOrderRequest extends FormRequest
{
    /**
     * Гостевой checkout: авторизация не требуется, заказ привязывается
     * к email или user_id текущего пользователя (если он есть).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_type' => [
                'required',
                'string',
                Rule::in([
                    Order::PRODUCT_REMOVE_WATERMARK,
                    Order::PRODUCT_FAST_RENDER,
                    Order::PRODUCT_SOCIAL_PRESETS,
                ]),
            ],
            'guest_email' => ['nullable', 'email', 'max:255'],
        ];
    }
}
