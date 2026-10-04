/**
 * Словари локализации клиентской части (React-редактор).
 *
 * Ключи — плоские строки вида «component.element». Добавление нового языка
 * сводится к копированию объекта и переводу значений; ключи, отсутствующие
 * в целевом языке, автоматически берутся из fallback (en) — см. I18nProvider.
 */

export const SUPPORTED_LOCALES = ['en', 'ru'];

export const LOCALE_LABELS = {
    en: 'English',
    ru: 'Русский',
};

export const translations = {
    en: {
        // VideoUploader
        'uploader.dropHere': 'Drag your video here',
        'uploader.orClick': 'or click to choose a file from your device',
        'uploader.chooseFile': 'Choose file',
        'uploader.formats': '{formats} · up to {size} MB',
        'uploader.errorUnsupported': 'Unsupported format “.{ext}”. Supported: {formats}.',
        'uploader.errorTooLarge': 'File is too large ({size} MB). Maximum is {max} MB.',

        // CropOverlay
        'cropOverlay.aspectRatio': 'Aspect ratio',
        'cropOverlay.presetFree': 'Free',

        // TimelineTrimmer
        'timeline.title': 'Timeline',
        'timeline.start': 'Start',
        'timeline.end': 'End',

        // CropDimensionFields
        'cropFields.title': 'Exact crop area size',
        'cropFields.subtitle': 'In source video pixels ({width}×{height})',
        'cropFields.width': 'Width',
        'cropFields.height': 'Height',
        'cropFields.offsetLeft': 'Left offset',
        'cropFields.offsetRight': 'Right offset',
        'cropFields.offsetTop': 'Top offset',
        'cropFields.offsetBottom': 'Bottom offset',

        // ResizeControls
        'resize.title': 'Resize',
        'resize.subtitle': 'Final resolution of the exported video',
        'resize.reset': 'Reset (100%)',
        'resize.width': 'Width, px',
        'resize.height': 'Height, px',
        'resize.scale': 'Scale, %',
        'resize.keepAspect': 'Keep aspect ratio',

        // RenderingScreen
        'rendering.title': 'Processing video…',
        'rendering.localNote': 'Everything happens in your browser — the file is never uploaded.',

        // Временно отключено вместе с покупкой PRO (задача «скрыть всё, что
        // связано с покупкой Pro»): тексты модалки покупки и статуса в шапке.
        // Оставлено закомментированным на случай будущего возвращения.
        // // ProUpsellModal
        // 'upsell.benefitWatermark': 'Removes the “microcrop” watermark from the exported video',
        // 'upsell.benefitNoAds': 'No ad blocks during processing',
        // 'upsell.benefitEncoding': 'Optimized encoding settings',
        // 'upsell.oneTime': 'One-time payment, no subscription',
        // 'upsell.priceAmount': '199 ₽',
        // 'upsell.priceSuffix': 'one-time',
        // 'upsell.errorCreateOrder': 'Could not create the order. Please try again.',
        // 'upsell.close': 'Close',
        // 'upsell.redirecting': 'Redirecting to payment…',
        // 'upsell.buy': 'Buy PRO / remove watermark',
        // 'upsell.footerNote': 'Payment via Robokassa. Self-employed (NPD), the receipt will be sent to your e-mail.',

        // // HeaderStatus
        // 'header.pro': 'PRO',
        // 'header.waitingPayment': 'Awaiting payment…',
        // 'header.proActiveUntil': 'PRO active until {date}',
        // 'header.proActive': 'PRO active',
        // 'header.freeBuyPro': 'Free · Buy PRO',

        // EditorPage
        'editor.cropAndProcess': 'Crop & process',
        'editor.chooseAnother': 'Choose another video',
        // Временно отключено вместе с покупкой PRO (упоминания водяного знака и цены).
        // 'editor.watermarkNotice': 'Export will include the “microcrop” watermark · remove for 199 ₽',
        // 'editor.proNoWatermark': 'PRO: export without watermark',
        'editor.renderError': 'Could not process the video: {error}',
        'editor.done': 'Done!',
        'editor.processedLocally': 'The video was processed locally in your browser.',
        'editor.downloadMp4': 'Download MP4',

        // YandexAdBlock
        'ad.placeholder': 'Ad',
    },

    ru: {
        // VideoUploader
        'uploader.dropHere': 'Перетащите видео сюда',
        'uploader.orClick': 'или нажмите, чтобы выбрать файл на устройстве',
        'uploader.chooseFile': 'Выбрать файл',
        'uploader.formats': '{formats} · до {size} МБ',
        'uploader.errorUnsupported': 'Неподдерживаемый формат «.{ext}». Поддерживаются: {formats}.',
        'uploader.errorTooLarge': 'Файл слишком большой ({size} МБ). Максимум — {max} МБ.',

        // CropOverlay
        'cropOverlay.aspectRatio': 'Соотношение сторон',
        'cropOverlay.presetFree': 'Свободно',

        // TimelineTrimmer
        'timeline.title': 'Таймлайн',
        'timeline.start': 'Начало',
        'timeline.end': 'Конец',

        // CropDimensionFields
        'cropFields.title': 'Точный размер области кадрирования',
        'cropFields.subtitle': 'В пикселях исходного видео ({width}×{height})',
        'cropFields.width': 'Ширина',
        'cropFields.height': 'Высота',
        'cropFields.offsetLeft': 'Отступ слева',
        'cropFields.offsetRight': 'Отступ справа',
        'cropFields.offsetTop': 'Отступ сверху',
        'cropFields.offsetBottom': 'Отступ снизу',

        // ResizeControls
        'resize.title': 'Масштабирование',
        'resize.subtitle': 'Итоговое разрешение экспортируемого видео',
        'resize.reset': 'Сбросить (100%)',
        'resize.width': 'Ширина, px',
        'resize.height': 'Высота, px',
        'resize.scale': 'Масштаб, %',
        'resize.keepAspect': 'Сохранять пропорции',

        // RenderingScreen
        'rendering.title': 'Обрабатываем видео…',
        'rendering.localNote': 'Всё происходит в вашем браузере — файл никуда не отправляется.',

        // Временно отключено вместе с покупкой PRO (задача «скрыть всё, что
        // связано с покупкой Pro»): тексты модалки покупки и статуса в шапке.
        // Оставлено закомментированным на случай будущего возвращения.
        // // ProUpsellModal
        // 'upsell.benefitWatermark': 'Снятие водяного знака «microcrop» с экспортируемого видео',
        // 'upsell.benefitNoAds': 'Без рекламных блоков во время обработки',
        // 'upsell.benefitEncoding': 'Ускоренные настройки кодирования',
        // 'upsell.oneTime': 'Разовый платёж, без подписки',
        // 'upsell.priceAmount': '199 ₽',
        // 'upsell.priceSuffix': 'разово',
        // 'upsell.errorCreateOrder': 'Не удалось создать заказ. Попробуйте ещё раз.',
        // 'upsell.close': 'Закрыть',
        // 'upsell.redirecting': 'Переходим к оплате…',
        // 'upsell.buy': 'Купить PRO / снять водяной знак',
        // 'upsell.footerNote': 'Оплата через Robokassa. Самозанятый (НПД), чек придёт на указанный e-mail.',

        // // HeaderStatus
        // 'header.pro': 'PRO',
        // 'header.waitingPayment': 'Ожидаем оплату…',
        // 'header.proActiveUntil': 'PRO активен до {date}',
        // 'header.proActive': 'PRO активен',
        // 'header.freeBuyPro': 'Free · Купить PRO',

        // EditorPage
        'editor.cropAndProcess': 'Кадрировать и обработать',
        'editor.chooseAnother': 'Выбрать другое видео',
        // Временно отключено вместе с покупкой PRO (упоминания водяного знака и цены).
        // 'editor.watermarkNotice': 'Экспорт будет с водяным знаком «microcrop» · убрать за 199 ₽',
        // 'editor.proNoWatermark': 'PRO: экспорт без водяного знака',
        'editor.renderError': 'Не удалось обработать видео: {error}',
        'editor.done': 'Готово!',
        'editor.processedLocally': 'Видео обработано локально в вашем браузере.',
        'editor.downloadMp4': 'Скачать MP4',

        // YandexAdBlock
        'ad.placeholder': 'Реклама',
    },
};

export const FALLBACK_LOCALE = 'en';
