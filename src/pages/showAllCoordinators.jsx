
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
    const [searchCode, setSearchCode] = useState("");
    const [submittedCode, setSubmittedCode] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        let cancelled = false;

        const fetchCoordinators = async () => {
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
                        data.message || "Failed to load coordinators"
                    );
                }

                if (!cancelled) {
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
                    setCoordinators(
                        Array.from(grouped.values())
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setCoordinators([]);
                    setError(
                        err.message ||
                        "حدث خطأ أثناء تحميل البيانات"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchCoordinators();

        return () => {
            cancelled = true;
        };
    }, [
        user,
        navigate,
        selectedJob,
        submittedCode,
        refreshKey,
    ]);

    if (!user) {
        return null;
    }

    const handleSearch = (event) => {
        event.preventDefault();

        const code = searchCode.trim();

        if (!code) {
            setError("من فضلك أدخل كود المنسق أو المندوب");
            return;
        }

        if (!/^\d+$/.test(code)) {
            setError("كود المنسق يجب أن يتكون من أرقام فقط");
            return;
        }

        setError("");
        setSubmittedCode(code);
        setRefreshKey((current) => current + 1);
    };

    const handleShowAll = () => {
        setSearchCode("");
        setSubmittedCode("");
        setSelectedJob("");
        setError("");
        setRefreshKey((current) => current + 1);
    };

    const handleRetry = () => {
        setRefreshKey((current) => current + 1);
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-GB");
    };

    const isExpired = (date) => {
        if (!date) return false;

        const expiryDate = new Date(date);
        const today = new Date();

        expiryDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return expiryDate < today;
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

                    {/* Search by coordinator code */}
                    <form
                        onSubmit={handleSearch}
                        className="mt-6 flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="text"
                            inputMode="numeric"
                            name="searchCode"
                            placeholder="ابحث بكود المنسق أو المندوب..."
                            value={searchCode}
                            onChange={(event) =>
                                setSearchCode(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-right outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
                        >
                            بحث
                        </button>

                        <button
                            type="button"
                            onClick={handleShowAll}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60"
                        >
                            عرض الكل
                        </button>
                    </form>

                    {/* Job filters */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() =>
                                    setSelectedJob(filter.value)
                                }
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

                    {/* Active search information */}
                    {submittedCode && (
                        <p className="mt-4 text-right text-sm text-gray-600">
                            البحث بكود: {submittedCode}
                        </p>
                    )}

                    {/* Loading */}
                    {loading && (
                        <p className="mt-6 text-gray-600">
                            جاري تحميل البيانات...
                        </p>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={handleRetry}
                                className="mt-2 underline"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    )}

                    {/* Coordinators table */}
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
                                            <th className="p-3">
                                                انتهاء الشهادة الصحية
                                            </th>
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
                                                            className={`p-3 font-semibold ${isExpired(
                                                                item.health_certificate_expiry_date
                                                            )
                                                                ? "text-red-600"
                                                                : "text-gray-700"
                                                                }`}
                                                        >
                                                            {formatDate(
                                                                item.health_certificate_expiry_date
                                                            )}
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
                                                                                    {formatDate(
                                                                                        exception.startDate
                                                                                    )}{" "}
                                                                                    إلى{" "}
                                                                                    {formatDate(
                                                                                        exception.endDate
                                                                                    )}
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
                                                    {submittedCode
                                                        ? "لا يوجد منسق أو مندوب بهذا الكود"
                                                        : "لا توجد بيانات لعرضها"}
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
