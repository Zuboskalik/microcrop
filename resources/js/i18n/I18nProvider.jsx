import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
    FALLBACK_LOCALE,
    SUPPORTED_LOCALES,
    translations,
} from './translations.js';

const LOCALE_STORAGE_KEY = 'microcrop_locale';

const I18nContext = createContext(null);

export function resolveLocale(candidate) {
    if (candidate && SUPPORTED_LOCALES.includes(candidate)) {
        return candidate;
    }
    return FALLBACK_LOCALE;
}

/**
 * Определяет язык браузера как стартовое значение, если сервер его не
 * подсказал (data-locale отсутствует). navigator.language, например "en-US".
 */
function detectBrowserLocale() {
    if (typeof navigator === 'undefined') {
        return FALLBACK_LOCALE;
    }
    const raw = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    const short = raw.split('-')[0].toLowerCase();
    return SUPPORTED_LOCALES.includes(short) ? short : FALLBACK_LOCALE;
}

/**
 * Лёгкий i18n-провайдер без внешних зависимостей. Принимает начальный язык
 * от Blade (data-locale), иначе — определяет по браузеру. t('key', {placeholder})
 * подставляет значения; отсутствующие ключи падают на fallback-язык.
 */
export function I18nProvider({ initialLocale, children }) {
    const [locale, setLocaleState] = useState(() =>
        resolveLocale(initialLocale ?? detectBrowserLocale()),
    );

    const t = useCallback(
        (key, params) => {
            const dict = translations[locale] ?? {};
            const fallback = translations[FALLBACK_LOCALE] ?? {};
            let template = dict[key] ?? fallback[key] ?? key;

            if (params) {
                for (const [name, value] of Object.entries(params)) {
                    template = template.replaceAll(`{${name}}`, String(value));
                }
            }

            return template;
        },
        [locale],
    );

    const setLocale = useCallback((nextLocale) => {
        const resolved = resolveLocale(nextLocale);
        setLocaleState(resolved);

        try {
            localStorage.setItem(LOCALE_STORAGE_KEY, resolved);
        } catch {
            // приватный режим / хранилище недоступно — не критично.
        }

        // Серверные части страницы (SEO-тексты, Blade) зависят от locale на
        // бэкенде — перезагружаем страницу с ?lang=, чтобы SetLocale middleware
        // применил язык и перерендерил контент синхронно с клиентом.
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.get('lang') !== resolved) {
                url.searchParams.set('lang', resolved);
                window.location.assign(url.toString());
            }
        }
    }, []);

    const value = useMemo(
        () => ({
            locale,
            setLocale,
            t,
            locales: SUPPORTED_LOCALES,
        }),
        [locale, setLocale, t],
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return ctx;
}

/**
 * Удобный хук, когда нужна только функция перевода.
 */
export function useTranslation() {
    return useI18n().t;
}
