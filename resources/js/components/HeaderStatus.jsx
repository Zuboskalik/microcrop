import { useState } from 'react';
import ProUpsellModal from './ProUpsellModal.jsx';
import { useI18n } from '../i18n/I18nProvider.jsx';

function formatExpiry(iso, locale) {
    if (!iso) return '';
    return new Date(iso).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/**
 * Индикатор статуса пользователя в шапке (Free / PRO до <дата>) — Task 6.16.
 * Рендерится через портал из App.jsx в #microcrop-header-status.
 */
export default function HeaderStatus({ proAccess }) {
    const [modalOpen, setModalOpen] = useState(false);
    const { t, locale } = useI18n();
    const { hasProAccess, expiresAt, checking, startCheckout, isWaitingPayment } = proAccess;

    if (checking) {
        return null;
    }

    if (isWaitingPayment) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <span className="spinner h-3 w-3 border-amber-300 border-t-amber-600" />
                {t('header.waitingPayment')}
            </span>
        );
    }

    if (hasProAccess) {
        return (
            <span
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-amber-500/30"
                title={expiresAt
                    ? t('header.proActiveUntil', { date: formatExpiry(expiresAt, locale) })
                    : t('header.proActive')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M5 16 2 6l6 4 4-6 4 6 6-4-3 10H5Zm0 2h14v2H5v-2Z"/>
                </svg>
                {t('header.pro')}
            </span>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
            >
                {t('header.freeBuyPro')}
            </button>

            <ProUpsellModal open={modalOpen} onClose={() => setModalOpen(false)} startCheckout={startCheckout} />
        </>
    );
}
