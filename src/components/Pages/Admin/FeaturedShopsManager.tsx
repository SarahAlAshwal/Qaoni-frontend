import { useState } from "react";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";

interface MediaItem {
  id: string;
  url: string;
  order: number;
}

export default function FeaturedShopsManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleUpload = (files: File[]) => {
    const newItems = files.map((file, i) => ({
      id: Date.now().toString() + i,
      url: URL.createObjectURL(file),
      order: items.length + i + 1,
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const updateOrder = (id: string, newOrder: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, order: newOrder } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Featured Shops</h2>
        <ImageUploader label="Upload Logos" onUpload={handleUpload} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative bg-white rounded-xl shadow-md overflow-hidden"
          >
            <img
              src={item.url}
              alt="Featured Shop"
              onClick={() => setPreviewImage(item.url)}
              className="w-full h-48 object-contain bg-gray-100 hover:opacity-90 cursor-pointer"
            />

            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm hover:bg-opacity-70"
            >
              ✕
            </button>

            <div className="p-3">
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

      <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </section>
  );
}
