import { useCallback, useEffect, useRef, useState } from 'react';

const TOKEN_KEY = 'microcrop_pro_token';
const PENDING_ORDER_KEY = 'microcrop_pending_order_id';
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 100; // ~5 минут ожидания оплаты

async function postJson(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Request to ${url} failed with ${response.status}`);
    }

    return response.json();
}

/**
 * Проверка PRO-токена (Task 6.12) + ожидание оплаты Robokassa (Task 6.9/6.10/6.11).
 * Токен хранится только в localStorage браузера, на сервере — лишь его
 * sha256-хэш (см. ARCHITECTURE.md §6.3/§6.4).
 */
export function useProAccess() {
    const [hasProAccess, setHasProAccess] = useState(false);
    const [expiresAt, setExpiresAt] = useState(null);
    const [productType, setProductType] = useState(null);
    const [checking, setChecking] = useState(true);
    const [isWaitingPayment, setIsWaitingPayment] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);
    const pollRef = useRef(null);

    const validateToken = useCallback(async (token) => {
        if (!token) {
            setHasProAccess(false);
            setExpiresAt(null);
            setProductType(null);
            return false;
        }

        try {
            const data = await postJson('/api/tokens/validate', { token });

            if (data.valid) {
                setHasProAccess(true);
                setExpiresAt(data.expires_at);
                setProductType(data.product_type);
                return true;
            }

            localStorage.removeItem(TOKEN_KEY);
            setHasProAccess(false);
            setExpiresAt(null);
            setProductType(null);
            return false;
        } catch {
            // Сеть недоступна/API недоступен — не сбрасываем локальный токен,
            // просто временно считаем PRO недоступным для этой сессии.
            setHasProAccess(false);
            return false;
        }
    }, []);

    const refresh = useCallback(async () => {
        setChecking(true);
        await validateToken(localStorage.getItem(TOKEN_KEY));
        setChecking(false);
    }, [validateToken]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        setIsWaitingPayment(false);
    }, []);

    const pollOrderStatus = useCallback((orderId) => {
        setIsWaitingPayment(true);
        let attempts = 0;

        pollRef.current = setInterval(async () => {
            attempts += 1;

            try {
                const response = await fetch(`/api/payments/${orderId}/status`, {
                    headers: { Accept: 'application/json' },
                });
                const data = await response.json();

                if (data.status === 'paid' && data.token) {
                    localStorage.setItem(TOKEN_KEY, data.token);
                    localStorage.removeItem(PENDING_ORDER_KEY);
                    stopPolling();
                    await validateToken(data.token);
                    return;
                }

                if (data.status === 'failed' || data.status === 'refunded') {
                    localStorage.removeItem(PENDING_ORDER_KEY);
                    stopPolling();
                    return;
                }
            } catch {
                // временная сетевая ошибка — пробуем на следующем тике
            }

            if (attempts >= POLL_MAX_ATTEMPTS) {
                stopPolling();
            }
        }, POLL_INTERVAL_MS);
    }, [stopPolling, validateToken]);

    /**
     * Task 6.9: создаёт заказ и возвращает payment_url для редиректа на Robokassa.
     * order_id сохраняется в localStorage (Task 6.11), чтобы после возврата
     * с оплаты можно было опросить его статус независимо от того, куда
     * именно Robokassa вернёт пользователя.
     */
    const startCheckout = useCallback(async (productTypeValue, guestEmail = null) => {
        setCheckoutError(null);

        try {
            const data = await postJson('/api/payments/create', {
                product_type: productTypeValue,
                guest_email: guestEmail,
            });

            localStorage.setItem(PENDING_ORDER_KEY, String(data.order_id));

            return data.payment_url;
        } catch (err) {
            setCheckoutError(err);
            throw err;
        }
    }, []);

    useEffect(() => {
        // Очищаем возможный "token" в query-строке сразу после возврата с
        // оплаты (Task 6.11) — на случай если ResultURL сконфигурирован с
        // передачей токена через параметр, чтобы он не оставался в истории.
        const url = new URL(window.location.href);
        if (url.searchParams.has('microcrop_token')) {
            const token = url.searchParams.get('microcrop_token');
            if (token) {
                localStorage.setItem(TOKEN_KEY, token);
            }
            url.searchParams.delete('microcrop_token');
            window.history.replaceState({}, '', url.toString());
        }

        (async () => {
            await validateToken(localStorage.getItem(TOKEN_KEY));
            setChecking(false);
        })();

        const pendingOrderId = localStorage.getItem(PENDING_ORDER_KEY);
        if (pendingOrderId) {
            pollOrderStatus(pendingOrderId);
        }

        return () => stopPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        hasProAccess,
        expiresAt,
        productType,
        checking,
        isWaitingPayment,
        checkoutError,
        startCheckout,
        refresh,
    };
}
