import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/api";
import { saveImages } from "../../../services/imageService";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";

interface SlideItem {
  id: string;
  url: string;
  order: number;
  isActive: boolean;
  file: File | null;
  isNew: boolean;
}

const cloneSlides = (slides: SlideItem[]) =>
  slides.map((slide) => ({ ...slide, file: slide.file ?? null }));

export default function SlidesManager() {
  const { getAccessTokenSilently } = useAuth();
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [originalSlides, setOriginalSlides] = useState<SlideItem[]>([]);
  const [deletedSlideIds, setDeletedSlideIds] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    if (deletedSlideIds.length > 0) return true;
    if (slides.length !== originalSlides.length) return true;

    return slides.some((slide, index) => {
      const original = originalSlides[index];
      if (!original) return true;

      return (
        slide.id !== original.id ||
        slide.order !== original.order ||
        slide.isActive !== original.isActive ||
        slide.url !== original.url ||
        Boolean(slide.file) ||
        slide.isNew
      );
    });
  }, [deletedSlideIds, originalSlides, slides]);

  const loadSlides = async () => {
    try {
      const res = await apiFetch(
        "/api/homepage-slides/admin",
        { method: "GET" },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to load slides");
      }

      const data = await res.json();
      const nextSlides: SlideItem[] = data.map((slide: any) => ({
        id: slide._id,
        url: slide.image?.url || "",
        order: slide.order,
        isActive: slide.isActive ?? true,
        file: null,
        isNew: false,
      }));

      setSlides(cloneSlides(nextSlides));
      setOriginalSlides(cloneSlides(nextSlides));
      setDeletedSlideIds([]);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load slides.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSlides();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => setMessage(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const handleUpload = (files: File[]) => {
    const newItems = files.map((file, index) => ({
      id: `draft-slide-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      order: slides.length + index + 1,
      isActive: true,
      file,
      isNew: true,
    }));

    setSlides((prev) => [...prev, ...newItems]);
    setMessage("Draft slide added. Save to publish changes.");
  };

  const updateOrder = (id: string, newOrder: number) => {
    const normalizedOrder = Number.isFinite(newOrder) && newOrder > 0 ? newOrder : 1;

    setSlides((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, order: normalizedOrder } : item
      )
    );
  };

  const toggleSlide = (id: string, isActive: boolean) => {
    setSlides((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setSlides((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.isNew && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }

      return prev.filter((item) => item.id !== id);
    });

    if (!id.startsWith("draft-slide-")) {
      setDeletedSlideIds((prev) => [...prev, id]);
    }
  };

  const handleDiscard = () => {
    slides.forEach((slide) => {
      if (slide.isNew && slide.url.startsWith("blob:")) {
        URL.revokeObjectURL(slide.url);
      }
    });

    setSlides(cloneSlides(originalSlides));
    setDeletedSlideIds([]);
    setMessage("Slide changes discarded.");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      for (const id of deletedSlideIds) {
        const res = await apiFetch(
          `/api/homepage-slides/${id}`,
          { method: "DELETE" },
          getAccessTokenSilently
        );

        if (!res.ok) {
          throw new Error("Failed to delete slide");
        }
      }

      for (const slide of slides) {
        if (slide.isNew && slide.file) {
          const createRes = await apiFetch(
            "/api/homepage-slides",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order: slide.order,
                isActive: slide.isActive,
              }),
            },
            getAccessTokenSilently
          );

          if (!createRes.ok) {
            throw new Error("Failed to create slide");
          }

          const createdSlide = await createRes.json();

          await saveImages(
            {
              files: [slide.file],
              entityType: "homepage-slide",
              entityId: createdSlide._id,
              imageType: "homepage-slide",
            },
            getAccessTokenSilently
          );

          continue;
        }

        const res = await apiFetch(
          `/api/homepage-slides/${slide.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order: slide.order,
              isActive: slide.isActive,
            }),
          },
          getAccessTokenSilently
        );

        if (!res.ok) {
          throw new Error("Failed to update slide");
        }
      }

      await loadSlides();
      setMessage("Slides saved.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save slide changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-16">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Homepage Slideshow</h2>
          <p className="text-sm text-gray-600">
            Add draft slides locally, preview them, then save when you are ready to publish.
          </p>
        </div>
        <ImageUploader
          label={isSaving ? "Saving..." : "Add Draft Slides"}
          multiple={true}
          onUpload={handleUpload}
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 shadow-md text-gray-600">
          Loading slides...
        </div>
      ) : null}

      {!isLoading && slides.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md text-gray-600">
          No slides yet. Add draft images, then save to publish the homepage slideshow.
        </div>
      ) : null}

      {!isLoading && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            {hasUnsavedChanges
              ? "You have unsaved slide changes."
              : "All slide changes are saved."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              disabled={!hasUnsavedChanges || isSaving}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={!hasUnsavedChanges || isSaving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {slides.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl bg-white shadow-md"
          >
            <img
              src={item.url}
              alt="Slide"
              onClick={() => setPreviewImage(item.url)}
              className="h-48 w-full cursor-pointer object-cover hover:opacity-90"
            />

            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm text-white hover:bg-opacity-70"
            >
              X
            </button>

            <div className="space-y-3 p-3">
              {item.isNew ? (
                <p className="text-xs font-medium text-amber-700">Draft slide</p>
              ) : null}

              <label className="flex items-center justify-between text-sm text-gray-700">
                <span>Active</span>
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(e) => toggleSlide(item.id, e.target.checked)}
                />
              </label>

              <div>
                <label className="text-sm text-gray-600">Order</label>
                <input
                  type="number"
                  value={item.order}
                  min={1}
                  onChange={(e) => updateOrder(item.id, Number(e.target.value))}
                  className="ml-2 w-20 rounded border p-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {message ? (
        <div className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white">
          {message}
        </div>
      ) : null}

      <ImagePreviewModal
        src={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </section>
  );
}
