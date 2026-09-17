/**
 * Точка сборки редактора. Сам функционал (Uploader, CropOverlay,
 * TimelineTrimmer, useFFmpeg) реализуется в Phase 5 (см. TASKS.md).
 * Сейчас это каркас, подтверждающий, что React-приложение монтируется
 * в Blade-обёртку и получает preset посадочной страницы.
 */
export default function EditorPage({ preset }) {
    return (
        <div className="microcrop-editor-placeholder">
            <p>Редактор MicroCrop загружается…</p>
            {preset ? (
                <p>
                    Активный пресет: <strong>{preset.label ?? preset.ratio}</strong>
                </p>
            ) : null}
        </div>
    );
}
