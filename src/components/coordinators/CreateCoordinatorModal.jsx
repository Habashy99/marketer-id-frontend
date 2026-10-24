import { useState } from "react";

const INITIAL_FORM = {
    code: "",
    name: "",
    job: "منسق",
    company_name: "",
    health_certificate_issuance_date: "",
    health_certificate_expiry_date: "",
    national_id_number: "",
    mobile: "",
    governorate: "",
    notes: "",
    id_issuance_date: "",
    id_expiry_date: "",
    created_by: "",
    address: "",
    supervisor_name: "",
    number_of_print_copies: "",
    security_situation: "",
    states: "مفعل",
};

const FIELDS = [
    { key: "code", label: "الكود", required: true },
    { key: "name", label: "الاسم", required: true },
    { key: "company_name", label: "الشركة" },
    { key: "mobile", label: "الهاتف" },
    { key: "national_id_number", label: "رقم البطاقة الشخصية" },
    { key: "governorate", label: "المحافظة" },
    { key: "address", label: "العنوان" },
    { key: "supervisor_name", label: "اسم المشرف" },
    { key: "number_of_print_copies", label: "عدد نسخ الطباعة", type: "number" },
    { key: "health_certificate_issuance_date", label: "تاريخ إصدار الشهادة الصحية", type: "date" },
    { key: "health_certificate_expiry_date", label: "تاريخ انتهاء الشهادة الصحية", type: "date" },
    { key: "id_issuance_date", label: "تاريخ إصدار البطاقة", type: "date" },
    { key: "id_expiry_date", label: "تاريخ انتهاء البطاقة", type: "date" },
    { key: "created_by", label: "تم الإنشاء بواسطة" },
];

export default function CreateCoordinatorModal({
    open,
    onClose,
    onSubmit,
    saving,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");

    if (!open) return null;
    
    function updateField(key, value) {
        setForm((previous) => {
            const updatedForm = {
                ...previous,
                [key]: value,
            };

            if (key === "health_certificate_issuance_date" && value) {
                const date = new Date(`${value}T12:00:00`);
                date.setFullYear(date.getFullYear() + 1);

                updatedForm.health_certificate_expiry_date = [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, "0"),
                    String(date.getDate()).padStart(2, "0"),
                ].join("-");
            }

            return updatedForm;
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            await onSubmit({
                ...form,
                code: form.code.trim(),
                name: form.name.trim(),
                number_of_print_copies:
                    form.number_of_print_copies === ""
                        ? null
                        : Number(form.number_of_print_copies),
            });

            setForm(INITIAL_FORM);
        } catch (err) {
            setError(err.message || "فشل إنشاء المنسق.");
        }
    }

    return (
        <div
            dir="rtl"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                className="my-8 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold">إضافة منسق جديد</h2>
                    <button type="button" onClick={onClose}>
                        إغلاق
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {FIELDS.map((field) => (
                        <div key={field.key}>
                            <label className="mb-1 block text-sm font-semibold">
                                {field.label}
                            </label>
                            <input
                                type={field.type || "text"}
                                required={Boolean(field.required)}
                                min={field.type === "number" ? 0 : undefined}
                                value={form[field.key] ?? ""}
                                onChange={(event) =>
                                    updateField(field.key, event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 p-2.5"
                            />
                        </div>
                    ))}

                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            الوظيفة
                        </label>
                        <select
                            value={form.job}
                            onChange={(event) =>
                                updateField("job", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5"
                        >
                            <option value="منسق">منسق</option>
                            <option value="منسقة">منسقة</option>
                            <option value="مندوب">مندوب</option>
                            <option value="مندوبة">مندوبة</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            الحالة
                        </label>
                        <select
                            value={form.states}
                            onChange={(event) =>
                                updateField("states", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5"
                        >
                            <option value="مفعل">مفعل</option>
                            <option value="غير مفعل">غير مفعل</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            الموقف الأمني
                        </label>
                        <input
                            value={form.security_situation}
                            onChange={(event) =>
                                updateField(
                                    "security_situation",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold">
                            ملاحظات
                        </label>
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(event) =>
                                updateField("notes", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 p-2.5"
                        />
                    </div>
                </div>

                {error && (
                    <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">
                        {error}
                    </p>
                )}

                <div className="mt-5 flex gap-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-orange-600 px-5 py-2.5 text-white disabled:opacity-50"
                    >
                        {saving ? "جاري الحفظ..." : "حفظ المنسق"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-gray-200 px-5 py-2.5"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
}