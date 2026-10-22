
import { useNavigate } from "react-router-dom";
import Header from "../../helpers/header";

const marketingSections = [
    {
        title: "إدارة المستخدمين",
        description: "المستخدمون والصلاحيات",
        path: "/marketing/users",
    },
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

function MarketingHome() {
    const navigate = useNavigate();

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
