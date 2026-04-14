// src/components/Pages/ShopOwner/ShopEditorPage.tsx
import { useEffect, useState } from "react";
import { saveImages } from "../../../services/imageService";
import { apiFetch } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";
import ShopPreviewPage from "./ShopPreviewPage";

interface GalleryImage {
  url: string;
  file: File | null;
  price?: string;
  description?: string;
  featured?: boolean;
}

export default function ShopEditorPage() {
  const { getAccessTokenSilently } = useAuth();
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hero, setHero] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showPreviewPage, setShowPreviewPage] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [originalShop, setOriginalShop] = useState<{
    data: typeof shopData;
    logo: string | null;
    hero: string | null;
    gallery: GalleryImage[];
  } | null>(null);

  // Upload handlers
  const handleLogoUpload = (files: File[]) => {
    setLogoFile(files[0]);
    setLogo(URL.createObjectURL(files[0]));
  };

  const handleHeroUpload = (files: File[]) => {
    setHeroFile(files[0]);
    setHero(URL.createObjectURL(files[0]));
  };

  const handleGalleryUpload = (files: File[]) => {
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
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

  useEffect(() => {
    let isMounted = true;

    const loadShop = async () => {
      try {
        const res = await apiFetch(
          "/api/shops/me",
          { method: "GET" },
          getAccessTokenSilently
        );

        if (!res.ok) {
          if (res.status === 404) {
            if (isMounted) setIsEditing(true);
            if (isMounted) setOriginalShop(null);
            return;
          }
          throw new Error("Failed to fetch shop");
        }

        const shop = await res.json();
        if (!isMounted) return;

        setShopId(shop._id);
        setIsEditing(false);
        const nextShopData = {
          ...shopData,
          name: shop.name || "",
          description: shop.description || "",
          location: shop.location || "",
          categories: Array.isArray(shop.categories) ? shop.categories : [],
          contact: {
            phone: shop.contact?.phone || "",
            email: shop.contact?.email || "",
            address: shop.contact?.address || "",
            instagram: shop.contact?.instagram || shop.instagram || "",
            facebook: shop.contact?.facebook || shop.facebook || "",
          },
        };

        setShopData(nextShopData);

        const logoUrl =
          typeof shop.logo === "string" ? shop.logo : shop.logo?.url;
        const heroUrl =
          typeof shop.heroImage === "string"
            ? shop.heroImage
            : shop.heroImage?.url;

        if (logoUrl) setLogo(logoUrl);
        if (heroUrl) setHero(heroUrl);

        const loadedGallery = Array.isArray(shop.gallery)
          ? shop.gallery.map((img: any) => ({
              url: img.url,
              file: null,
              price: img.price ? String(img.price) : "",
              description: img.description || "",
              featured: false,
            }))
          : [];

        setGallery(loadedGallery);

        setOriginalShop({
          data: nextShopData,
          logo: logoUrl || null,
          hero: heroUrl || null,
          gallery: loadedGallery,
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadShop();

    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let nextLogo = logo;
      let nextHero = hero;
      let nextGallery = gallery;
      const payload = {
        name: shopData.name,
        description: shopData.description,
        location: shopData.location,
        categories: shopData.categories,
        contact: shopData.contact,
        instagram: shopData.contact.instagram,
        facebook: shopData.contact.facebook,
      };

      const res = await apiFetch(
        `/api/shops${shopId ? `/${shopId}` : ""}`,
        {
          method: shopId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to save shop");
      }

      const savedShop = await res.json();
      const currentShopId = savedShop._id || shopId;
      if (!shopId) setShopId(currentShopId);

      if (logoFile) {
        const uploaded = await saveImages(
          {
            files: [logoFile],
            entityType: "shop",
            entityId: currentShopId,
            imageType: "shop-logo",
          },
          getAccessTokenSilently
        );
        const uploadedUrl = uploaded?.[0]?.url;
        if (uploadedUrl) {
          nextLogo = uploadedUrl;
          setLogo(uploadedUrl);
        }
        setLogoFile(null);
      }

      if (heroFile) {
        const uploaded = await saveImages(
          {
            files: [heroFile],
            entityType: "shop",
            entityId: currentShopId,
            imageType: "shop-hero",
          },
          getAccessTokenSilently
        );
        const uploadedUrl = uploaded?.[0]?.url;
        if (uploadedUrl) {
          nextHero = uploadedUrl;
          setHero(uploadedUrl);
        }
        setHeroFile(null);
      }

      for (let i = 0; i < gallery.length; i += 1) {
        const item = gallery[i];
        if (!item.file) continue;
        const priceValue =
          item.price && item.price.trim() !== ""
            ? Number(item.price)
            : undefined;

        await saveImages(
          {
            files: [item.file],
            entityType: "shop",
            entityId: currentShopId,
            imageType: "gallery",
            extraData: {
              order: i,
              price: Number.isFinite(priceValue) ? priceValue : undefined,
              description: item.description,
            },
          },
          getAccessTokenSilently
        );
      }
      setOriginalShop({
        data: shopData,
        logo: nextLogo,
        hero: nextHero,
        gallery: nextGallery,
      });
      setIsEditing(false);
      setToast("Shop saved.");
    } catch (err) {
      console.error(err);
      setToast("Save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-gray-600">Loading your shop...</div>
      </div>
    );
  }

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

  if (!isEditing && shopId) {
    return (
      <ShopPreviewPage
        data={shopData}
        logo={logo}
        hero={hero}
        gallery={gallery}
        onClose={() => setIsEditing(true)}
        modeTitle="My Shop"
        actionLabel="Edit"
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

        <div className="flex gap-3">
          {shopId && (
            <button
              onClick={() => {
                if (originalShop) {
                  setShopData(originalShop.data);
                  setLogo(originalShop.logo);
                  setHero(originalShop.hero);
                  setGallery(originalShop.gallery);
                }
                setIsEditing(false);
                setToast("Changes discarded.");
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:opacity-60"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Image Preview */}
      <ImagePreviewModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
