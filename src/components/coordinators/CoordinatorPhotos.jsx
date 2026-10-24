import { useState } from "react";
import { getPhotoUrl, PHOTO_FIELDS } from "../../utils/coordinatorHelpers";

export default function CoordinatorPhotos({
    coordinator,
    compact = false,
}) {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const photos = PHOTO_FIELDS
        .map((field) => ({
            ...field,
            url: getPhotoUrl(coordinator?.[field.key]),
        }))
        .filter((photo) => photo.url);

    if (photos.length === 0) {
        return <span className="text-gray-400">لا توجد صور</span>;
    }

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {photos.map((photo) => (
                    <button
                        key={photo.key}
                        type="button"
                        title={photo.label}
                        onClick={(event) => {
                            event.stopPropagation();
                            setSelectedPhoto(photo);
                        }}
                        className="overflow-hidden rounded-lg border border-gray-300 hover:border-orange-500"
                    >
                        <img
                            src={photo.url}
                            alt={photo.label}
                            className={
                                compact
                                    ? "h-10 w-10 object-cover"
                                    : "h-24 w-24 object-cover"
                            }
                            loading="lazy"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    </button>
                ))}
            </div>

            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[95vw]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -right-3 -top-3 z-10 rounded-full bg-white px-3 py-1 text-xl font-bold text-black"
                            aria-label="إغلاق الصورة"
                        >
                            ×
                        </button>

                        <img
                            src={selectedPhoto.url}
                            alt={selectedPhoto.label}
                            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                        />

                        <p className="mt-2 text-center text-white">
                            {selectedPhoto.label}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}