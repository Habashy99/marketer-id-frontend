
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Header from "../helpers/header";

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-50">
                <Header user={user} />
            </div>

            <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 bg-[url('/images/gomla_market_company_cover.jpg')] bg-cover bg-center p-6">
                <div className="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-xl sm:p-10">
                    <h1 className="text-3xl font-bold text-orange-600">
                        مرحباً بك في معرِّف المسوِّق
                    </h1>

                    <p className="mt-4 text-gray-600">
                        أدِر فريقك التسويقي في مكان واحد.
                    </p>

                    {!user ? (
                        <button
                            onClick={() => navigate("/login")}
                            className="mt-8 w-full rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                        >
                            تسجيل الدخول
                        </button>
                    ) : (
                        <>
                            <h2 className="mt-8 text-xl font-semibold text-gray-800">
                                أهلاً {user.name}
                            </h2>

                            <p className="mt-2 text-gray-500">
                                اختر النظام الذي تريد استخدامه
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <button
                                    onClick={() => navigate("/marketing")}
                                    className="rounded-xl bg-orange-600 p-6 text-white transition hover:bg-orange-700"
                                >
                                    <span className="text-xl font-bold">
                                        نظام التسويق
                                    </span>
                                    <p className="mt-2 text-sm">
                                        إدارة المستخدمين والمناديب والمنسقين
                                    </p>
                                </button>

                                <button
                                    onClick={() => navigate("/pricing")}
                                    className="rounded-xl bg-slate-700 p-6 text-white transition hover:bg-slate-800"
                                >
                                    <span className="text-xl font-bold">
                                        نظام التسعير
                                    </span>
                                    <p className="mt-2 text-sm">
                                        الدخول إلى نظام التسعير
                                    </p>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;
