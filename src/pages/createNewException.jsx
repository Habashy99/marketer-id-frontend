
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";

function CreateNewException() {
    const navigate = useNavigate();

    const [coordinatorCode, setCoordinatorCode] = useState("");
    const [exceptionName, setExceptionName] = useState("");
    const [exceptionStartDate, setExceptionStartDate] = useState("");
    const [exceptionEndDate, setExceptionEndDate] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!Number.isInteger(Number(coordinatorCode)) ||
            Number(coordinatorCode) <= 0) {
            setError("يرجى إدخال كود منسق صحيح.");
            return;
        }

        if (
            exceptionStartDate &&
            exceptionEndDate &&
            exceptionStartDate > exceptionEndDate
        ) {
            setError("تاريخ البداية يجب أن يكون قبل تاريخ النهاية.");
            return;
        }

        setLoading(true);

        try {
            const response = await sendHttpReq(
                "exceptions/createException",
                "POST",
                {
                    coordinatorCode: Number(coordinatorCode),
                    exceptionName: exceptionName.trim(),
                    exceptionStartDate: exceptionStartDate || null,
                    exceptionEndDate: exceptionEndDate || null,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "فشل إنشاء الاستثناء"
                );
            }

            setSuccess("تم إنشاء الاستثناء بنجاح.");

            setCoordinatorCode("");
            setExceptionName("");
            setExceptionStartDate("");
            setExceptionEndDate("");
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء إنشاء الاستثناء.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="sticky top-0 z-50">
                <Header user={true} />
            </div>

            <div className="flex min-h-screen items-center justify-center bg-slate-100 bg-[url('/images/gomla_market_company_cover.jpg')] bg-cover bg-center p-6 sm:p-8">
                <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-lg sm:p-8">
                    <h2 className="text-3xl font-bold text-orange-600">
                        إنشاء استثناء جديد
                    </h2>

                    <p className="mt-3 text-gray-600">
                        أدخل بيانات الاستثناء الخاص بالمنسق
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-4"
                    >
                        <input
                            type="number"
                            name="coordinatorCode"
                            placeholder="كود المنسق"
                            value={coordinatorCode}
                            onChange={(event) =>
                                setCoordinatorCode(event.target.value)
                            }
                            min="1"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                        />

                        <input
                            type="text"
                            name="exceptionName"
                            placeholder="اسم الاستثناء"
                            value={exceptionName}
                            onChange={(event) =>
                                setExceptionName(event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                        />

                        <div className="text-right">
                            <label
                                htmlFor="exceptionStartDate"
                                className="mb-2 block text-sm text-gray-700"
                            >
                                تاريخ بداية الاستثناء
                            </label>

                            <input
                                id="exceptionStartDate"
                                type="date"
                                value={exceptionStartDate}
                                onChange={(event) =>
                                    setExceptionStartDate(event.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                            />
                        </div>

                        <div className="text-right">
                            <label
                                htmlFor="exceptionEndDate"
                                className="mb-2 block text-sm text-gray-700"
                            >
                                تاريخ نهاية الاستثناء
                            </label>

                            <input
                                id="exceptionEndDate"
                                type="date"
                                value={exceptionEndDate}
                                onChange={(event) =>
                                    setExceptionEndDate(event.target.value)
                                }
                                required
                                min={exceptionStartDate || undefined}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                            />
                        </div>

                        {error && (
                            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-orange-600 px-5 py-3 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "جاري إنشاء الاستثناء..."
                                : "إنشاء الاستثناء"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="w-full rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-100"
                        >
                            العودة للوحة التحكم
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateNewException;
