
import { useEffect, useMemo, useState } from "react";
import { sendHttpReq } from "../../lib/httpHandler";

function UserModal({ type, onClose, onSuccess, currentUser }) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("user");
    const [permission, setPermission] = useState("");

    const [auths, setAuths] = useState([]);
    const [authsLoading, setAuthsLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const titles = {
        create: "إضافة مستخدم جديد",
        give: "منح صلاحية",
        delete: "حذف صلاحية",
    };

    const getAuthId = (auth) =>
        Number(auth.authNumber ?? auth.auth_number);

    const getParentId = (auth) => {
        const value = auth.parentAuthId ?? auth.parent_auth_id;
        return value == null ? null : Number(value);
    };

    const getAuthName = (auth) =>
        auth.authName ?? auth.auth_name ?? "صلاحية بدون اسم";

    // Load permissions for grant/delete operations.
    useEffect(() => {
        if (type !== "give" && type !== "delete") {
            setAuths([]);
            setPermission("");
            return;
        }

        let cancelled = false;

        async function fetchAuths() {
            setAuthsLoading(true);
            setError("");
            setPermission("");

            try {
                const response = await sendHttpReq("auths");

                if (!Array.isArray(response?.auths)) {
                    throw new Error(
                        response?.message ||
                        "لم يتم العثور على قائمة الصلاحيات."
                    );
                }

                if (!cancelled) {
                    setAuths(response.auths);
                }
            } catch (err) {
                if (!cancelled) {
                    setAuths([]);
                    setError(err.message || "فشل تحميل الصلاحيات.");
                }
            } finally {
                if (!cancelled) {
                    setAuthsLoading(false);
                }
            }
        }

        fetchAuths();

        return () => {
            cancelled = true;
        };
    }, [type]);

    /*
     * Build a recursive permission tree.
     *
     * Supports:
     * - authNumber / auth_number
     * - parentAuthId / parent_auth_id
     * - Any number of hierarchy levels
     *
     * Example:
     * الإدارة
     *   إدارة التسويق
     *   إدارة التسعير
     * الأنظمة
     *   نظام طبع كارت
     *     إنشاء التصميم
     *     حذف التصميم
     */
    const permissionOptions = useMemo(() => {
        const authMap = new Map();
        const childrenMap = new Map();

        auths.forEach((auth) => {
            const id = getAuthId(auth);

            if (Number.isFinite(id)) {
                authMap.set(id, auth);
                childrenMap.set(id, []);
            }
        });

        const roots = [];

        auths.forEach((auth) => {
            const id = getAuthId(auth);
            const parentId = getParentId(auth);

            if (!authMap.has(id)) return;

            if (
                parentId === null ||
                parentId === id ||
                !authMap.has(parentId)
            ) {
                roots.push(auth);
            } else {
                childrenMap.get(parentId).push(auth);
            }
        });

        // Force the main categories to appear first.
        const rootOrder = ["الإدارة", "الأنظمة"];

        roots.sort((a, b) => {
            const nameA = getAuthName(a).trim();
            const nameB = getAuthName(b).trim();

            const indexA = rootOrder.indexOf(nameA);
            const indexB = rootOrder.indexOf(nameB);

            if (indexA !== -1 || indexB !== -1) {
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            }

            return nameA.localeCompare(nameB, "ar");
        });

        const options = [];
        const visited = new Set();

        const addNode = (auth, depth = 0) => {
            const id = getAuthId(auth);

            if (visited.has(id)) return;
            visited.add(id);

            options.push({
                id,
                name: getAuthName(auth),
                depth,
            });

            const children = childrenMap.get(id) ?? [];

            children.forEach((child) => addNode(child, depth + 1));
        };

        roots.forEach((root) => addNode(root));

        // Include any remaining entries without duplicating them.
        auths.forEach((auth) => {
            const id = getAuthId(auth);

            if (Number.isFinite(id) && !visited.has(id)) {
                addNode(auth);
            }
        });

        return options;
    }, [auths]);

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

        if (type === "give" || type === "delete") {
            if (!permission) {
                setError("يرجى اختيار الصلاحية.");
                return;
            }

            if (!auths.some((auth) => getAuthId(auth) === Number(permission))) {
                setError("الصلاحية المختارة غير صحيحة.");
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
                data = await sendHttpReq(
                    "authsUser/createAuthUser",
                    "POST",
                    {
                        authId: Number(permission),
                        code: Number(trimmedCode),
                    }
                );
            } else {
                data = await sendHttpReq(
                    "authsUser/deleteAuthUser",
                    "DELETE",
                    {
                        code: Number(trimmedCode),
                        authId: Number(permission),
                    }
                );
            }

            setSuccess(data?.message || "تمت العملية بنجاح.");

            await new Promise((resolve) => setTimeout(resolve, 500));

            await onSuccess();
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تنفيذ العملية.");
        } finally {
            setLoading(false);
        }
    };

    const isPermissionOperation = type === "give" || type === "delete";

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

                    {isPermissionOperation && (
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
                                <label
                                    htmlFor="permission-select"
                                    className="mb-1 block text-sm font-medium"
                                >
                                    الصلاحية
                                </label>

                                {authsLoading ? (
                                    <p className="rounded-lg border border-gray-200 p-3 text-gray-500">
                                        جاري تحميل الصلاحيات...
                                    </p>
                                ) : (
                                    <select
                                        id="permission-select"
                                        value={permission}
                                        onChange={(e) => setPermission(e.target.value)}
                                        required
                                        disabled={authsLoading || auths.length === 0}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100"
                                    >
                                        <option value="" disabled>
                                            اختر الصلاحية
                                        </option>

                                        {permissionOptions.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {"　".repeat(option.depth)}
                                                {option.depth > 0 ? "└ " : ""}
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {!authsLoading && auths.length === 0 && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        لا توجد صلاحيات متاحة في جدول الصلاحيات.
                                    </p>
                                )}

                                {!authsLoading && auths.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        يمكنك اختيار النظام الرئيسي أو أي صلاحية
                                        فرعية تحته.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            role="status"
                            className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
                        >
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
                            disabled={
                                loading ||
                                (isPermissionOperation &&
                                    (authsLoading || auths.length === 0))
                            }
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
