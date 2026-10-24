
function UsersTable({ users, loading }) {
    return (
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

                                <td className="p-4">
                                    {item.type ?? "—"}
                                </td>

                                <td className="p-4">
                                    {item.createdAt
                                        ? new Date(
                                            item.createdAt
                                        ).toLocaleDateString("ar-EG")
                                        : "—"}
                                </td>

                                <td className="p-4">
                                    {item.createdBy ?? "—"}
                                </td>
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
    );
}

export default UsersTable;
