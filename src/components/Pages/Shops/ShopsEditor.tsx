// src/components/Pages/ShopOwner/ShopEditorPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  deleteShopGalleryImage,
  saveImages,
  updateShopGalleryImage,
} from "../../../services/imageService";
import { apiFetch } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";
import ShopPreviewPage from "./ShopPreviewPage";

interface GalleryImage {
  url: string;
  publicId?: string;
  file: File | null;
  price?: string;
  description?: string;
  featured?: boolean;
  order?: number;
}

interface CategoryOption {
  name: string;
  slug: string;
}

const dedupeCategories = (categories: string[]) => {
  const seen = new Set<string>();

  return categories.filter((category) => {
    const normalized = category.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

export default function ShopEditorPage() {
  const { getAccessTokenSilently } = useAuth();
  const [shopData, setShopData] = useState({
    name: "",
    description: "",
    location: "",
    hasDelivery: false,
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
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hero, setHero] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showPreviewPage, setShowPreviewPage] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [visibilityModal, setVisibilityModal] = useState<"publish" | "unpublish" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [deletedGalleryPublicIds, setDeletedGalleryPublicIds] = useState<string[]>([]);
  const [originalShop, setOriginalShop] = useState<{
    data: typeof shopData;
    logo: string | null;
    hero: string | null;
    gallery: GalleryImage[];
    isPublished: boolean;
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
      publicId: undefined,
      file,
      price: "",
      description: "",
      featured: false,
      order: gallery.length,
    }));

    setGallery((prev) => [...prev, ...newImages]);
  };

  const removeGalleryItem = (index: number) => {
    setGallery((prev) => {
      const imageToRemove = prev[index];
      if (imageToRemove?.publicId) {
        setDeletedGalleryPublicIds((current) => [
          ...current,
          imageToRemove.publicId as string,
        ]);
      }

      return prev.filter((_, i) => i !== index);
    });
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
    void (async () => {
      const cat = shopData.newCategory.trim();
      if (!cat) return;

      try {
        const res = await apiFetch(
          "/api/categories",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: cat }),
          },
          getAccessTokenSilently
        );

        if (!res.ok) {
          throw new Error("Failed to create category");
        }

        const category = await res.json();
        const categoryName =
          typeof category?.name === "string" ? category.name.trim() : cat;

        setCategoryOptions((prev) => {
          const next = [...prev];
          const exists = next.some(
            (item) => item.slug.toLowerCase() === String(category?.slug || "").toLowerCase()
          );

          if (!exists) {
            next.push({
              name: categoryName,
              slug: category?.slug || categoryName.toLowerCase(),
            });
          }

          return next.sort((left, right) => left.name.localeCompare(right.name));
        });

        setShopData((prev) => ({
          ...prev,
          categories: dedupeCategories([...prev.categories, categoryName]),
          newCategory: "",
        }));
      } catch (error) {
        console.error(error);
        setToast("Failed to add category.");
      }
    })();
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

    const loadCategories = async () => {
      try {
        const res = await apiFetch("/api/categories", { method: "GET" });
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categories = await res.json();
        if (!isMounted) return;

        setCategoryOptions(
          Array.isArray(categories)
            ? categories
                .filter(
                  (category: any) =>
                    typeof category?.name === "string" &&
                    typeof category?.slug === "string"
                )
                .map((category: any) => ({
                  name: category.name,
                  slug: category.slug,
                }))
            : []
        );
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setToast("Failed to load categories.");
        }
      } finally {
        if (isMounted) {
          setIsCategoriesLoading(false);
        }
      }
    };

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
        setIsPublished(Boolean(shop.isPublished));
        const nextShopData = {
          ...shopData,
          name: shop.name || "",
          description: shop.description || "",
          location: shop.location || "",
          hasDelivery: Boolean(shop.hasDelivery),
          categories: Array.isArray(shop.categories)
            ? dedupeCategories(
                shop.categories.filter(
                  (value: unknown): value is string => typeof value === "string"
                )
              )
            : [],
          contact: {
            phone: shop.contact?.phone || "",
            email: shop.contact?.email || "",
            address: shop.contact?.address || "",
            instagram: shop.contact?.instagram || "",
            facebook: shop.contact?.facebook || "",
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
              publicId: img.publicId,
              file: null,
              price: img.price ? String(img.price) : "",
              description: img.description || "",
              featured: Boolean(img.featured),
              order: img.order ?? 0,
            }))
          : [];

        setGallery(loadedGallery);
        setDeletedGalleryPublicIds([]);

        setOriginalShop({
          data: nextShopData,
          logo: logoUrl || null,
          hero: heroUrl || null,
          gallery: loadedGallery,
          isPublished: Boolean(shop.isPublished),
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadShop();
    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const publishChecks = useMemo(
    () => [
      { label: "Shop name", ok: Boolean(shopData.name.trim()) },
      { label: "Description", ok: Boolean(shopData.description.trim()) },
      { label: "At least one category", ok: shopData.categories.length > 0 },
      { label: "Logo", ok: Boolean(logo) },
      { label: "Hero image or gallery image", ok: Boolean(hero) || gallery.length > 0 },
    ],
    [gallery.length, hero, logo, shopData.categories.length, shopData.description, shopData.name]
  );

  const canPublish = publishChecks.every((check) => check.ok);

  const handleSave = async (nextPublished = isPublished) => {
    try {
      setIsSaving(true);
      let nextLogo = logo;
      let nextHero = hero;
      let nextGallery = gallery;
      const payload = {
        name: shopData.name,
        description: shopData.description,
        location: shopData.location,
        hasDelivery: shopData.hasDelivery,
        categories: shopData.categories,
        contact: shopData.contact,
        instagram: shopData.contact.instagram,
        facebook: shopData.contact.facebook,
        isPublished: nextPublished,
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
        const priceValue =
          item.price && item.price.trim() !== ""
            ? Number(item.price)
            : undefined;

        if (item.file) {
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
                featured: item.featured,
              },
            },
            getAccessTokenSilently
          );
          continue;
        }

        if (item.publicId) {
          await updateShopGalleryImage(
            currentShopId,
            item.publicId,
            {
              order: i,
              price: Number.isFinite(priceValue) ? priceValue : undefined,
              description: item.description,
              featured: item.featured,
            },
            getAccessTokenSilently
          );
        }
      }

      for (const publicId of deletedGalleryPublicIds) {
        await deleteShopGalleryImage(
          currentShopId,
          publicId,
          getAccessTokenSilently
        );
      }

      const refreshedShopRes = await apiFetch(
        "/api/shops/me",
        { method: "GET" },
        getAccessTokenSilently
      );

      if (!refreshedShopRes.ok) {
        throw new Error("Failed to refresh shop");
      }

      const refreshedShop = await refreshedShopRes.json();
      const refreshedLogo =
        typeof refreshedShop.logo === "string"
          ? refreshedShop.logo
          : refreshedShop.logo?.url;
      const refreshedHero =
        typeof refreshedShop.heroImage === "string"
          ? refreshedShop.heroImage
          : refreshedShop.heroImage?.url;
      const refreshedGallery = Array.isArray(refreshedShop.gallery)
        ? refreshedShop.gallery.map((img: any) => ({
            url: img.url,
            publicId: img.publicId,
            file: null,
            price: img.price ? String(img.price) : "",
            description: img.description || "",
            featured: Boolean(img.featured),
            order: img.order ?? 0,
          }))
        : [];

      nextLogo = refreshedLogo || nextLogo;
      nextHero = refreshedHero || nextHero;
      nextGallery = refreshedGallery;
      setLogo(nextLogo);
      setHero(nextHero);
      setGallery(refreshedGallery);
      setIsPublished(Boolean(refreshedShop.isPublished));
      setDeletedGalleryPublicIds([]);
      setOriginalShop({
        data: shopData,
        logo: nextLogo,
        hero: nextHero,
        gallery: nextGallery,
        isPublished: Boolean(refreshedShop.isPublished),
      });
      setIsEditing(false);
      setToast(nextPublished ? "Shop published." : "Shop saved as draft.");
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
        statusLabel={isPublished ? "Published" : "Draft"}
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
        statusLabel={isPublished ? "Published" : "Draft"}
        statusActionLabel={isPublished ? "Unpublish" : "Publish"}
        onStatusAction={() =>
          setVisibilityModal(isPublished ? "unpublish" : "publish")
        }
        statusModalOpen={Boolean(visibilityModal)}
        statusModalTitle={
          visibilityModal === "publish" ? "Publish shop?" : "Unpublish shop?"
        }
        statusModalDescription={
          visibilityModal === "publish"
            ? "Publishing makes your shop visible on the public site and allows it to qualify for featured placement."
            : "Unpublishing removes your shop from public pages and featured-shop eligibility."
        }
        statusChecklist={visibilityModal === "publish" ? publishChecks : undefined}
        statusModalDisabled={
          isSaving || (visibilityModal === "publish" && !canPublish)
        }
        statusModalConfirmLabel={
          visibilityModal === "publish" ? "Confirm Publish" : "Confirm Unpublish"
        }
        onCloseStatusModal={() => setVisibilityModal(null)}
        onConfirmStatusAction={() => {
          void handleSave(visibilityModal === "publish");
          setVisibilityModal(null);
        }}
        onClose={() => setIsEditing(true)}
        modeTitle="My Shop"
        actionLabel="Edit"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-bold">Manage Your Shop</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Visibility</p>
            <p className="text-base font-medium text-gray-900">
              {isPublished ? "Published" : "Draft"}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="text-sm text-gray-600">
              Published shops appear on the public site and can be featured once setup is complete.
            </p>
            <button
              onClick={() => setVisibilityModal(isPublished ? "unpublish" : "publish")}
              disabled={isSaving}
              className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 cursor-pointer ${
                isPublished
                  ? "border border-brand-primary bg-white text-brand-primary hover:border-brand-secondary hover:text-brand-secondary"
                  : "bg-brand-primary text-white hover:bg-brand-secondary"
              }`}
            >
              {isPublished ? "Unpublish Shop" : "Publish Shop"}
            </button>
          </div>
        </div>
      </div>

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

        {/* Delivery */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={shopData.hasDelivery}
              onChange={(e) =>
                setShopData({ ...shopData, hasDelivery: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="font-medium">Delivery available</span>
          </label>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="font-semibold">Categories</h2>

        <div className="flex flex-wrap gap-3">
          {dedupeCategories([
            ...categoryOptions.map((category) => category.name),
            ...shopData.categories,
          ]).map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={shopData.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
          {isCategoriesLoading && (
            <p className="text-sm text-gray-500">Loading categories...</p>
          )}
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
            className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
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
                className="absolute top-2 right-2 text-white bg-black/60 p-1 px-2 rounded-full cursor-pointer"
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
          className="px-6 py-2 bg-black text-white rounded-lg cursor-pointer"
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
                  setIsPublished(originalShop.isPublished);
                }
                setIsEditing(false);
                setToast("Changes discarded.");
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:opacity-60 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Image Preview */}
      <ImagePreviewModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
      {visibilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {visibilityModal === "publish" ? "Publish shop?" : "Unpublish shop?"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {visibilityModal === "publish"
                ? "Publishing makes your shop visible on the public site and allows it to qualify for featured placement."
                : "Unpublishing removes your shop from public pages and featured-shop eligibility."}
            </p>

            {visibilityModal === "publish" && (
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Publish checklist</p>
                <div className="mt-3 space-y-2">
                  {publishChecks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{check.label}</span>
                      <span className={check.ok ? "text-green-600" : "text-amber-600"}>
                        {check.ok ? "Ready" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
                {!canPublish && (
                  <p className="mt-3 text-sm text-amber-700">
                    Finish the missing setup items before publishing.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setVisibilityModal(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void handleSave(visibilityModal === "publish");
                  setVisibilityModal(null);
                }}
                disabled={isSaving || (visibilityModal === "publish" && !canPublish)}
                className={`rounded-lg px-4 py-2 text-sm text-white disabled:opacity-60 cursor-pointer ${
                  visibilityModal === "publish" ? "bg-brand-primary hover:bg-brand-secondary" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {visibilityModal === "publish" ? "Confirm Publish" : "Confirm Unpublish"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
