
import { useEffect, useState } from "react";
import {
    COORDINATOR_FIELDS,
    formatDate,
} from "../../helpers/coordinatorHelpers";
import CoordinatorPhotos from "./CoordinatorPhotos";
import { useAuth } from "../../context/authContext";
import { hasPermission } from "../../helpers/permissions";
const API_FIELD_MAP = {
    code: "code",
    name: "name",
    job: "job",
    company_name: "companyName",
    health_certificate_issuance_date: "healthCertificateIssuanceDate",
    health_certificate_expiry_date: "healthCertificateExpiryDate",
    national_id_number: "nationalIdNumber",
    mobile: "mobile",
    governorate: "governorate",
    notes: "notes",
    id_issuance_date: "idIssuanceDate",
    id_expiry_date: "idExpiryDate",
    address: "address",
    supervisor_name: "supervisorName",
    number_of_print_copies: "numberOfPrintcopies",
    security_situation: "securitySituation",
    states: "states",
};

const FIELD_LABELS = {
    code: "الكود",
    name: "الاسم",
    job: "الوظيفة",
    company_name: "اسم الشركة",
    health_certificate_issuance_date: "تاريخ إصدار الشهادة الصحية",
    health_certificate_expiry_date: "تاريخ انتهاء الشهادة الصحية",
    national_id_number: "رقم البطاقة الشخصية",
    mobile: "رقم الهاتف",
    governorate: "المحافظة",
    notes: "ملاحظات",
    id_issuance_date: "تاريخ إصدار البطاقة",
    id_expiry_date: "تاريخ انتهاء البطاقة",
    address: "العنوان",
    supervisor_name: "اسم المشرف",
    number_of_print_copies: "عدد نسخ الطباعة",
    security_situation: "الموقف الأمني",
    states: "الحالة",
};

const PHOTO_FIELDS = [
    {
        key: "profilePicture",
        dbKey: "profile_picture",
        label: "الصورة الشخصية",
    },
    {
        key: "nationalIdPicture",
        dbKey: "national_id_picture",
        label: "صورة البطاقة الشخصية",
    },
    {
        key: "healthCertificatePicture",
        dbKey: "health_certificate_picture",
        label: "صورة الشهادة الصحية",
    },
    {
        key: "companyAuthorizationPicture",
        dbKey: "company_authorization_picture",
        label: "صورة تفويض الشركة",
    },
    {
        key: "socialInsurancePicture",
        dbKey: "social_insurance_picture",
        label: "صورة التأمينات الاجتماعية",
    },
    {
        key: "supervisorNationalIdPicture",
        dbKey: "supervisor_national_id_picture",
        label: "صورة بطاقة المشرف",
    },
];

const DATE_FIELDS = new Set([
    "health_certificate_issuance_date",
    "health_certificate_expiry_date",
    "id_issuance_date",
    "id_expiry_date",
]);

function inputValue(value, key) {
    if (value == null) return "";

    if (DATE_FIELDS.has(key)) {
        return String(value).slice(0, 10);
    }

    return String(value);
}

function getPhotoName(value) {
    if (!value) return "لا توجد صورة مرفوعة";
    return String(value).split(/[\\/]/).pop();
}

function getCoordinatorFields() {
    const fields = [...COORDINATOR_FIELDS];
    const existingKeys = new Set(fields.map((field) => field.key));

    for (const key of Object.keys(API_FIELD_MAP)) {
        if (!existingKeys.has(key)) {
            fields.push({
                key,
                label: FIELD_LABELS[key] || key,
            });
        }
    }

    return fields;
}

function PhotoInputs({ coordinator, photos, setPhotos }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PHOTO_FIELDS.map((photo) => (
                <label
                    key={photo.key}
                    className="flex cursor-pointer flex-col gap-2 rounded-lg border border-orange-200 p-3 transition hover:border-orange-500 hover:bg-orange-50"
                >
                    <span className="font-semibold text-gray-800">
                        {photo.label}
                    </span>

                    <span className="break-all text-sm text-orange-700">
                        {photos[photo.key]?.name ||
                            getPhotoName(coordinator[photo.dbKey])}
                    </span>

                    <span className="text-xs text-gray-500">
                        اضغط لاختيار صورة جديدة
                    </span>

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) {
                                setPhotos((previous) => ({
                                    ...previous,
                                    [photo.key]: file,
                                }));
                            }
                        }}
                    />
                </label>
            ))}
        </div>
    );
}

export default function CoordinatorDetailsModal({
    coordinator,
    onClose,
    onSave,
    saving = false,
}) {
    const { user } = useAuth();
    const canEditCoordinator = hasPermission(user, 25);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [photos, setPhotos] = useState({});
    const [formError, setFormError] = useState("");

    const fields = getCoordinatorFields();

    useEffect(() => {
        if (!coordinator) return;

        const initialForm = {};

        for (const field of fields) {
            initialForm[field.key] = inputValue(
                coordinator[field.key],
                field.key
            );
        }

        setForm(initialForm);
        setPhotos({});
        setEditing(false);
        setFormError("");
    }, [coordinator]);

    if (!coordinator) return null;

    function handleChange(key, value) {
        setForm((previous) => ({
            ...previous,
            [key]: value,
        }));
    }

    function resetEditing() {
        const initialForm = {};

        for (const field of fields) {
            initialForm[field.key] = inputValue(
                coordinator[field.key],
                field.key
            );
        }

        setForm(initialForm);
        setPhotos({});
        setFormError("");
        setEditing(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError("");

        if (!String(form.name ?? "").trim()) {
            setFormError("يرجى إدخال اسم المنسق.");
            return;
        }

        if (!String(form.code ?? "").trim()) {
            setFormError("يرجى إدخال كود المنسق.");
            return;
        }

        const formData = new FormData();
        formData.append("id", String(coordinator.id));

        for (const [dbKey, apiKey] of Object.entries(API_FIELD_MAP)) {
            const value = form[dbKey];

            if (value !== undefined && value !== null) {
                formData.append(apiKey, String(value));
            }
        }

        for (const photo of PHOTO_FIELDS) {
            const file = photos[photo.key];

            if (file instanceof File) {
                formData.append(photo.key, file);
            }
        }

        try {
            await onSave(formData);
            setEditing(false);
            setPhotos({});
        } catch (error) {
            setFormError(error.message || "تعذر حفظ بيانات المنسق.");
        }
    }

    function renderField(field) {
        const { key } = field;
        const label = FIELD_LABELS[key] || field.label || key;
        const value = form[key] ?? "";

        if (!editing) {
            return (
                <div
                    key={key}
                    className="min-w-0 rounded-lg border border-gray-200 p-3"
                >
                    <p className="mb-1 text-sm text-gray-500">{label}</p>
                    <p className="wrap-break-word font-medium">
                        {value === ""
                            ? "—"
                            : DATE_FIELDS.has(key)
                                ? formatDate(value)
                                : String(value)}
                    </p>
                </div>
            );
        }

        const commonClasses =
            "w-full rounded-lg border border-gray-300 bg-white p-2 focus:border-orange-500 focus:outline-none";

        let input;

        if (key === "job") {
            input = (
                <select
                    value={value}
                    onChange={(event) =>
                        handleChange(key, event.target.value)
                    }
                    className={commonClasses}
                >
                    <option value="">اختر الوظيفة</option>
                    {["منسق", "منسقة", "مندوب", "مندوبة"].map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        } else if (key === "states") {
            input = (
                <select
                    value={value}
                    onChange={(event) =>
                        handleChange(key, event.target.value)
                    }
                    className={commonClasses}
                >
                    <option value="">اختر الحالة</option>
                    <option value="مفعل">مفعل</option>
                    <option value="غير مفعل">غير مفعل</option>
                    <option value="مؤقت">مؤقت</option>
                </select>
            );
        } else if (DATE_FIELDS.has(key)) {
            input = (
                <input
                    type="date"
                    value={value}
                    onChange={(event) =>
                        handleChange(key, event.target.value)
                    }
                    className={commonClasses}
                />
            );
        } else if (key === "notes") {
            input = (
                <textarea
                    rows={3}
                    value={value}
                    onChange={(event) =>
                        handleChange(key, event.target.value)
                    }
                    className={commonClasses}
                />
            );
        } else {
            input = (
                <input
                    type={
                        key === "number_of_print_copies" ? "number" : "text"
                    }
                    value={value}
                    onChange={(event) =>
                        handleChange(key, event.target.value)
                    }
                    className={commonClasses}
                />
            );
        }

        return (
            <div key={key} className="min-w-0 rounded-lg border p-3">
                <label className="mb-2 block text-sm text-gray-600">
                    {label}
                </label>
                {input}
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            onClick={saving ? undefined : onClose}
        >
            <div
                dir="rtl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="coordinator-details-title"
                className="my-8 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="coordinator-details-title"
                        className="text-xl font-bold text-orange-700"
                    >
                        تفاصيل المنسق: {coordinator.name}
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {!editing ? (
                            canEditCoordinator && (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                                >
                                    تعديل البيانات
                                </button>
                            )
                        ) : (
                            canEditCoordinator && (
                                <>
                                    <button
                                        type="button"
                                        onClick={resetEditing}
                                        disabled={saving}
                                        className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        إلغاء التعديل
                                    </button>

                                    <button
                                        type="submit"
                                        form="edit-coordinator-form"
                                        disabled={saving}
                                        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                                    </button>
                                </>
                            )
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>

                <form id="edit-coordinator-form" onSubmit={handleSubmit}>
                    <h3 className="mb-3 font-bold">البيانات الأساسية</h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {fields.map(renderField)}

                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="mb-1 text-sm text-gray-500">
                                رقم السجل
                            </p>
                            <p className="font-medium">{coordinator.id}</p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="mb-1 text-sm text-gray-500">
                                أنشأ بواسطة
                            </p>
                            <p className="wrap-break-word font-medium">
                                {coordinator.created_by ?? "—"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="mb-3 font-bold">صور المستندات</h3>
                        {editing ? (
                            <>
                                <CoordinatorPhotos
                                    coordinator={coordinator}
                                />

                                <p className="my-3 text-sm text-gray-500">
                                    اختر صورة جديدة فقط للمستندات التي تريد
                                    استبدالها.
                                </p>

                                <PhotoInputs
                                    coordinator={coordinator}
                                    photos={photos}
                                    setPhotos={setPhotos}
                                />
                            </>
                        ) : (
                            <CoordinatorPhotos
                                coordinator={coordinator}
                            />
                        )}
                    </div>

                    {formError && (
                        <p role="alert" className="mt-4 text-sm text-red-600">
                            {formError}
                        </p>
                    )}
                </form>

                <div className="mt-6">
                    <h3 className="mb-3 font-bold">الاستثناءات</h3>

                    {coordinator.exceptions?.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-right text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3">الاسم</th>
                                        <th className="p-3">تاريخ البداية</th>
                                        <th className="p-3">تاريخ النهاية</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coordinator.exceptions.map((exception) => (
                                        <tr
                                            key={exception.exception_id}
                                            className="border-b"
                                        >
                                            <td className="p-3">
                                                {exception.exception_name ?? "—"}
                                            </td>
                                            <td className="p-3">
                                                {formatDate(
                                                    exception.exception_start_date
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {formatDate(
                                                    exception.exception_end_date
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">لا توجد استثناءات.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
