// src/components/Pages/ShopOwner/ShopEditorPage.tsx
import { useState } from "react";

interface GalleryImage {
  url: string;
  price?: string;
  description?: string;
}

export default function ShopEditorPage() {
  const [shopData, setShopData] = useState({
    name: "",
    description: "",
    contact: "",
  });
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setHeroImage(URL.createObjectURL(file));
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        price: "",
        description: "",
      }));
      setGallery((prev) => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (url: string) => {
    setGallery((prev) => prev.filter((img) => img.url !== url));
  };

  const updateImageField = (
    index: number,
    field: keyof GalleryImage,
    value: string
  ) => {
    const updated = [...gallery];
    updated[index][field] = value;
    setGallery(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Manage Your Shop
      </h1>

      {/* Shop Info */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <div>
          <label className="block font-medium mb-1">Shop Name</label>
          <input
            type="text"
            value={shopData.name}
            onChange={(e) =>
              setShopData({ ...shopData, name: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={shopData.description}
            onChange={(e) =>
              setShopData({ ...shopData, description: e.target.value })
            }
            className="w-full border rounded-lg p-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Contact Info</label>
          <input
            type="text"
            value={shopData.contact}
            onChange={(e) =>
              setShopData({ ...shopData, contact: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      {/* Hero Image */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-semibold mb-3">Hero Image</h2>
        <input type="file" accept="image/*" onChange={handleHeroUpload} />
        {heroImage && (
          <img
            src={heroImage}
            alt="Hero"
            className="mt-4 rounded-lg w-full object-cover h-60"
          />
        )}
      </div>

      {/* Gallery */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-semibold mb-3">Gallery</h2>
        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="relative border rounded-lg p-3 bg-gray-50 shadow-sm"
            >
              <img
                src={img.url}
                alt={`Gallery ${i}`}
                className="rounded-md w-full h-40 object-cover mb-3"
              />
              <button
                onClick={() => handleRemoveImage(img.url)}
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full px-2 py-1 text-sm hover:bg-opacity-80"
              >
                ✕
              </button>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium">Price (optional)</label>
                  <input
                    type="text"
                    value={img.price}
                    onChange={(e) =>
                      updateImageField(i, "price", e.target.value)
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="e.g. $25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description (optional)</label>
                  <textarea
                    value={img.description}
                    onChange={(e) =>
                      updateImageField(i, "description", e.target.value)
                    }
                    className="w-full border rounded-md p-2"
                    rows={2}
                    placeholder="Short description..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setShowPreview(true)}
          className="px-6 py-2 bg-black hover:bg-gray-600 text-white font-semibold rounded-lg"
        >
          Preview
        </button>

        <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">
          Save Changes
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-80 rounded-full p-2 text-xl z-50"
            >
              ×
            </button>

            {heroImage && (
              <img
                src={heroImage}
                alt="Hero Preview"
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{shopData.name}</h2>
              <p className="text-gray-600 mb-4">{shopData.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gallery.map((img, i) => (
                  <div key={i} className="rounded-lg overflow-hidden shadow">
                    <img
                      src={img.url}
                      alt={`Preview ${i}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      {img.price && (
                        <p className="font-semibold text-red-600">{img.price}</p>
                      )}
                      {img.description && (
                        <p className="text-sm text-gray-600">{img.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {shopData.contact && (
                <p className="mt-6 text-sm text-gray-700">
                  <b>Contact:</b> {shopData.contact}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
