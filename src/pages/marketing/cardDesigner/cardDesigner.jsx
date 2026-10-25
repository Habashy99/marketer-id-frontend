
import { useEffect, useState } from "react";
import Header from "../../../components/header";
import { sendHttpReq } from "../../../lib/httpHandler";
import CanvasSettings from "./CanvasSettings";
import CardPreview from "./CardPreview";
import ElementList from "./ElementList";
import ElementProperties from "./ElementProperties";
import TemplateToolbar from "./TemplateToolbar";

const DEFAULT_SPACING = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
};

const ELEMENT_TYPES = [
    { type: "photo", label: "الصورة", x: 30, y: 30 },
    { type: "name", label: "اسم الموظف", x: 220, y: 80 },
    { type: "company_name", label: "الشركة", x: 220, y: 145 },
    { type: "date", label: "التاريخ", x: 220, y: 200 },
    { type: "code", label: "كود الموظف", x: 220, y: 245 },
    {
        type: "national_id_number",
        label: "الرقم القومي",
        x: 220,
        y: 290,
    },
    { type: "job", label: "الوظيفة", x: 220, y: 335 },
];

const SAMPLE_VALUES = {
    name: "اسم الموظف",
    company_name: "جملة ماركت",
    date: "2026-10-25",
    code: "1001",
    national_id_number: "00000000000000",
    job: "مندوب",
};

function createElement(type) {
    const definition = ELEMENT_TYPES.find(
        (item) => item.type === type
    );

    if (!definition) {
        throw new Error(`Unknown element type: ${type}`);
    }

    const isPhoto = type === "photo";

    return {
        id: crypto.randomUUID(),
        type,
        value: SAMPLE_VALUES[type] ?? definition.label,
        x: definition.x,
        y: definition.y,
        width: isPhoto ? 150 : 250,
        height: isPhoto ? 180 : 45,
        color: "#000000",
        fontSize: 22,
        maxLines: type === "name" ? 2 : 1,
    };
}

const DEFAULT_TEMPLATE = {
    name: "Employee Card",
    width: 856,
    height: 540,
    margins: { ...DEFAULT_SPACING },
    padding: {
        top: 15,
        right: 15,
        bottom: 15,
        left: 15,
    },
    elements: [
        { ...createElement("photo"), width: 150, height: 180 },
        { ...createElement("name"), width: 300, height: 50, fontSize: 24 },
        {
            ...createElement("company_name"),
            width: 300,
            height: 40,
            fontSize: 20,
        },
        { ...createElement("code"), width: 200, height: 35, fontSize: 18 },
    ],
};

export default function CardTemplateSettings() {
    const [template, setTemplate] = useState(() => ({
        ...DEFAULT_TEMPLATE,
        margins: { ...DEFAULT_TEMPLATE.margins },
        padding: { ...DEFAULT_TEMPLATE.padding },
        elements: DEFAULT_TEMPLATE.elements.map((element) => ({
            ...element,
        })),
    }));

    const [selectedId, setSelectedId] = useState(
        DEFAULT_TEMPLATE.elements[1].id
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [drag, setDrag] = useState(null);
    const [canvasResize, setCanvasResize] = useState(null);

    const selectedElement =
        template.elements.find(
            (element) => element.id === selectedId
        ) ?? null;

    const updateTemplate = (key, value) => {
        setTemplate((current) => ({
            ...current,
            [key]: value,
        }));
        setError("");
        setNotice("");
    };

    const updateSpacing = (group, key, value) => {
        setTemplate((current) => ({
            ...current,
            [group]: {
                ...current[group],
                [key]: value,
            },
        }));
    };

    const updateElement = (key, value) => {
        setTemplate((current) => ({
            ...current,
            elements: current.elements.map((element) =>
                element.id === selectedId
                    ? { ...element, [key]: value }
                    : element
            ),
        }));
    };

    const changeOrientation = (orientation) => {
        const width = orientation === "horizontal" ? 856 : 540;
        const height = orientation === "horizontal" ? 540 : 856;

        setTemplate((current) => ({
            ...current,
            width,
            height,
            elements: current.elements.map((element) => ({
                ...element,
                x: Math.max(
                    0,
                    Math.min(element.x, Math.max(0, width - element.width))
                ),
                y: Math.max(
                    0,
                    Math.min(element.y, Math.max(0, height - element.height))
                ),
            })),
        }));
    };

    const addElement = (type) => {
        const existingElement = template.elements.find(
            (element) => element.type === type
        );

        if (existingElement) {
            setSelectedId(existingElement.id);
            return;
        }

        const element = createElement(type);

        setTemplate((current) => ({
            ...current,
            elements: current.elements.some(
                (item) => item.type === type
            )
                ? current.elements
                : [...current.elements, element],
        }));

        setSelectedId(element.id);
        setError("");
        setNotice("");
    };

    const removeElement = () => {
        if (!selectedElement) return;

        const remainingElements = template.elements.filter(
            (element) => element.id !== selectedId
        );

        setTemplate((current) => ({
            ...current,
            elements: current.elements.filter(
                (element) => element.id !== selectedId
            ),
        }));

        setSelectedId(remainingElements[0]?.id ?? "");
        setError("");
        setNotice("");
    };

    const createTemplatePayload = () => ({
        name: template.name.trim(),
        design: {
            version: 1,
            orientation:
                template.width >= template.height
                    ? "horizontal"
                    : "vertical",
            canvas: {
                width: template.width,
                height: template.height,
                background: "#ffffff",
            },
            margins: template.margins,
            padding: template.padding,
            elements: template.elements.map(
                ({ id, ...element }) => element
            ),
        },
    });

    const saveTemplate = async () => {
        if (!template.name.trim()) {
            setError("أدخل اسم القالب.");
            return;
        }

        setBusy(true);
        setError("");
        setNotice("");

        try {
            await sendHttpReq(
                "card-templates",
                "POST",
                createTemplatePayload()
            );
            setNotice("تم حفظ القالب بنجاح.");
        } catch (err) {
            setError(err?.message || "تعذر حفظ القالب.");
        } finally {
            setBusy(false);
        }
    };

    const downloadJson = () => {
        const blob = new Blob(
            [JSON.stringify(createTemplatePayload(), null, 2)],
            { type: "application/json;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${template.name || "employee-card"}.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    const previewScale = Math.min(1, 800 / template.width);

    // Drag the selected element with the mouse.
    useEffect(() => {
        if (!drag) return;

        const handleMouseMove = (event) => {
            const deltaX =
                (event.clientX - drag.startX) / drag.scale;
            const deltaY =
                (event.clientY - drag.startY) / drag.scale;

            const x = Math.round(
                Math.max(
                    0,
                    Math.min(
                        Math.max(0, template.width - drag.elementWidth),
                        drag.elementX + deltaX
                    )
                )
            );

            const y = Math.round(
                Math.max(
                    0,
                    Math.min(
                        Math.max(0, template.height - drag.elementHeight),
                        drag.elementY + deltaY
                    )
                )
            );

            setTemplate((current) => ({
                ...current,
                elements: current.elements.map((element) =>
                    element.id === drag.id
                        ? { ...element, x, y }
                        : element
                ),
            }));
        };

        const handleMouseUp = () => setDrag(null);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [drag, template.width, template.height]);

    // Resize the canvas using its width and height handles.
    useEffect(() => {
        if (!canvasResize) return;

        const handleMouseMove = (event) => {
            const deltaX =
                (event.clientX - canvasResize.startX) /
                canvasResize.scale;
            const deltaY =
                (event.clientY - canvasResize.startY) /
                canvasResize.scale;

            setTemplate((current) => {
                const width =
                    canvasResize.axis === "width"
                        ? Math.max(
                              100,
                              Math.min(
                                  3000,
                                  Math.round(
                                      canvasResize.startWidth + deltaX
                                  )
                              )
                          )
                        : current.width;

                const height =
                    canvasResize.axis === "height"
                        ? Math.max(
                              100,
                              Math.min(
                                  3000,
                                  Math.round(
                                      canvasResize.startHeight + deltaY
                                  )
                              )
                          )
                        : current.height;

                return {
                    ...current,
                    width,
                    height,
                    elements: current.elements.map((element) => ({
                        ...element,
                        x: Math.max(
                            0,
                            Math.min(
                                element.x,
                                Math.max(0, width - element.width)
                            )
                        ),
                        y: Math.max(
                            0,
                            Math.min(
                                element.y,
                                Math.max(0, height - element.height)
                            )
                        ),
                    })),
                };
            });
        };

        const handleMouseUp = () => setCanvasResize(null);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [canvasResize]);

    // Move the selected element with the keyboard arrow keys.
    useEffect(() => {
        const handleKeyDown = (event) => {
            const arrowKeys = [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
            ];

            if (!arrowKeys.includes(event.key)) return;
            if (!selectedId) return;

            // Don't intercept arrow keys while editing form fields.
            const target = event.target;

            if (
                target instanceof HTMLElement &&
                (
                    target.isContentEditable ||
                    target.closest(
                        'input, textarea, select, [contenteditable="true"]'
                    )
                )
            ) {
                return;
            }

            // Don't move the element while resizing or dragging.
            if (drag || canvasResize) return;

            const step = event.shiftKey ? 10 : 1;

            const selected = template.elements.find(
                (element) => element.id === selectedId
            );

            if (!selected) return;

            event.preventDefault();

            setTemplate((current) => ({
                ...current,
                elements: current.elements.map((element) => {
                    if (element.id !== selectedId) return element;

                    let x = element.x;
                    let y = element.y;

                    switch (event.key) {
                        case "ArrowLeft":
                            x -= step;
                            break;
                        case "ArrowRight":
                            x += step;
                            break;
                        case "ArrowUp":
                            y -= step;
                            break;
                        case "ArrowDown":
                            y += step;
                            break;
                        default:
                            break;
                    }

                    return {
                        ...element,
                        x: Math.max(
                            0,
                            Math.min(
                                x,
                                Math.max(
                                    0,
                                    current.width - element.width
                                )
                            )
                        ),
                        y: Math.max(
                            0,
                            Math.min(
                                y,
                                Math.max(
                                    0,
                                    current.height - element.height
                                )
                            )
                        ),
                    };
                }),
            }));
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        selectedId,
        template.elements,
        drag,
        canvasResize,
    ]);

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="sticky top-0 z-40">
                <Header user />
            </div>

            <main
                dir="rtl"
                className="mx-auto max-w-[1700px] p-4 md:p-6"
            >
                <TemplateToolbar
                    template={template}
                    updateTemplate={updateTemplate}
                    downloadJson={downloadJson}
                    onPrint={handlePrint}
                    saveTemplate={saveTemplate}
                    busy={busy}
                    error={error}
                    notice={notice}
                />

                <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                    <div className="min-w-0 space-y-5">
                        <CanvasSettings
                            template={template}
                            updateTemplate={updateTemplate}
                            updateSpacing={updateSpacing}
                            changeOrientation={changeOrientation}
                        />

                        <CardPreview
                            template={template}
                            previewScale={previewScale}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            drag={drag}
                            setDrag={setDrag}
                            setCanvasResize={setCanvasResize}
                        />
                    </div>

                    <aside className="space-y-5">
                        <ElementProperties
                            selectedElement={selectedElement}
                            updateElement={updateElement}
                            removeElement={removeElement}
                        />

                        <ElementList
                            elements={template.elements}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onAdd={addElement}
                        />
                    </aside>
                </div>
            </main>
        </div>
    );
}
