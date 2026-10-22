
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";

function DeleteException() {
    const navigate = useNavigate();

    const [coordinatorCode, setCoordinatorCode] = useState("");
    const [exceptionName, setExceptionName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            !Number.isInteger(Number(coordinatorCode)) ||
            Number(coordinatorCode) <= 0
        ) {
            setError("يرجى إدخال كود منسق صحيح.");
            return;
        }

        if (!exceptionName.trim()) {
            setError("يرجى إدخال اسم الاستثناء.");
            return;
        }

        const confirmed = window.confirm(
            `هل أنت متأكد أنك تريد حذف الاستثناء "${exceptionName.trim()}" من المنسق صاحب الكود ${coordinatorCode}؟`
        );

        if (!confirmed) return;

        setLoading(true);

        try {
            const response = await sendHttpReq(
                "exceptions/deleteException",
                "DELETE",
                {
                    coordinatorCode: Number(coordinatorCode),
                    exceptionName: exceptionName.trim(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "فشل حذف الاستثناء."
                );
            }

            setSuccess("تم حذف الاستثناء بنجاح.");
            setCoordinatorCode("");
            setExceptionName("");
        } catch (err) {
            setError(
                err.message || "حدث خطأ أثناء حذف الاستثناء."
            );
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
                    <h2 className="text-3xl font-bold text-red-600">
                        حذف استثناء
                    </h2>

                    <p className="mt-3 text-gray-600">
                        أدخل كود المنسق واسم الاستثناء المراد حذفه.
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
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
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
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                        />

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
                            className="w-full rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "جاري حذف الاستثناء..."
                                : "حذف الاستثناء"}
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

export default DeleteException;
