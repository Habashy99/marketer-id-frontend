
import { useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { formatDate, inputClass } from "../../helpers/cardHelpers";

const initialCards = [
    {
        id: 1,
        branch: "المنتزه",
        department: "المبيعات",
        barcode: "100001",
        name: "كارت مندوب",
        quantity: 20,
        date: "2026-10-20",
    },
    {
        id: 2,
        branch: "جناكليس",
        department: "المخازن",
        barcode: "100002",
        name: "كارت منسق",
        quantity: 15,
        date: "2026-10-21",
    },
    {
        id: 3,
        branch: "روز جاردن",
        department: "المبيعات",
        barcode: "100003",
        name: "كارت مندوب",
        quantity: 30,
        date: "2026-10-22",
    },
];

export default function CardDetailsSection() {
    const [cards] = useState(initialCards);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchText, setSearchText] = useState("");

    const filteredCards = useMemo(() => {
        const search = searchText.trim().toLowerCase();

        return cards.filter((card) => {
            const matchesText = [
                card.branch,
                card.department,
                card.barcode,
                card.name,
            ].some((value) =>
                String(value).toLowerCase().includes(search)
            );

            const matchesFromDate = !fromDate || card.date >= fromDate;
            const matchesToDate = !toDate || card.date <= toDate;

            return matchesText && matchesFromDate && matchesToDate;
        });
    }, [cards, searchText, fromDate, toDate]);

    function clearFilters() {
        setFromDate("");
        setToDate("");
        setSearchText("");
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
                <h2 className="text-xl font-bold text-slate-900">
                    بيانات البطاقات
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    البحث في بيانات البطاقات حسب التاريخ أو بياناتها.
                </p>
            </div>

            <div className="flex flex-col items-end gap-4 border-b border-slate-100 p-5 sm:flex-row">
                <div className="w-full min-w-0 flex-1">
                    <label htmlFor="cardSearch" className="mb-2 block text-sm font-semibold">
                        البحث
                    </label>
                    <div className="relative">
                        <Search
                            size={19}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            id="cardSearch"
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="الفرع أو القسم أو الباركود أو الاسم..."
                            className={`${inputClass} pr-10`}
                        />
                    </div>
                </div>

                <div className="w-full min-w-0 flex-1">
                    <label htmlFor="detailsFromDate" className="mb-2 block text-sm font-semibold">
                        <CalendarDays size={16} className="ml-1 inline" />
                        من تاريخ
                    </label>
                    <input
                        id="detailsFromDate"
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(e) => setFromDate(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="w-full min-w-0 flex-1">
                    <label htmlFor="detailsToDate" className="mb-2 block text-sm font-semibold">
                        <CalendarDays size={16} className="ml-1 inline" />
                        إلى تاريخ
                    </label>
                    <input
                        id="detailsToDate"
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(e) => setToDate(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <button
                    type="button"
                    onClick={clearFilters}
                    className="w-fit shrink-0 whitespace-nowrap rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                    مسح البحث والفلاتر
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-187.5 text-right text-sm">
                    <thead className="bg-orange-50 text-slate-700">
                        <tr>
                            <th className="px-4 py-4">الفرع</th>
                            <th className="px-4 py-4">القسم</th>
                            <th className="px-4 py-4">الباركود</th>
                            <th className="px-4 py-4">الاسم</th>
                            <th className="px-4 py-4">الكمية</th>
                            <th className="px-4 py-4">التاريخ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCards.length ? (
                            filteredCards.map((card) => (
                                <tr key={card.id} className="hover:bg-orange-50/50">
                                    <td className="px-4 py-4">{card.branch}</td>
                                    <td className="px-4 py-4">{card.department}</td>
                                    <td className="px-4 py-4 font-mono">{card.barcode}</td>
                                    <td className="px-4 py-4">{card.name}</td>
                                    <td className="px-4 py-4">
                                        <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                                            {card.quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">{formatDate(card.date)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                    لا توجد بطاقات مطابقة للبحث.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
                عدد البطاقات المعروضة: {filteredCards.length}
                {" — "}
                إجمالي الكميات في الجدول:{" "}
                {filteredCards.reduce(
                    (total, card) => total + Number(card.quantity || 0),
                    0
                )}
            </div>
        </section>
    );
}
