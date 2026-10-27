import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/header";
import { useEffect, useState } from "react";
import { sendHttpReq } from "../../lib/httpHandler";
import { useAuth } from "../../context/authContext";
const marketingSections = [
    {
        title: "إدارة المندوبين والمنسقين",
        description: "البيانات والاستثناءات",
        path: "/marketing/coordinators",
    },
    {
        title: "تصميم الكروت",
        description: "تصميم وتجهيز الكروت للطباعة",
        path: "/marketing/card-designer",
    },
    {
        title: "سجل الطباعة",
        description: "متابعة عمليات الطباعة",
        path: "/marketing/printer-log",
    },
    {
        title: "إدارة الكروت",
        description: "إدارة الكروت وبياناتها",
        path: "/marketing/card-management",
    },
];
const cards = [
    {
        label: "عدد المناديب الذكور",
        key: "maleRepresentatives",
    },
    {
        label: "عدد المناديب الإناث",
        key: "femaleRepresentatives",
    },
    {
        label: "عدد المنسقين الذكور",
        key: "maleCoordinators",
    },
    {
        label: "عدد المنسقين الإناث",
        key: "femaleCoordinators",
    },
    {
        label: "عدد المناديب الذكور الغير مفعلين",
        key: "expiredMaleRepresentatives",
    },
    {
        label: "عدد المناديب الإناث الغير مفعلين",
        key: "expiredFemaleRepresentatives",
    },
    {
        label: "عدد المنسقين الذكور الذين الغير مفعلين",
        key: "expiredMaleCoordinators",
    },
    {
        label: "عدد المنسقين الإناث الذين الغير مفعلين",
        key: "expiredFemaleCoordinators",
    },
];
function MarketingHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCard, setSelectedCard] = useState(null);
    const [records, setRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [recordsError, setRecordsError] = useState("");

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("المستخدم غير مسجل الدخول.");
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await sendHttpReq("dashboard/stats");

                console.log("Dashboard API data:", data);
                console.log("Dashboard stats:", data?.stats);

                if (!data?.stats) {
                    throw new Error(
                        data?.message || "استجابة API لا تحتوي على stats"
                    );
                }

                setStats(data.stats);
            } catch (err) {
                console.error("Dashboard request failed:", err);
                setError(err.message || "فشل تحميل الإحصائيات");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, location.key]);

    const handleCardClick = async (card) => {
        setSelectedCard(card);
        setRecords([]);
        setRecordsError("");
        setRecordsLoading(true);

        try {
            const response = await sendHttpReq(
                "dashboard/records",
                "POST",
                { category: card.key }
            );

            if (!response) {
                throw new Error("لم يتم استلام بيانات من السيرفر");
            }

            setRecords(response.records ?? []);
        } catch (err) {
            console.error("Error loading dashboard records:", err);
            setRecordsError("حدث خطأ أثناء تحميل البيانات");
        } finally {
            setRecordsLoading(false);
        }
    };
    return (
        <>
            <div className="sticky top-0 z-50">
                <Header user={true} />
            </div>

            <main
                dir="rtl"
                className="min-h-screen bg-slate-100 p-6 sm:p-8"
            >
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-3xl font-bold text-orange-600">
                        نظام التسويق
                    </h1>

                    <p className="mt-3 text-gray-600">
                        اختر القسم الذي تريد العمل عليه.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-8 rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-200"
                    >
                        العودة للرئيسية
                    </button>

                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {marketingSections.map((section) => (
                            <button
                                key={section.path}
                                type="button"
                                onClick={() => navigate(section.path)}
                                className="rounded-xl bg-white p-6 text-right shadow transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <h2 className="text-xl font-bold text-orange-600">
                                    {section.title}
                                </h2>

                                <p className="mt-3 text-gray-600">
                                    {section.description}
                                </p>
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-center p-6">
                        <h1 className="text-center text-3xl font-bold text-orange-600">
                            جرد المنسقين و المناديب
                        </h1>
                    </div>

                    {loading && (
                        <p className="p-6 text-center">جاري تحميل الإحصائيات...</p>
                    )}

                    {error && (
                        <div className="p-6 text-center text-red-600">
                            {error}
                            <button
                                onClick={() => navigate(0)}
                                className="ml-3 underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && stats && (
                        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                            {cards.map((card) => (
                                <button
                                    key={card.key}
                                    type="button"
                                    onClick={() => handleCardClick(card)}
                                    className="rounded-lg bg-orange-600 p-4 text-center text-white shadow-md transition duration-200 hover:-translate-y-1 hover:bg-orange-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                                >
                                    <p>{card.label}</p>
                                    <p className="mt-3 text-3xl font-bold">
                                        {stats[card.key] ?? 0}
                                    </p>
                                    <p className="mt-2 text-xs text-orange-100">
                                        اضغط لعرض التفاصيل
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {selectedCard && (
                    <div className="mx-6 mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {/* Table heading */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-orange-50 p-5">
                            <div>
                                <h2 className="text-xl font-bold text-orange-700">
                                    {selectedCard.label}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    عدد النتائج: {records.length}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCard(null);
                                    setRecords([]);
                                    setRecordsError("");
                                }}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                إغلاق
                            </button>
                        </div>

                        {recordsLoading && (
                            <p className="p-8 text-center text-slate-600">
                                جاري تحميل البيانات...
                            </p>
                        )}

                        {recordsError && (
                            <p className="p-6 text-center text-red-600">
                                {recordsError}
                            </p>
                        )}

                        {!recordsLoading && !recordsError && records.length === 0 && (
                            <p className="p-8 text-center text-slate-500">
                                لا توجد بيانات في هذه الفئة.
                            </p>
                        )}

                        {!recordsLoading && !recordsError && records.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-right text-sm">
                                    <thead className="bg-slate-100 text-slate-700">
                                        <tr>
                                            <th className="px-4 py-3">الكود</th>
                                            <th className="px-4 py-3">الاسم</th>
                                            <th className="px-4 py-3">الوظيفة</th>
                                            <th className="px-4 py-3">الشركة</th>
                                            <th className="px-4 py-3">الحالة</th>
                                            <th className="px-4 py-3">انتهاء الشهادة الصحية</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {records.map((record) => (
                                            <tr
                                                key={record.id}
                                                className="transition hover:bg-orange-50"
                                            >
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {record.code ?? "-"}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                                                    {record.name ?? "-"}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {record.job ?? "-"}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {record.company_name ?? "-"}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {record.states ?? "-"}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {record.health_certificate_expiry_date
                                                        ? new Date(
                                                            record.health_certificate_expiry_date
                                                        ).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}

export default MarketingHome;