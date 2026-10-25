
export default function TemplateToolbar({
    downloadJson,
    onPrint,
    saveTemplate,
    busy,
    error,
    notice,
}) {
    return (
        <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-orange-600">
                        إعدادات قالب الكارت
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        تحكم في أبعاد الكارت وهوامشه وعناصره بشكل مستقل.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={downloadJson}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2"
                    >
                        تنزيل JSON
                    </button>

                    <button
                        type="button"
                        onClick={onPrint}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2"
                    >
                        معاينة الطباعة
                    </button>

                    <button
                        type="button"
                        onClick={saveTemplate}
                        disabled={busy}
                        className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                        {busy ? "جارٍ الحفظ..." : "حفظ القالب"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 no-print">
                    {error}
                </div>
            )}

            {notice && (
                <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700 no-print">
                    {notice}
                </div>
            )}
        </>
    );
}
