
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";

function DeletePermission() {
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [type, setType] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!Number.isInteger(Number(code)) || Number(code) <= 0) {
            setError("يرجى إدخال كود مستخدم صحيح.");
            return;
        }

        if (!type) {
            setError("يرجى اختيار الصلاحية التي تريد حذفها.");
            return;
        }

        const confirmed = window.confirm(
            "هل أنت متأكد أنك تريد حذف هذه الصلاحية من المستخدم؟"
        );

        if (!confirmed) return;

        setLoading(true);

        try {
            const response = await sendHttpReq(
                "authsUser/deleteAuthUser",
                "DELETE",
                {
                    code: Number(code),
                    authId: Number(type),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "فشل حذف الصلاحية"
                );
            }

            setSuccess("تم حذف الصلاحية من المستخدم بنجاح.");
            setCode("");
            setType("");
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء حذف الصلاحية.");
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
                        حذف صلاحية من مستخدم
                    </h2>

                    <p className="mt-3 text-gray-600">
                        أدخل كود المستخدم واختر الصلاحية المراد حذفها.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-4"
                    >
                        <input
                            type="number"
                            name="code"
                            placeholder="كود المستخدم"
                            value={code}
                            onChange={(event) =>
                                setCode(event.target.value)
                            }
                            min="1"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                        />

                        <select
                            name="type"
                            value={type}
                            onChange={(event) =>
                                setType(event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-red-600"
                        >
                            <option value="">
                                اختر الصلاحية المراد حذفها
                            </option>
                            <option value="1">طبع كارت</option>
                            <option value="2">إضافة مندوب</option>
                            <option value="12">testtest</option>
                        </select>

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
                                ? "جاري حذف الصلاحية..."
                                : "حذف الصلاحية"}
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

export default DeletePermission;
