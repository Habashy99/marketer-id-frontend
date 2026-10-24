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
    useEffect(() => {
        if (!user) {
            console.log("No authenticated user found in AuthContext");
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await sendHttpReq("dashboard/stats");
                const data = await response.json();

                console.log("Stats API status:", response.status);
                console.log("Stats API response:", data);

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load statistics"
                    );
                }

                setStats(data.stats);
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, location.key]);

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
                                <div
                                    key={card.key}
                                    className="rounded-lg bg-orange-600 p-4 text-center text-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                                >
                                    <p>{card.label}</p>
                                    <p className="mt-3 text-3xl font-bold">
                                        {stats[card.key] ?? 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-8 rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-200"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </main>
        </>
    );
}

export default MarketingHome;