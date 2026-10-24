
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header";
import { useAuth } from "../../context/authContext";
import { sendHttpReq } from "../../lib/httpHandler";

function UsersManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [modal, setModal] = useState(null);

    const fetchUsers = useCallback(async (code = "") => {
        setLoading(true);
        setError("");

        try {
            const query = code.trim()
                ? `?code=${encodeURIComponent(code.trim())}`
                : "";

            const response = await sendHttpReq(`users${query}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load users");
            }

            setUsers(data.users || []);
        } catch (err) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        fetchUsers();
    }, [user, navigate, fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(searchCode);
    };

    const handleShowAll = () => {
        setSearchCode("");
        fetchUsers();
    };

    const handleSuccess = () => {
        setModal(null);
        fetchUsers(searchCode);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="sticky top-0 z-40">
                <Header user={user} />
            </div>

            <main className="mx-auto max-w-7xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-orange-600 sm:text-3xl">
                        إدارة المستخدمين
                    </h1>

                    <button
                        onClick={() => navigate("/marketing")}
                        className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
                    >
                        العودة
                    </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => setModal("create")}
                        className="rounded-lg bg-orange-600 px-4 py-3 font-medium text-white hover:bg-orange-700"
                    >
                        + إضافة مستخدم
                    </button>

                    <button
                        onClick={() => setModal("give")}
                        className="rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
                    >
                        منح صلاحية
                    </button>

                    <button
                        onClick={() => setModal("delete")}
                        className="rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
                    >
                        حذف صلاحية
                    </button>
                </div>

                <form
                    onSubmit={handleSearch}
                    className="mt-6 flex flex-wrap gap-3"
                >
                    <input
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        placeholder="ابحث بكود المستخدم"
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-700 px-5 py-3 text-white hover:bg-slate-800"
                    >
                        بحث
                    </button>

                    <button
                        type="button"
                        onClick={handleShowAll}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 hover:bg-gray-100"
                    >
                        عرض الكل
                    </button>
                </form>

                {error && (
                    <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                        <button
                            onClick={() => fetchUsers(searchCode)}
                            className="ml-3 underline"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                )}

                <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <p className="p-8 text-center text-gray-500">
                            جاري تحميل المستخدمين...
                        </p>
                    ) : (
                        <table className="w-full min-w-200 text-right">
                            <thead className="bg-orange-50">
                                <tr>
                                    <th className="p-4">الكود</th>
                                    <th className="p-4">الاسم</th>
                                    <th className="p-4">الصلاحيات</th>
                                    <th className="p-4">النوع</th>
                                    <th className="p-4">تاريخ الإنشاء</th>
                                    <th className="p-4">بواسطة</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((item) => (
                                    <tr
                                        key={item.id ?? item.code}
                                        className="border-t border-gray-100 hover:bg-slate-50"
                                    >
                                        <td className="p-4">{item.code}</td>
                                        <td className="p-4">{item.name}</td>
                                        <td className="p-4">
                                            {Array.isArray(item.auths)
                                                ? item.auths
                                                      .map((auth) => auth.authName)
                                                      .filter(Boolean)
                                                      .join("، ") || "لا توجد"
                                                : "—"}
                                        </td>
                                        <td className="p-4">{item.type ?? "—"}</td>
                                        <td className="p-4">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleDateString("ar-EG")
                                                : "—"}
                                        </td>
                                        <td className="p-4">{item.createdBy ?? "—"}</td>
                                    </tr>
                                ))}

                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-gray-500"
                                        >
                                            لا يوجد مستخدمون لعرضهم.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {modal && (
                <UserModal
                    type={modal}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                    currentUser={user}
                />
            )}
        </div>
    );
}

function UserModal({ type, onClose, onSuccess, currentUser }) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("user");
    const [permission, setPermission] = useState("1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const permissionOptions = [
        { value: "1", label: "طباعة كارت" },
        { value: "2", label: "إضافة مندوب" },
        { value: "12", label: "testtest" },
    ];

    const titles = {
        create: "إضافة مستخدم جديد",
        give: "منح صلاحية",
        delete: "حذف صلاحية",
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            let response;

            if (type === "create") {
                response = await sendHttpReq("users/createUser", "POST", {
                    code: Number(code),
                    name: name.trim(),
                    password,
                    createdBy: currentUser.code,
                    type: userType,
                });
            } else if (type === "give") {
                response = await sendHttpReq(
                    "authsUser/createAuthUser",
                    "POST",
                    {
                        authId: Number(permission),
                        code: Number(code),
                    }
                );
            } else {
                response = await sendHttpReq(
                    "authsUser/deleteAuthUser",
                    "DELETE",
                    {
                        code: Number(code),
                        authId: Number(permission),
                    }
                );
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "فشلت العملية");
            }

            setSuccess(data.message || "تمت العملية بنجاح");

            if (type === "create") {
                setTimeout(onSuccess, 500);
            } else {
                setTimeout(onSuccess, 500);
            }
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تنفيذ العملية");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-modal-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="flex items-center justify-between gap-4">
                    <h2
                        id="user-modal-title"
                        className="text-xl font-bold text-orange-600"
                    >
                        {titles[type]}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="إغلاق"
                        className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {type === "create" && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    الاسم
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    كود المستخدم
                                </label>
                                <input
                                    type="number"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    كلمة المرور
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    نوع المستخدم
                                </label>
                                <select
                                    value={userType}
                                    onChange={(e) => setUserType(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                >
                                    <option value="user">مستخدم</option>
                                    <option value="admin">مدير</option>
                                </select>
                            </div>
                        </>
                    )}

                    {type !== "create" && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    كود المستخدم
                                </label>
                                <input
                                    type="number"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    الصلاحية
                                </label>
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                >
                                    {permissionOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {error && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-orange-600 px-5 py-2 text-white hover:bg-orange-700 disabled:opacity-60"
                        >
                            {loading ? "جاري التنفيذ..." : "تأكيد"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UsersManagement;
