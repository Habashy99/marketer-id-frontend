
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../helpers/header";
import { sendHttpReq } from "../../lib/httpHandler";
import { useAuth } from "../../context/authContext";

const initialForm = {
    code: "",
    name: "",
    job: "",
    company_name: "",
    health_certificate_issuance_date: "",
    health_certificate_expiry_date: "",
    national_id_number: "",
    mobile: "",
    governorate: "",
    notes: "",
    id_issuance_date: "",
    id_expiry_date: "",
    address: "",
    supervisor_name: "",
    number_of_print_copies: "",
    security_situation: "",
    states: "",
};

const fields = [
    { name: "code", label: "كود المنسق", type: "number", required: true },
    { name: "name", label: "اسم المنسق", required: true },
    { name: "job", label: "الوظيفة" },
    { name: "company_name", label: "اسم الشركة", required: true },
    {
        name: "health_certificate_issuance_date",
        label: "تاريخ إصدار الشهادة الصحية",
        type: "date",
    },
    {
        name: "health_certificate_expiry_date",
        label: "تاريخ انتهاء الشهادة الصحية",
        type: "date",
    },
    { name: "national_id_number", label: "رقم البطاقة القومية" },
    { name: "mobile", label: "رقم الموبايل", type: "tel" },
    { name: "governorate", label: "المحافظة" },
    { name: "id_issuance_date", label: "تاريخ إصدار البطاقة", type: "date" },
    { name: "id_expiry_date", label: "تاريخ انتهاء البطاقة", type: "date" },
    { name: "address", label: "العنوان" },
    { name: "supervisor_name", label: "اسم المشرف" },
    {
        name: "number_of_print_copies",
        label: "عدد نسخ الطباعة",
        type: "number",
    },
    { name: "security_situation", label: "الموقف الأمني" },
    { name: "states", label: "الحالة" },
];

const filters = [
    { label: "مندوب", value: "مندوب" },
    { label: "مندوبه", value: "مندوبه" },
    { label: "منسق", value: "منسق" },
    { label: "منسقه", value: "منسقه" },
    { label: "منتهي", value: "منتهي" },
];

function formatDate(date) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-GB");
}

function isExpired(date) {
    if (!date) return false;

    const expiryDate = new Date(date);
    const today = new Date();

    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return expiryDate < today;
}

function CoordinatorsManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [coordinators, setCoordinators] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [submittedCode, setSubmittedCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchCoordinators = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (submittedCode.trim()) {
                params.set("code", submittedCode.trim());
            }

            if (selectedJob === "منتهي") {
                params.set("filter", "expired");
            } else if (selectedJob) {
                params.set("job", selectedJob);
            }

            const query = params.toString();
            const url = query
                ? `coordinators?${query}`
                : "coordinators";

            const response = await sendHttpReq(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "فشل تحميل بيانات المنسقين"
                );
            }

            const grouped = new Map();

            for (const item of data.coordinators || []) {
                if (!grouped.has(item.id)) {
                    grouped.set(item.id, {
                        ...item,
                        exceptions: [],
                    });
                }

                if (item.exception_id != null) {
                    grouped.get(item.id).exceptions.push({
                        id: item.exception_id,
                        name: item.exception_name,
                        startDate: item.exception_start_date,
                        endDate: item.exception_end_date,
                    });
                }
            }

            setCoordinators(Array.from(grouped.values()));
        } catch (err) {
            setCoordinators([]);
            setError(err.message || "حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    }, [submittedCode, selectedJob]);

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        fetchCoordinators();
    }, [user, navigate, fetchCoordinators, refreshKey]);

    if (!user) return null;

    const handleSearch = (event) => {
        event.preventDefault();

        const code = searchCode.trim();

        if (code && !/^\d+$/.test(code)) {
            setError("الكود يجب أن يتكون من أرقام فقط");
            return;
        }

        setSubmittedCode(code);
    };

    const handleShowAll = () => {
        setSearchCode("");
        setSubmittedCode("");
        setSelectedJob("");
        setError("");
    };

    const handleSuccess = () => {
        setModal(null);
        setRefreshKey((current) => current + 1);
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-100">
            <div className="sticky top-0 z-40">
                <Header user={user} />
            </div>

            <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-orange-600 sm:text-3xl">
                            إدارة المندوبين والمنسقين
                        </h1>

                        <p className="mt-2 text-gray-600">
                            عرض وإدارة بيانات المندوبين والمنسقين والاستثناءات.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/marketing")}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
                    >
                        العودة للتسويق
                    </button>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setModal("create")}
                        className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                    >
                        + إضافة مندوب / منسق
                    </button>

                    <button
                        type="button"
                        onClick={() => setModal("createException")}
                        className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                    >
                        + إنشاء استثناء
                    </button>

                    <button
                        type="button"
                        onClick={() => setModal("deleteException")}
                        className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                    >
                        حذف استثناء
                    </button>
                </div>

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="mt-6 flex flex-col gap-3 sm:flex-row"
                >
                    <input
                        type="text"
                        inputMode="numeric"
                        value={searchCode}
                        onChange={(event) => setSearchCode(event.target.value)}
                        placeholder="ابحث بكود المندوب أو المنسق..."
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-700 px-5 py-3 text-white hover:bg-slate-800"
                    >
                        بحث
                    </button>

                    <button
                        type="button"
                        onClick={handleShowAll}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 hover:bg-gray-50"
                    >
                        عرض الكل
                    </button>
                </form>

                {/* Filters */}
                <div className="mt-5 flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setSelectedJob(filter.value)}
                            className={`rounded-lg px-4 py-2 font-medium ${selectedJob === filter.value
                                    ? "bg-orange-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-orange-50"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setSelectedJob("")}
                        className={`rounded-lg px-4 py-2 font-medium ${selectedJob === ""
                                ? "bg-orange-600 text-white"
                                : "bg-white text-gray-700 hover:bg-orange-50"
                            }`}
                    >
                        الكل
                    </button>
                </div>

                {/* Errors */}
                {error && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-red-700">
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() =>
                                setRefreshKey((current) => current + 1)
                            }
                            className="underline"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                )}

                {/* Coordinators table */}
                <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <p className="p-10 text-center text-gray-500">
                            جاري تحميل البيانات...
                        </p>
                    ) : !error ? (
                        <table className="w-full min-w-[1200px] text-right">
                            <thead className="bg-orange-600 text-white">
                                <tr>
                                    <th className="p-3">الكود</th>
                                    <th className="p-3">الاسم</th>
                                    <th className="p-3">الوظيفة</th>
                                    <th className="p-3">الشركة</th>
                                    <th className="p-3">الهاتف</th>
                                    <th className="p-3">المحافظة</th>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3">انتهاء الشهادة الصحية</th>
                                    <th className="p-3">الاستثناءات</th>
                                </tr>
                            </thead>

                            <tbody>
                                {coordinators.map((item) => {
                                    const status = item.states ?? item.state;

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-orange-50"
                                        >
                                            <td className="p-3">{item.code ?? "-"}</td>
                                            <td className="p-3">{item.name ?? "-"}</td>
                                            <td className="p-3">{item.job?.trim() || "-"}</td>
                                            <td className="p-3">{item.company_name ?? "-"}</td>
                                            <td className="p-3">{item.mobile ?? "-"}</td>
                                            <td className="p-3">{item.governorate ?? "-"}</td>
                                            <td className="p-3">{status ?? "-"}</td>

                                            <td
                                                className={`p-3 ${isExpired(
                                                    item.health_certificate_expiry_date
                                                )
                                                        ? "font-semibold text-red-600"
                                                        : ""
                                                    }`}
                                            >
                                                {formatDate(
                                                    item.health_certificate_expiry_date
                                                )}
                                            </td>

                                            <td className="min-w-[240px] p-3">
                                                {item.exceptions.length ? (
                                                    <div className="space-y-2">
                                                        {item.exceptions.map((exception) => (
                                                            <div
                                                                key={exception.id}
                                                                className="rounded-lg bg-orange-50 p-2 text-sm"
                                                            >
                                                                <p className="font-semibold text-orange-700">
                                                                    {exception.name ?? "-"}
                                                                </p>
                                                                <p className="mt-1 text-gray-600">
                                                                    من {formatDate(exception.startDate)}
                                                                    {" "}إلى{" "}
                                                                    {formatDate(exception.endDate)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        لا توجد استثناءات
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {coordinators.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="p-8 text-center text-gray-500"
                                        >
                                            لا توجد بيانات لعرضها.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : null}
                </div>

                {!loading && !error && (
                    <p className="mt-3 text-sm text-gray-500">
                        إجمالي النتائج: {coordinators.length}
                    </p>
                )}
            </main>

            {modal && (
                <CoordinatorModal
                    type={modal}
                    currentUser={user}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

function CoordinatorModal({ type, currentUser, onClose, onSuccess }) {
    const [form, setForm] = useState(initialForm);
    const [coordinatorCode, setCoordinatorCode] = useState("");
    const [exceptionName, setExceptionName] = useState("");
    const [exceptionStartDate, setExceptionStartDate] = useState("");
    const [exceptionEndDate, setExceptionEndDate] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const titles = {
        create: "إضافة مندوب / منسق جديد",
        createException: "إنشاء استثناء جديد",
        deleteException: "حذف استثناء",
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (
            type === "create" &&
            (!currentUser?.id || !Number.isInteger(Number(form.code)) ||
                Number(form.code) <= 0)
        ) {
            setError(
                !currentUser?.id
                    ? "لم يتم العثور على المستخدم الحالي."
                    : "يرجى إدخال كود صحيح."
            );
            return;
        }

        if (type !== "create") {
            if (!/^\d+$/.test(coordinatorCode) || Number(coordinatorCode) <= 0) {
                setError("يرجى إدخال كود منسق صحيح.");
                return;
            }

            if (!exceptionName.trim()) {
                setError("يرجى إدخال اسم الاستثناء.");
                return;
            }
        }

        if (
            type === "createException" &&
            exceptionStartDate &&
            exceptionEndDate &&
            exceptionStartDate > exceptionEndDate
        ) {
            setError("تاريخ البداية يجب أن يكون قبل تاريخ النهاية.");
            return;
        }

        if (type === "deleteException") {
            const confirmed = window.confirm(
                `هل أنت متأكد من حذف الاستثناء "${exceptionName.trim()}" للمنسق صاحب الكود ${coordinatorCode}؟`
            );

            if (!confirmed) return;
        }

        setLoading(true);

        try {
            let response;

            if (type === "create") {
                const payload = {
                    code: Number(form.code),
                    name: form.name.trim(),
                    job: form.job || null,
                    companyName: form.company_name.trim(),
                    healthCertificateIssuanceDate:
                        form.health_certificate_issuance_date || null,
                    healthCertificateExpiryDate:
                        form.health_certificate_expiry_date || null,
                    nationalIdNumber: form.national_id_number || null,
                    mobile: form.mobile || null,
                    governorate: form.governorate || null,
                    notes: form.notes || null,
                    idIssuanceDate: form.id_issuance_date || null,
                    idExpiryDate: form.id_expiry_date || null,
                    createdBy: Number(currentUser.id),
                    address: form.address || null,
                    supervisorName: form.supervisor_name || null,
                    numberOfPrintcopies:
                        form.number_of_print_copies === ""
                            ? null
                            : Number(form.number_of_print_copies),
                    securitySituation: form.security_situation || null,
                    state: form.states || null,
                };

                response = await sendHttpReq(
                    "coordinators/createCoordinator",
                    "POST",
                    payload
                );
            } else if (type === "createException") {
                response = await sendHttpReq(
                    "exceptions/createException",
                    "POST",
                    {
                        coordinatorCode: Number(coordinatorCode),
                        exceptionName: exceptionName.trim(),
                        exceptionStartDate: exceptionStartDate || null,
                        exceptionEndDate: exceptionEndDate || null,
                    }
                );
            } else {
                response = await sendHttpReq(
                    "exceptions/deleteException",
                    "DELETE",
                    {
                        coordinatorCode: Number(coordinatorCode),
                        exceptionName: exceptionName.trim(),
                    }
                );
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "فشلت العملية.");
            }

            setSuccess(data.message || "تمت العملية بنجاح.");

            // Allow the user to see the success message before closing.
            window.setTimeout(() => {
                onSuccess();
            }, 500);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تنفيذ العملية.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="coordinator-modal-title"
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-7"
            >
                <div className="flex items-center justify-between gap-4">
                    <h2
                        id="coordinator-modal-title"
                        className="text-xl font-bold text-orange-600 sm:text-2xl"
                    >
                        {titles[type]}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="إغلاق"
                        className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                    {type === "create" ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {fields.map((field) => (
                                <div key={field.name}>
                                    <label
                                        htmlFor={`coordinator-${field.name}`}
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        {field.label}
                                        {field.required && (
                                            <span className="mr-1 text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <input
                                        id={`coordinator-${field.name}`}
                                        name={field.name}
                                        type={field.type || "text"}
                                        value={form[field.name]}
                                        onChange={handleFormChange}
                                        required={Boolean(field.required)}
                                        min={
                                            field.name === "number_of_print_copies"
                                                ? "0"
                                                : undefined
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
                                    />
                                </div>
                            ))}

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="coordinator-notes"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    ملاحظات
                                </label>

                                <textarea
                                    id="coordinator-notes"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleFormChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="exception-coordinator-code"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    كود المنسق
                                </label>

                                <input
                                    id="exception-coordinator-code"
                                    type="number"
                                    min="1"
                                    value={coordinatorCode}
                                    onChange={(event) =>
                                        setCoordinatorCode(event.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="exception-name"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    اسم الاستثناء
                                </label>

                                <input
                                    id="exception-name"
                                    type="text"
                                    value={exceptionName}
                                    onChange={(event) =>
                                        setExceptionName(event.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                />
                            </div>

                            {type === "createException" && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="exception-start"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            تاريخ بداية الاستثناء
                                        </label>

                                        <input
                                            id="exception-start"
                                            type="date"
                                            value={exceptionStartDate}
                                            onChange={(event) =>
                                                setExceptionStartDate(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="exception-end"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            تاريخ نهاية الاستثناء
                                        </label>

                                        <input
                                            id="exception-end"
                                            type="date"
                                            value={exceptionEndDate}
                                            onChange={(event) =>
                                                setExceptionEndDate(event.target.value)
                                            }
                                            min={exceptionStartDate || undefined}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-50"
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`rounded-lg px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60 ${type === "deleteException"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-orange-600 hover:bg-orange-700"
                                }`}
                        >
                            {loading
                                ? "جاري التنفيذ..."
                                : type === "create"
                                    ? "إنشاء المنسق"
                                    : type === "createException"
                                        ? "إنشاء الاستثناء"
                                        : "حذف الاستثناء"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default CoordinatorsManagement;
