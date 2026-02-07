// src/components/Pages/ShopOwner/ShopEditorPage.tsx
import { useState } from "react";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";
import ShopPreviewPage from "./ShopPreviewPage";

interface GalleryImage {
  url: string;
  price?: string;
  description?: string;
  featured?: boolean;
}

export default function ShopEditorPage() {
  const [shopData, setShopData] = useState({
    name: "",
    description: "",
    location: "",
    categories: [] as string[],
    newCategory: "",
    contact: {
      phone: "",
      email: "",
      address: "",
      instagram: "",
      facebook: "",
    },
  });

  const defaultCategories = ["Food", "Beauty", "Clothing", "Tech"];

  const [logo, setLogo] = useState<string | null>(null);
  const [hero, setHero] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showPreviewPage, setShowPreviewPage] = useState(false);

  // Upload handlers
  const handleLogoUpload = (files: File[]) => {
    setLogo(URL.createObjectURL(files[0]));
  };

  const handleHeroUpload = (files: File[]) => {
    setHero(URL.createObjectURL(files[0]));
  };

  const handleGalleryUpload = (files: File[]) => {
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      price: "",
      description: "",
      featured: false,
    }));

    setGallery((prev) => [...prev, ...newImages]);
  };

  const removeGalleryItem = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGalleryField = (
    index: number,
    field: keyof GalleryImage,
    value: string | boolean
  ) => {
    const updated = [...gallery];
    (updated[index] as any)[field] = value;
    setGallery(updated);
  };

  // Category handling
  const toggleCategory = (cat: string) => {
    setShopData((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const addNewCategory = () => {
    const cat = shopData.newCategory.trim();
    if (!cat) return;

    setShopData((prev) => ({
      ...prev,
      categories: [...prev.categories, cat],
      newCategory: "",
    }));
  };

  const updateContactField = (field: string, value: string) => {
    setShopData({
      ...shopData,
      contact: {
        ...shopData.contact,
        [field]: value,
      },
    });
  };

  if (showPreviewPage) {
  return (
    <ShopPreviewPage
      data={shopData}
      logo={logo}
      hero={hero}
      gallery={gallery}
      onClose={() => setShowPreviewPage(false)}
    />
  );
}

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-bold">Manage Your Shop</h1>

      {/* LOGO Upload */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
        <h2 className="font-semibold">Logo</h2>

        <ImageUploader multiple= {false} label="Upload Logo" onUpload={handleLogoUpload} />

        {logo && (
          <img
            src={logo}
            onClick={() => setPreviewSrc(logo)}
            className="w-32 rounded-lg mt-3 cursor-pointer"
          />
        )}
      </div>

      {/* Shop Info */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <div>
          <label className="block font-medium">Shop Name</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={shopData.name}
            onChange={(e) =>
              setShopData({ ...shopData, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            rows={3}
            className="w-full border rounded-lg p-2"
            value={shopData.description}
            onChange={(e) =>
              setShopData({ ...shopData, description: e.target.value })
            }
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={shopData.location}
            onChange={(e) =>
              setShopData({ ...shopData, location: e.target.value })
            }
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="font-semibold">Categories</h2>

        <div className="flex flex-wrap gap-3">
          {defaultCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={shopData.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Add new category"
            className="border p-2 rounded-lg flex-1"
            value={shopData.newCategory}
            onChange={(e) =>
              setShopData({ ...shopData, newCategory: e.target.value })
            }
          />
          <button
            onClick={addNewCategory}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="font-semibold">Contact Information</h2>

        {[
          ["phone", "Phone Number"],
          ["email", "Email"],
          ["address", "Address"],
          ["instagram", "Instagram"],
          ["facebook", "Facebook"],
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block font-medium">{label}</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={(shopData.contact as any)[field]}
              onChange={(e) => updateContactField(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Hero */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-semibold mb-3">Hero Image</h2>

        <ImageUploader multiple={false} label="Upload Hero Image" onUpload={handleHeroUpload} />

        {hero && (
          <img
            src={hero}
            className="w-full h-56 object-cover mt-4 rounded-lg cursor-pointer"
            onClick={() => setPreviewSrc(hero)}
          />
        )}
      </div>

      {/* Gallery */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-semibold mb-3">Products Gallery</h2>

        <ImageUploader label="Add Images" onUpload={handleGalleryUpload} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {gallery.map((img, i) => (
            <div key={i} className="relative border p-3 rounded-lg bg-gray-50">
              <img
                src={img.url}
                className="w-full h-40 object-cover rounded-md cursor-pointer"
                onClick={() => setPreviewSrc(img.url)}
              />

              <button
                onClick={() => removeGalleryItem(i)}
                className="absolute top-2 right-2 text-white bg-black/60 p-1 px-2 rounded-full"
              >
                ✕
              </button>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={img.featured}
                  onChange={(e) =>
                    updateGalleryField(i, "featured", e.target.checked)
                  }
                />
                Featured Product
              </label>

              <div className="space-y-2 mt-2">
                <div>
                  <label className="text-sm">Price</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-2"
                    value={img.price}
                    onChange={(e) =>
                      updateGalleryField(i, "price", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="text-sm">Description</label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-md p-2"
                    value={img.description}
                    onChange={(e) =>
                      updateGalleryField(i, "description", e.target.value)
                    }
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
          onClick={() => setShowPreviewPage(true)}
          className="px-6 py-2 bg-black text-white rounded-lg"
        >
          Preview
        </button>

        <button className="px-6 py-2 bg-red-600 text-white rounded-lg">
          Save Changes
        </button>
      </div>

      {/* Image Preview */}
      <ImagePreviewModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </div>
  );
}
