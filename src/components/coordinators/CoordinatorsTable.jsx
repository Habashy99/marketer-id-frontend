import {
    formatDate,
    isCertificateExpired,
} from "../../utils/coordinatorHelpers";
import CoordinatorPhotos from "./CoordinatorPhotos";

export default function CoordinatorsTable({
    coordinators,
    loading,
    onSelectCoordinator,
}) {
    if (loading) {
        return (
            <p className="py-8 text-center text-gray-500">
                جاري تحميل بيانات المنسقين...
            </p>
        );
    }

    if (coordinators.length === 0) {
        return (
            <p className="py-8 text-center text-gray-500">
                لا توجد بيانات لعرضها.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="min-w-350 w-full border-collapse text-right text-sm">
                <thead className="bg-orange-600 text-white">
                    <tr>
                        {[
                            "الكود",
                            "الاسم",
                            "الوظيفة",
                            "الشركة",
                            "الهاتف",
                            "المحافظة",
                            "الحالة",
                            "الموقف الأمني",
                            "انتهاء الشهادة الصحية",
                            "الصور",
                            "الاستثناءات",
                        ].map((heading) => (
                            <th key={heading} className="whitespace-nowrap p-3">
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {coordinators.map((coordinator) => {
                        const inactive =
                            String(coordinator.states ?? "").trim() ===
                            "غير مفعل";

                        const expired = isCertificateExpired(coordinator);

                        const rowClass = inactive || expired
                            ? "bg-red-50 hover:bg-red-100"
                            : "hover:bg-orange-50";

                        return (
                            <tr
                                key={coordinator.id}
                                onClick={() => onSelectCoordinator(coordinator)}
                                className={`${rowClass} cursor-pointer border-b border-gray-200`}
                                title="اضغط لعرض كل بيانات المنسق"
                            >
                                <td className="p-3">{coordinator.code ?? "—"}</td>
                                <td className="whitespace-nowrap p-3 font-semibold">
                                    {coordinator.name ?? "—"}
                                </td>
                                <td className="whitespace-nowrap p-3">
                                    {coordinator.job ?? "—"}
                                </td>
                                <td className="p-3">{coordinator.company_name ?? "—"}</td>
                                <td className="whitespace-nowrap p-3">
                                    {coordinator.mobile ?? "—"}
                                </td>
                                <td className="p-3">{coordinator.governorate ?? "—"}</td>
                                <td className="whitespace-nowrap p-3">
                                    <span
                                        className={`rounded-full px-2 py-1 ${
                                            inactive
                                                ? "bg-red-200 text-red-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {coordinator.states || "—"}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {coordinator.security_situation ?? "—"}
                                </td>
                                <td
                                    className={`whitespace-nowrap p-3 ${
                                        expired ? "font-bold text-red-700" : ""
                                    }`}
                                >
                                    {formatDate(
                                        coordinator.health_certificate_expiry_date
                                    )}
                                    {expired && (
                                        <span className="mr-1">(منتهية)</span>
                                    )}
                                </td>
                                <td
                                    className="min-w-36 p-3"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <CoordinatorPhotos
                                        coordinator={coordinator}
                                        compact
                                    />
                                </td>
                                <td className="max-w-56 p-3">
                                    {coordinator.exceptions?.length ? (
                                        <div className="flex flex-col gap-1">
                                            {coordinator.exceptions.map((exception) => (
                                                <span
                                                    key={exception.exception_id}
                                                    className="rounded bg-blue-50 px-2 py-1 text-blue-800"
                                                >
                                                    {exception.exception_name || "استثناء"}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        "لا توجد استثناءات"
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}