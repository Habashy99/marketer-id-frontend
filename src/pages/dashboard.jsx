
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Header from "../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await sendHttpReq("dashboard/stats");

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load statistics");
                }

                setStats(data.stats);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, location.key]);


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

    return (
        <div>
            <div className="sticky top-0 z-50">
                <Header user={true} />
            </div>

            <div className="flex justify-center p-6">
                <h1 className="text-center text-3xl font-bold text-orange-600">
                    مرحباً بك في لوحة التحكم, {user.name}, {user.code}
                </h1>
            </div>


            <div className="flex flex-row-reverse flex-nowrap justify-start gap-3 overflow-x-auto p-6">
                <button
                    onClick={() => navigate("/createNewUser")}
                    className="shrink-0 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-base"
                >
                    إنشاء مستخدم جديد
                </button>

                <button
                    onClick={() => navigate("/givePermission")}
                    className="shrink-0 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-base"
                >
                    منح/حذف الإذن للمستخدم
                </button>

                <button
                    onClick={() => navigate("/createNewCoordinator")}
                    className="shrink-0 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-base"
                >
                    إنشاء مندوب/منسق جديد
                </button>

                <button
                    onClick={() => navigate("/createNewCoordinator")}
                    className="shrink-0 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-base"
                >
                    منح/حذف استثناء
                </button>

                <button
                    onClick={() => navigate("/showAllUser")}
                    className="shrink-0 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-base"
                >
                    عرض جميع المستخدمين
                </button>

                <button
                    onClick={() => navigate("/showAllCoordinators")}
                    className="shrink-0 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-base"
                >
                    عرض جميع المناديب/المنسقين
                </button>
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
        </div>
    );
}

export default Dashboard;
