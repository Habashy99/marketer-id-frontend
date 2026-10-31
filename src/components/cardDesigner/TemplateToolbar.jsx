
import { useNavigate } from "react-router-dom";

export default function TemplateToolbar({
    onPrint,
    saveTemplate,
    busy,
    error,
    notice,
    canPrintCard = false,
    canCreateDesign = false,
}) {
    const navigate = useNavigate();

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


                    {canCreateDesign && (
                        <button
                            type="button"
                            onClick={saveTemplate}
                            disabled={busy}
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {busy ? "جارٍ الحفظ..." : "حفظ القالب"}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/marketing")}
                        className="rounded-lg border border-slate-300 bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                    >
                        العودة إلى التسويق
                    </button>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 no-print"
                >
                    {error}
                </div>
            )}

            {notice && (
                <div
                    role="status"
                    className="mb-4 rounded-lg bg-green-100 p-3 text-green-700 no-print"
                >
                    {notice}
                </div>
            )}
        </>
    );
}
