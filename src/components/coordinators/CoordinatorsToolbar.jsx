const JOBS = [
    { value: "", label: "كل الوظائف" },
    { value: "مندوب", label: "مندوب" },
    { value: "مندوبة", label: "مندوبة" },
    { value: "منسق", label: "منسق" },
    { value: "منسقة", label: "منسقة" },
];

export default function CoordinatorsToolbar({
    search,
    setSearch,
    job,
    setJob,
    filter,
    setFilter,
    onCreateCoordinator,
    onCreateException,
    onDeleteException,
    canAddCoordinator,
    canAddException,
    canDeleteException,
}) {
    return (
        <div className="mb-5 flex flex-col gap-4 rounded-xl bg-white p-4 shadow sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-48 flex-1">
                <label className="mb-1 block text-sm font-semibold">
                    البحث بالكود أو الاسم أو الهاتف
                </label>
                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="اكتب كلمة البحث..."
                    className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-orange-500"
                />
            </div>

            <div className="min-w-40">
                <label className="mb-1 block text-sm font-semibold">
                    الوظيفة
                </label>
                <select
                    value={job}
                    onChange={(event) => setJob(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                >
                    {JOBS.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="min-w-44">
                <label className="mb-1 block text-sm font-semibold">
                    الحالة
                </label>
                <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                >
                    <option value="">الكل</option>
                    <option value="expired">
                        غير مفعل أو الشهادة منتهية
                    </option>
                </select>
            </div>

            <div className="flex flex-wrap gap-2">
                {canAddCoordinator && (
                    <button
                        type="button"
                        onClick={onCreateCoordinator}
                        className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                    >
                        إضافة منسق
                    </button>
                )}

                {canAddException && (
                    <button
                        type="button"
                        onClick={onCreateException}
                        className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                    >
                        إضافة استثناء
                    </button>
                )}

                {canDeleteException && (
                    <button
                        type="button"
                        onClick={onDeleteException}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        حذف استثناء
                    </button>
                )}
            </div>
        </div>
    );
}