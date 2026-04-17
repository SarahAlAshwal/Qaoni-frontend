import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/api";
import { saveImages } from "../../../services/imageService";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";

interface MediaItem {
  id: string;
  url: string;
  order: number;
  isActive: boolean;
}

export default function SlidesManager() {
  const { getAccessTokenSilently } = useAuth();
  const [slides, setSlides] = useState<MediaItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      setSlides(
        data.map((slide: any) => ({
          id: slide._id,
          url: slide.image?.url || "",
          order: slide.order,
          isActive: slide.isActive ?? true,
        }))
      );
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

  const handleUpload = async (files: File[]) => {
    try {
      setIsUploading(true);

      for (const file of files) {
        const createRes = await apiFetch(
          "/api/homepage-slides",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          },
          getAccessTokenSilently
        );

        if (!createRes.ok) {
          throw new Error("Failed to create slide");
        }

        const createdSlide = await createRes.json();

        await saveImages(
          {
            files: [file],
            entityType: "homepage-slide",
            entityId: createdSlide._id,
            imageType: "homepage-slide",
          },
          getAccessTokenSilently
        );
      }

      await loadSlides();
      setMessage("Slides updated.");
    } catch (error) {
      console.error(error);
      setMessage("Slide upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    const normalizedOrder = Number.isFinite(newOrder) && newOrder > 0 ? newOrder : 1;

    setSlides((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, order: normalizedOrder } : item
      )
    );

    try {
      const res = await apiFetch(
        `/api/homepage-slides/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: normalizedOrder }),
        },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to update slide order");
      }

      await loadSlides();
    } catch (error) {
      console.error(error);
      setMessage("Failed to update slide order.");
      await loadSlides();
    }
  };

  const toggleSlide = async (id: string, isActive: boolean) => {
    setSlides((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive } : item
      )
    );

    try {
      const res = await apiFetch(
        `/api/homepage-slides/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to update slide");
      }

      setMessage("Slide updated.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update slide.");
      await loadSlides();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(
        `/api/homepage-slides/${id}`,
        { method: "DELETE" },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to delete slide");
      }

      setSlides((prev) => prev.filter((item) => item.id !== id));
      await loadSlides();
      setMessage("Slide deleted.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete slide.");
    }
  };

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Homepage Slideshow</h2>
        <ImageUploader
          label={isUploading ? "Uploading..." : "Upload Slide Images"}
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
          No slides yet. Upload images to create the homepage slideshow.
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {slides.map((item) => (
          <div
            key={item.id}
            className="relative bg-white rounded-xl shadow-md overflow-hidden"
          >
            <img
              src={item.url}
              alt="Slide"
              onClick={() => setPreviewImage(item.url)}
              className="w-full h-48 object-cover hover:opacity-90 cursor-pointer"
            />

            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm hover:bg-opacity-70"
            >
              X
            </button>

            <div className="p-3 space-y-3">
              <label className="flex items-center justify-between text-sm text-gray-700">
                <span>Active</span>
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(e) => toggleSlide(item.id, e.target.checked)}
                />
              </label>

              <label className="text-sm text-gray-600">Order</label>
              <input
                type="number"
                value={item.order}
                min={1}
                onChange={(e) =>
                  updateOrder(item.id, Number(e.target.value))
                }
                className="w-20 border rounded p-1 ml-2"
              />
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
