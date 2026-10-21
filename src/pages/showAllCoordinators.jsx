import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";
import { useAuth } from "../context/authContext";

const filters = [
    { label: "مندوب", value: "مندوب" },
    { label: "مندوبه", value: "مندوبه" },
    { label: "منسق", value: "منسق" },
    { label: "منسقه", value: "منسقه" },
    { label: "منتهي", value: "منتهي" },
];

function ShowAllCoordinators() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedJob, setSelectedJob] = useState("");
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchCoordinators = async () => {
            setLoading(true);
            setError("");

            try {
                let url = "coordinators";

                if (selectedJob === "منتهي") {
                    url = "coordinators?filter=expired";
                } else if (selectedJob) {
                    url = `coordinators?job=${encodeURIComponent(
                        selectedJob
                    )}`;
                }

                const response = await sendHttpReq(url);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load coordinators"
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
                setError(err.message || "حدث خطأ أثناء تحميل البيانات");
            } finally {
                setLoading(false);
            }
        };

        fetchCoordinators();
    }, [user, navigate, selectedJob]);

    if (!user) return null;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-GB");
    };

    return (
        <>
            <div className="sticky top-0 z-50">
                <Header user={true} />
            </div>

            <div className="flex min-h-screen items-start justify-center bg-slate-100 bg-[url('/images/gomla_market_company_cover.jpg')] bg-cover bg-center p-4 sm:p-8">
                <div className="w-full max-w-7xl rounded-xl bg-white p-5 text-center shadow-lg sm:p-8">
                    <h1 className="text-3xl font-bold text-orange-600">
                        عرض جميع المنسقين والمناديب
                    </h1>

                    <p className="mt-3 text-gray-600">
                        عرض بيانات المنسقين والمناديب والاستثناءات الخاصة بهم
                    </p>


                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setSelectedJob(filter.value)}
                                disabled={loading}
                                className={`rounded-lg px-5 py-3 font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${selectedJob === filter.value
                                    ? "bg-orange-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-orange-100"
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setSelectedJob("")}
                            disabled={loading}
                            className={`rounded-lg px-5 py-3 font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${selectedJob === ""
                                ? "bg-orange-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-orange-100"
                                }`}
                        >
                            الكل
                        </button>
                    </div>

                    {loading && (
                        <p className="mt-6 text-gray-600">
                            جاري تحميل البيانات...
                        </p>
                    )}

                    {error && (
                        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() => setSelectedJob((current) => {
                                    setError("");
                                    return current === "__retry__" ? "" : current;
                                })}
                                className="mt-2 underline"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full min-w-300 border-collapse text-right">
                                    <thead>
                                        <tr className="bg-orange-600 text-white">
                                            <th className="p-3">الكود</th>
                                            <th className="p-3">الاسم</th>
                                            <th className="p-3">الوظيفة</th>
                                            <th className="p-3">الشركة</th>
                                            <th className="p-3">رقم الهاتف</th>
                                            <th className="p-3">المحافظة</th>
                                            <th className="p-3">حالة المستخدم</th>
                                            <th className="p-3">انتهاء الشهادة الصحية</th>
                                            <th className="p-3">الاستثناءات</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {coordinators.length > 0 ? (
                                            coordinators.map((item) => {
                                                const status =
                                                    item.states ?? item.state;

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b border-gray-200 transition-colors hover:bg-orange-50"
                                                    >
                                                        <td className="p-3">
                                                            {item.code ?? "-"}
                                                        </td>

                                                        <td className="p-3">
                                                            {item.name ?? "-"}
                                                        </td>

                                                        <td className="p-3">
                                                            {item.job?.trim() || "-"}
                                                        </td>

                                                        <td className="p-3">
                                                            {item.company_name ?? "-"}
                                                        </td>

                                                        <td className="p-3">
                                                            {item.mobile ?? "-"}
                                                        </td>

                                                        <td className="p-3">
                                                            {item.governorate ?? "-"}
                                                        </td>

                                                        <td className="p-3">
                                                            <span
                                                                className={`inline-block rounded-full px-3 py-1 text-sm ${status === "غير مفعل"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-green-100 text-green-700"
                                                                    }`}
                                                            >
                                                                {status ?? "-"}
                                                            </span>
                                                        </td>

                                                        <td
                                                            className={`p-3 font-semibold ${item.health_certificate_expiry_date &&
                                                                    new Date(item.health_certificate_expiry_date).setHours(0, 0, 0, 0) <
                                                                    new Date().setHours(0, 0, 0, 0)
                                                                    ? "text-red-600"
                                                                    : "text-gray-700"
                                                                }`}
                                                        >
                                                            {formatDate(item.health_certificate_expiry_date)}
                                                        </td>

                                                        <td className="p-3">
                                                            {item.exceptions.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {item.exceptions.map(
                                                                        (exception) => (
                                                                            <div
                                                                                key={exception.id}
                                                                                className="rounded-lg bg-orange-50 p-2 text-sm"
                                                                            >
                                                                                <p className="font-semibold text-orange-700">
                                                                                    {exception.name ?? "-"}
                                                                                </p>

                                                                                <p className="text-gray-600">
                                                                                    من{" "}
                                                                                    {formatDate(exception.startDate)}
                                                                                    {" "}إلى{" "}
                                                                                    {formatDate(exception.endDate)}
                                                                                </p>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    لا توجد استثناءات
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    className="p-6 text-gray-500"
                                                >
                                                    لا توجد بيانات لعرضها
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <p className="mt-4 text-right text-sm text-gray-500">
                                إجمالي النتائج: {coordinators.length}
                            </p>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mt-6 w-full rounded-lg border border-gray-300 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
                    >
                        العودة للوحة التحكم
                    </button>
                </div>
            </div>
        </>
    );
}

export default ShowAllCoordinators;
