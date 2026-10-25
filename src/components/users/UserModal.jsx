
import { useState } from "react";
import { sendHttpReq } from "../../lib/httpHandler";

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

        const trimmedCode = code.trim();

        if (!/^\d+$/.test(trimmedCode) || Number(trimmedCode) <= 0) {
            setError("يرجى إدخال كود مستخدم صحيح.");
            return;
        }

        if (type === "create") {
            if (!name.trim()) {
                setError("يرجى إدخال اسم المستخدم.");
                return;
            }

            if (!password) {
                setError("يرجى إدخال كلمة المرور.");
                return;
            }
        }

        if (!["create", "give", "delete"].includes(type)) {
            setError("نوع العملية غير صحيح.");
            return;
        }

        setLoading(true);

        try {
            let data;

            if (type === "create") {
                data = await sendHttpReq("users/createUser", "POST", {
                    code: Number(trimmedCode),
                    name: name.trim(),
                    password,
                    createdBy: currentUser?.code,
                    type: userType,
                });
            } else if (type === "give") {
                data = await sendHttpReq("authsUser/createAuthUser", "POST", {
                    authId: Number(permission),
                    code: Number(trimmedCode),
                });
            } else {
                data = await sendHttpReq("authsUser/deleteAuthUser", "DELETE", {
                    code: Number(trimmedCode),
                    authId: Number(permission),
                });
            }

            setSuccess(data?.message || "تمت العملية بنجاح.");

            // Allow the success message to appear before refreshing the list.
            await new Promise((resolve) => setTimeout(resolve, 700));

            await onSuccess();
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تنفيذ العملية.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            dir="rtl"
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onClose();
                }
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
                        {titles[type] || "إدارة المستخدمين"}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="إغلاق"
                        className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
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
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    كود المستخدم
                                </label>
                                <input
                                    type="number"
                                    min="1"
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

                    {(type === "give" || type === "delete") && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    كود المستخدم
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    autoFocus
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
                        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
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

export default UserModal;
