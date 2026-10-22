
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";
import { useAuth } from "../context/authContext";

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
    {
        name: "company_name",
        label: "اسم الشركة",
        required: true,
    },
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
    {
        name: "id_issuance_date",
        label: "تاريخ إصدار البطاقة",
        type: "date",
    },
    {
        name: "id_expiry_date",
        label: "تاريخ انتهاء البطاقة",
        type: "date",
    },
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

function CreateNewCoordinator() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
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

        if (!user?.id) {
            setError("لم يتم العثور على المستخدم الحالي.");
            return;
        }

        if (!Number.isInteger(Number(form.code)) || Number(form.code) <= 0) {
            setError("يرجى إدخال كود منسق صحيح.");
            return;
        }

        setLoading(true);

        try {
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
                createdBy: Number(user.id),
                address: form.address || null,
                supervisorName: form.supervisor_name || null,
                numberOfPrintcopies:
                    form.number_of_print_copies === ""
                        ? null
                        : Number(form.number_of_print_copies),
                securitySituation: form.security_situation || null,
                state: form.states || null,
            };

            const response = await sendHttpReq(
                "coordinators/createCoordinator",
                "POST",
                payload
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "فشل إنشاء المنسق"
                );
            }

            setSuccess("تم إنشاء المنسق بنجاح.");
            setForm({ ...initialForm });
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء إنشاء المنسق.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="sticky top-0 z-50">
                <Header user={true} />
            </div>

            <div className="flex min-h-screen items-center justify-center bg-slate-100 bg-[url('/images/gomla_market_company_cover.jpg')] bg-cover bg-center p-6 sm:p-8">
                <div className="w-full max-w-3xl rounded-xl bg-white p-6 text-center shadow-lg sm:p-8">
                    <h2 className="text-3xl font-bold text-orange-600">
                        إنشاء منسق جديد
                    </h2>

                    <p className="mt-3 text-gray-600">
                        أدخل بيانات المنسق الجديد
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {fields.map((field) => (
                                <div
                                    key={field.name}
                                    className="w-full text-right"
                                >
                                    <label
                                        htmlFor={field.name}
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
                                        id={field.name}
                                        type={field.type || "text"}
                                        name={field.name}
                                        placeholder={field.label}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        required={Boolean(field.required)}
                                        min={
                                            field.name ===
                                                "number_of_print_copies"
                                                ? "0"
                                                : undefined
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                                    />
                                </div>
                            ))}

                            <div className="text-right sm:col-span-2">
                                <label
                                    htmlFor="notes"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    ملاحظات
                                </label>

                                <textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="ملاحظات"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-5 w-full rounded-lg bg-orange-600 px-5 py-3 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "جاري الإنشاء..." : "إنشاء المنسق"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="mt-3 w-full rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-100"
                        >
                            العودة للوحة التحكم
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CreateNewCoordinator;
