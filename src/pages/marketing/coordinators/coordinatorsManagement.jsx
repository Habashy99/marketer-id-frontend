import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "../../../components/header";
import { sendHttpReq } from "../../../lib/httpHandler";
import { useNavigate } from "react-router-dom";
import CoordinatorsToolbar from "../../../components/coordinators/CoordinatorsToolbar";
import CoordinatorsTable from "../../../components/coordinators/CoordinatorsTable";
import CoordinatorDetailsModal from "../../../components/coordinators/CoordinatorDetailsModal";
import CreateCoordinatorModal from "../../../components/coordinators/CreateCoordinatorModal";
import CreateExceptionModal from "../../../components/coordinators/CreateExceptionModal";
import DeleteExceptionModal from "../../../components/coordinators/DeleteExceptionModal";
import {
    groupCoordinators,
    normalizeJob,
} from "../../../utils/coordinatorHelpers";

async function readResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "حدث خطأ أثناء تنفيذ الطلب.");
    }

    return data;
}

export default function CoordinatorsManagement() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [job, setJob] = useState("");
    const [filter, setFilter] = useState("");

    const [selectedCoordinator, setSelectedCoordinator] = useState(null);

    const [createCoordinatorOpen, setCreateCoordinatorOpen] = useState(false);
    const [createExceptionOpen, setCreateExceptionOpen] = useState(false);
    const [deleteExceptionOpen, setDeleteExceptionOpen] = useState(false);

    const loadCoordinators = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await sendHttpReq("coordinators");
            const data = await readResponse(response);

            if (!Array.isArray(data.coordinators)) {
                throw new Error("استجابة الخادم لا تحتوي على قائمة المنسقين.");
            }

            setRows(data.coordinators);
        } catch (err) {
            setError(err.message || "تعذر تحميل المنسقين.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCoordinators();
    }, [loadCoordinators]);

    const coordinators = useMemo(
        () => groupCoordinators(rows),
        [rows]
    );

    const filteredCoordinators = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return coordinators.filter((coordinator) => {
            const matchesSearch =
                !searchValue ||
                [
                    coordinator.code,
                    coordinator.name,
                    coordinator.mobile,
                    coordinator.company_name,
                    coordinator.governorate,
                    coordinator.national_id_number,
                ].some((value) =>
                    String(value ?? "").toLowerCase().includes(searchValue)
                );

            const matchesJob =
                !job ||
                normalizeJob(coordinator.job) === normalizeJob(job);

            const inactive =
                String(coordinator.states ?? "").trim() === "غير مفعل";

            let expiredCertificate = false;

            if (coordinator.health_certificate_expiry_date) {
                const expiry = new Date(
                    coordinator.health_certificate_expiry_date
                );

                if (!Number.isNaN(expiry.getTime())) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    expiry.setHours(0, 0, 0, 0);
                    expiredCertificate = expiry < today;
                }
            }

            const matchesFilter =
                filter !== "expired" ||
                inactive ||
                expiredCertificate;

            return matchesSearch && matchesJob && matchesFilter;
        });
    }, [coordinators, search, job, filter]);

    async function handleCreateCoordinator(formData) {
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const response = await sendHttpReq(
                "coordinators/createCoordinator",
                "POST",
                formData
            );

            const data = await readResponse(response);

            setCreateCoordinatorOpen(false);
            setNotice(data.message || "تم إنشاء المنسق بنجاح.");
            await loadCoordinators();
        } catch (err) {
            setError(err.message || "فشل إنشاء المنسق.");
            throw err;
        } finally {
            setSaving(false);
        }
    }

    async function handleCreateException(formData) {
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const response = await sendHttpReq(
                "exceptions/createException",
                "POST",
                formData
            );

            const data = await readResponse(response);

            setCreateExceptionOpen(false);
            setNotice(data.message || "تمت إضافة الاستثناء بنجاح.");
            await loadCoordinators();
        } catch (err) {
            setError(err.message || "فشل إضافة الاستثناء.");
            throw err;
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteException(exceptionId) {
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const response = await sendHttpReq(
                "exceptions/deleteException",
                "DELETE",
                { exception_id: exceptionId }
            );

            const data = await readResponse(response);

            setDeleteExceptionOpen(false);
            setNotice(data.message || "تم حذف الاستثناء بنجاح.");

            if (
                selectedCoordinator &&
                selectedCoordinator.exceptions?.some(
                    (item) => Number(item.exception_id) === exceptionId
                )
            ) {
                setSelectedCoordinator(null);
            }

            await loadCoordinators();
        } catch (err) {
            setError(err.message || "فشل حذف الاستثناء.");
            throw err;
        } finally {
            setSaving(false);
        }
    }
    async function handleUpdateCoordinator(formData) {
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const response = await sendHttpReq(
                "coordinators/updateCoordinator",
                "PUT",
                formData
            );

            const data = await readResponse(response);
            const updatedId = Number(formData.get("id"));

            // Refresh the coordinators once.
            const refreshResponse = await sendHttpReq("coordinators");
            const refreshData = await readResponse(refreshResponse);

            if (!Array.isArray(refreshData.coordinators)) {
                throw new Error("استجابة الخادم لا تحتوي على قائمة المنسقين.");
            }

            setRows(refreshData.coordinators);

            const updatedCoordinator = refreshData.coordinators.find(
                (item) => Number(item.id) === updatedId
            );

            if (updatedCoordinator) {
                setSelectedCoordinator(updatedCoordinator);
            }

            setNotice(data.message || "تم تحديث بيانات المنسق بنجاح.");
        } catch (err) {
            setError(err.message || "فشل تحديث بيانات المنسق.");
            throw err;
        } finally {
            setSaving(false);
        }
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-100">
            <Header />

            <main className="mx-auto max-w-[1800px] p-4 sm:p-6">

                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-orange-700">
                        إدارة المنسقين والمندوبين
                    </h1>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/marketing")}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
                        >
                            العودة لنظام التسويق
                        </button>

                        <button
                            type="button"
                            onClick={loadCoordinators}
                            disabled={loading}
                            className="rounded-lg border border-orange-600 px-4 py-2 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                        >
                            {loading ? "جاري التحديث..." : "تحديث البيانات"}
                        </button>
                    </div>
                </div>


                {error && (
                    <div
                        role="alert"
                        className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="font-bold"
                        >
                            ×
                        </button>
                    </div>
                )}

                {notice && (
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                        <span>{notice}</span>
                        <button
                            type="button"
                            onClick={() => setNotice("")}
                            className="font-bold"
                        >
                            ×
                        </button>
                    </div>
                )}

                <CoordinatorsToolbar
                    search={search}
                    setSearch={setSearch}
                    job={job}
                    setJob={setJob}
                    filter={filter}
                    setFilter={setFilter}
                    onCreateCoordinator={() => setCreateCoordinatorOpen(true)}
                    onCreateException={() => setCreateExceptionOpen(true)}
                    onDeleteException={() => setDeleteExceptionOpen(true)}
                />

                <div className="mb-3 text-sm text-gray-600">
                    عدد المنسقين:{" "}
                    <strong>{filteredCoordinators.length}</strong>
                </div>

                <CoordinatorsTable
                    coordinators={filteredCoordinators}
                    loading={loading}
                    onSelectCoordinator={setSelectedCoordinator}
                />

                <CreateCoordinatorModal
                    open={createCoordinatorOpen}
                    onClose={() => setCreateCoordinatorOpen(false)}
                    onSubmit={handleCreateCoordinator}
                    saving={saving}
                />

                <CreateExceptionModal
                    open={createExceptionOpen}
                    onClose={() => setCreateExceptionOpen(false)}
                    onSubmit={handleCreateException}
                    coordinators={coordinators}
                    saving={saving}
                />

                <DeleteExceptionModal
                    open={deleteExceptionOpen}
                    onClose={() => setDeleteExceptionOpen(false)}
                    onSubmit={handleDeleteException}
                    coordinators={coordinators}
                    saving={saving}
                />

                <CoordinatorDetailsModal
                    coordinator={selectedCoordinator}
                    onClose={() => setSelectedCoordinator(null)}
                    onSave={handleUpdateCoordinator}
                    saving={saving}
                />
            </main>
        </div>
    );
}