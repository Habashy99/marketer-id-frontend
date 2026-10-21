import { useNavigate } from "react-router-dom";
import Header from "../helpers/header";

function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <div className="sticky top-0 z-50">
                <Header user={null} />
            </div>

            <div className="flex min-h-screen items-center justify-center bg-slate-100 bg-[url('/images/gomla_market_company_cover.jpg')] bg-cover bg-center p-8">
                <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
                    <h1 className="text-3xl font-bold text-orange-600">
                        مرحباً بك في معرِّف المسوِّق
                    </h1>

                    <p className="mt-3 text-gray-600">
                        أدِر فريقك التسويقي في مكان واحد.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 w-full rounded-lg bg-orange-600 px-5 py-3 text-white hover:bg-orange-700"
                    >
                        تسجيل الدخول
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;