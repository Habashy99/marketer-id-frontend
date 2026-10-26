import { useEffect, useState } from "react";
import { sendHttpReq } from "../../lib/httpHandler";

// Adjust these imports to match your existing card-printing file.
import CardArtwork from "./CardArtwork";
import {
    TEMPLATES_ENDPOINT,
    normalizeDesign,
} from "./cardPrintHelpers";

export default function PrintCoordinatorModal({
    coordinator,
    onClose,
}) {
    const [printStep, setPrintStep] = useState("designs");
    const [selectedPrintTemplate, setSelectedPrintTemplate] = useState(null);
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [templatesError, setTemplatesError] = useState("");
    const [printError, setPrintError] = useState("");
    const [printBusy, setPrintBusy] = useState(false);

    const printDesign = selectedPrintTemplate?.design;

    useEffect(() => {
        let cancelled = false;

        async function loadTemplates() {
            setTemplatesLoading(true);
            setTemplatesError("");

            try {
                const result = await sendHttpReq(TEMPLATES_ENDPOINT);

                const records = Array.isArray(result)
                    ? result
                    : result?.templates ??
                      result?.data?.templates ??
                      result?.data ??
                      [];

                if (!Array.isArray(records)) {
                    throw new Error("تنسيق بيانات القوالب المستلمة غير صحيح.");
                }

                const templates = records.map(normalizeDesign);

                if (!cancelled) {
                    setSavedTemplates(templates);

                    if (templates.length === 0) {
                        setTemplatesError(
                            "لا توجد تصميمات محفوظة في قاعدة البيانات."
                        );
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    setTemplatesError(
                        error instanceof Error
                            ? error.message
                            : "تعذر تحميل التصميمات المحفوظة."
                    );
                }
            } finally {
                if (!cancelled) {
                    setTemplatesLoading(false);
                }
            }
        }

        loadTemplates();

        return () => {
            cancelled = true;
        };
    }, []);

    const selectPrintTemplate = (template) => {
        setSelectedPrintTemplate(template);
        setPrintError("");
        setPrintStep("preview");
    };

    const handleManualPrint = async () => {
        if (!coordinator || !printDesign) {
            setPrintError("تعذر تجهيز بيانات البطاقة.");
            return;
        }

        setPrintBusy(true);
        setPrintError("");

        try {
            // Wait for card images to finish loading.
            const images = Array.from(
                document.querySelectorAll(
                    ".coordinator-card-print-area img"
                )
            );

            await Promise.all(
                images.map((img) => {
                    if (img.complete) {
                        return typeof img.decode === "function"
                            ? img.decode().catch(() => undefined)
                            : Promise.resolve();
                    }

                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );

            window.print();
        } catch (error) {
            setPrintError(
                error instanceof Error
                    ? error.message
                    : "تعذر تجهيز البطاقة للطباعة."
            );
        } finally {
            setPrintBusy(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !printBusy
                ) {
                    onClose();
                }
            }}
        >
            <section
                dir="rtl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="print-modal-title"
                className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
                    <h2
                        id="print-modal-title"
                        className="text-xl font-bold text-slate-800"
                    >
                        طباعة بطاقة مندوب أو منسق
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={printBusy}
                        aria-label="إغلاق"
                        className="rounded-lg px-3 py-1 text-2xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <p className="font-semibold text-slate-800">
                            {coordinator?.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            الكود: {coordinator?.code}
                            {coordinator?.job
                                ? ` — ${coordinator.job}`
                                : ""}
                        </p>
                    </div>

                    {printStep === "designs" && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700">
                                اختر تصميم البطاقة المحفوظ
                            </h3>

                            {templatesLoading && (
                                <p className="py-8 text-center text-slate-500">
                                    جارٍ تحميل التصميمات...
                                </p>
                            )}

                            {!templatesLoading && templatesError && (
                                <div className="space-y-3 rounded-lg bg-red-50 p-4 text-red-700">
                                    <p>{templatesError}</p>

                                    <button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                    >
                                        إعادة تحميل الصفحة
                                    </button>
                                </div>
                            )}

                            {!templatesLoading &&
                                !templatesError &&
                                savedTemplates.length > 0 && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {savedTemplates.map(
                                            (template, index) => (
                                                <button
                                                    type="button"
                                                    key={
                                                        template.id ??
                                                        `${template.name}-${index}`
                                                    }
                                                    onClick={() =>
                                                        selectPrintTemplate(
                                                            template
                                                        )
                                                    }
                                                    className="rounded-xl border border-slate-200 p-4 text-right transition hover:border-orange-500 hover:bg-orange-50"
                                                >
                                                    <div className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                                        <div
                                                            style={{
                                                                transform: `scale(${Math.min(
                                                                    220 /
                                                                        template
                                                                            .design
                                                                            .canvas
                                                                            .width,
                                                                    150 /
                                                                        template
                                                                            .design
                                                                            .canvas
                                                                            .height
                                                                )})`,
                                                                transformOrigin:
                                                                    "center",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <CardArtwork
                                                                design={
                                                                    template.design
                                                                }
                                                                coordinator={
                                                                    null
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <p className="font-semibold text-slate-800">
                                                        {template.name}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {
                                                            template.design
                                                                .canvas.width
                                                        }{" "}
                                                        ×{" "}
                                                        {
                                                            template.design
                                                                .canvas.height
                                                        }
                                                    </p>
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>
                    )}

                    {printStep === "preview" && printDesign && (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50 p-4">
                                <div>
                                    <p className="font-bold text-slate-800">
                                        {coordinator?.name}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600">
                                        الكود: {coordinator?.code}
                                        {coordinator?.job
                                            ? ` — ${coordinator.job}`
                                            : ""}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        التصميم: {selectedPrintTemplate.name}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPrintStep("designs");
                                        setPrintError("");
                                    }}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
                                >
                                    تغيير التصميم
                                </button>
                            </div>

                            <h3 className="font-semibold text-slate-700">
                                معاينة البطاقة قبل الطباعة
                            </h3>

                            <div className="overflow-auto rounded-xl border bg-slate-100 p-4">
                                <div className="coordinator-card-print-area mx-auto w-fit">
                                    <CardArtwork
                                        design={printDesign}
                                        coordinator={coordinator}
                                    />
                                </div>
                            </div>

                            {printError && (
                                <p role="alert" className="text-sm text-red-600">
                                    {printError}
                                </p>
                            )}

                            <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={printBusy}
                                    className="rounded-lg border border-slate-300 px-5 py-3 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    إلغاء
                                </button>

                                <button
                                    type="button"
                                    onClick={handleManualPrint}
                                    disabled={printBusy}
                                    className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {printBusy
                                        ? "جارٍ تجهيز البطاقة..."
                                        : "طباعة البطاقة"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}