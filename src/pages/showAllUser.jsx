
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";
import { useAuth } from "../context/authContext";

function ShowAllUser() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await sendHttpReq("users");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load users"
                    );
                }

                setUsers(data.users || []);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, navigate]);

    if (!user) return null;

    return (
        <>
            <div className="sticky top-0 z-50">
                <Header user={true} />
            </div>

            <div className="flex min-h-screen items-start justify-center bg-slate-100 bg-[url('/images/gomla_market_company_cover.jpg')] bg-cover bg-center p-4 sm:p-8">
                <div className="w-full max-w-6xl rounded-xl bg-white p-5 text-center shadow-lg sm:p-8">
                    <h1 className="text-3xl font-bold text-orange-600">
                        عرض جميع المستخدمين
                    </h1>

                    <p className="mt-3 text-gray-600">
                        عرض المستخدمين والصلاحيات الخاصة بهم
                    </p>

                    {loading && (
                        <p className="mt-6 text-gray-600">
                            جاري تحميل المستخدمين...
                        </p>
                    )}

                    {error && (
                        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() => navigate(0)}
                                className="mt-2 underline"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full min-w-225 border-collapse text-right">
                                    <thead>
                                        <tr className="bg-orange-600 text-white">
                                            <th className="p-3 text-center">الكود</th>
                                            <th className="p-3 text-center">اسم المستخدم</th>
                                            <th className="p-3 text-center">الصلاحيات</th>
                                            <th className="p-3 text-center">تاريخ الإنشاء</th>
                                            <th className="p-3 text-center">أنشئ بواسطة</th>
                                            <th className="p-3 text-center">آخر تحديث</th>
                                            <th className="p-3 text-center">النوع</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-gray-200 transition-colors hover:bg-orange-50"
                                                >
                                                    <td className="p-3 text-center">
                                                        {item.code}
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {item.name}
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {item.auths?.length > 0 ? (
                                                            <div className="flex flex-wrap justify-center gap-2">
                                                                {item.auths.map((auth) => (
                                                                    <span
                                                                        key={auth.id}
                                                                        className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
                                                                    >
                                                                        {auth.authName}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                لا توجد صلاحيات
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {item.createdAt
                                                            ? new Date(
                                                                item.createdAt
                                                            ).toLocaleDateString(
                                                                "en-GB"
                                                            )
                                                            : "-"}
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {item.createdBy ?? "-"}
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {item.updatedAt
                                                            ? new Date(
                                                                item.updatedAt
                                                            ).toLocaleDateString(
                                                                "en-GB"
                                                            )
                                                            : "-"}
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {item.type ?? "-"}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="p-6 text-gray-500"
                                                >
                                                    لا يوجد مستخدمون لعرضهم
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <p className="mt-4 text-right text-sm text-gray-500">
                                إجمالي المستخدمين: {users.length}
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

export default ShowAllUser;
