const API_BASE_URL = "http://localhost:3000";

export const PHOTO_FIELDS = [
    { key: "profile_picture", label: "الصورة الشخصية" },
    { key: "national_id_picture", label: "صورة البطاقة الشخصية" },
    { key: "health_certificate_picture", label: "صورة الشهادة الصحية" },
    { key: "company_authorization_picture", label: "صورة تفويض الشركة" },
    { key: "social_insurance_picture", label: "صورة التأمينات الاجتماعية" },
    {
        key: "supervisor_national_id_picture",
        label: "بطاقة المشرف الشخصية",
    },
];

export const COORDINATOR_FIELDS = [
    { key: "id", label: "المعرف الداخلي" },
    { key: "code", label: "الكود" },
    { key: "name", label: "الاسم" },
    { key: "job", label: "الوظيفة" },
    { key: "company_name", label: "الشركة" },
    { key: "health_certificate_issuance_date", label: "تاريخ إصدار الشهادة الصحية" },
    { key: "health_certificate_expiry_date", label: "انتهاء الشهادة الصحية" },
    { key: "national_id_number", label: "رقم البطاقة الشخصية" },
    { key: "mobile", label: "الهاتف" },
    { key: "governorate", label: "المحافظة" },
    { key: "notes", label: "ملاحظات" },
    { key: "id_issuance_date", label: "تاريخ إصدار البطاقة" },
    { key: "id_expiry_date", label: "انتهاء البطاقة" },
    { key: "created_by", label: "تم الإنشاء بواسطة" },
    { key: "address", label: "العنوان" },
    { key: "supervisor_name", label: "اسم المشرف" },
    { key: "number_of_print_copies", label: "عدد نسخ الطباعة" },
    { key: "security_situation", label: "الموقف الأمني" },
    { key: "states", label: "الحالة" },
];

export function getPhotoUrl(value) {
    if (!value || typeof value !== "string") return null;

    const path = value.trim();
    if (!path) return null;

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.replace(/\\/g, "/");
    const cleanPath = normalizedPath
        .replace(/^\/+/, "")
        .replace(/^uploads\//i, "");

    const encodedPath = cleanPath
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");

    return `${API_BASE_URL}/uploads/${encodedPath}`;
}

export function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export function normalizeJob(job) {
    if (!job) return "";

    return String(job)
        .trim()
        .replace(/ه/g, "ة");
}

export function getCoordinatorExceptions(rows) {
    const exceptions = new Map();

    for (const row of rows) {
        if (row.exception_id == null) continue;

        const id = String(row.exception_id);

        if (!exceptions.has(id)) {
            exceptions.set(id, {
                exception_id: row.exception_id,
                exception_name: row.exception_name,
                exception_start_date: row.exception_start_date,
                exception_end_date: row.exception_end_date,
            });
        }
    }

    return [...exceptions.values()];
}

export function groupCoordinators(rows) {
    const coordinators = new Map();

    for (const row of rows) {
        const key = String(row.id);

        if (!coordinators.has(key)) {
            coordinators.set(key, {
                ...row,
                exceptions: [],
            });
        }

        const coordinator = coordinators.get(key);

        if (
            row.exception_id != null &&
            !coordinator.exceptions.some(
                (item) => String(item.exception_id) === String(row.exception_id)
            )
        ) {
            coordinator.exceptions.push({
                exception_id: row.exception_id,
                exception_name: row.exception_name,
                exception_start_date: row.exception_start_date,
                exception_end_date: row.exception_end_date,
            });
        }
    }

    return [...coordinators.values()];
}

export function isCertificateExpired(coordinator) {
    if (!coordinator.health_certificate_expiry_date) return false;

    const expiry = new Date(coordinator.health_certificate_expiry_date);
    if (Number.isNaN(expiry.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
}