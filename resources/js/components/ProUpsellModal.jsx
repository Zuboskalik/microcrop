import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../i18n/I18nProvider.jsx';

/**
 * Модальное окно покупки PRO-доступа (Task 6.8/6.9). Вызывает
 * POST /api/payments/create через startCheckout() и редиректит на
 * полученный payment_url Robokassa.
 */
export default function ProUpsellModal({ open, onClose, startCheckout }) {
    const t = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!open) {
        return null;
    }

    const benefits = [
        t('upsell.benefitWatermark'),
        t('upsell.benefitNoAds'),
        t('upsell.benefitEncoding'),
    ];

    const handleBuy = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const paymentUrl = await startCheckout('remove_watermark');
            window.location.href = paymentUrl;
        } catch {
            setError(t('upsell.errorCreateOrder'));
            setSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in" role="dialog" aria-modal="true">
            <div className="card relative w-full max-w-md p-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={t('upsell.close')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>

                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path d="M5 16 2 6l6 4 4-6 4 6 6-4-3 10H5Zm0 2h14v2H5v-2Z"/>
                        </svg>
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">MicroCrop PRO</h2>
                        <p className="text-sm text-slate-500">{t('upsell.oneTime')}</p>
                    </div>
                </div>

                <ul className="mt-5 space-y-3">
                    {benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500">
                                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
                                <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {benefit}
                        </li>
                    ))}
                </ul>

                <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">{t('upsell.priceAmount')}</span>
                    <span className="text-sm text-slate-400">{t('upsell.priceSuffix')}</span>
                </div>

                {error ? <p className="mt-3 text-sm text-red-600" role="alert">{error}</p> : null}

                <button type="button" className="btn-pro mt-5 w-full" onClick={handleBuy} disabled={submitting}>
                    {submitting ? (
                        <>
                            <span className="spinner border-slate-900/30 border-t-slate-900" />
                            {t('upsell.redirecting')}
                        </>
                    ) : (
                        t('upsell.buy')
                    )}
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">
                    {t('upsell.footerNote')}
                </p>
            </div>
        </div>,
        document.body,
    );
}
