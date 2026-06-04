import { useEffect, useMemo, useState } from "react";
import { saveImages } from "../../../services/imageService";
import { apiFetch } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";
import ShopPreviewPage from "./ShopPreviewPage";

interface EditorProduct {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  isFeatured: boolean;
  images: { url: string; publicId: string }[];
}

interface ProductDraft {
  name: string;
  price: string;
  description: string;
  isFeatured: boolean;
  files: File[];
  previews: string[];
}

interface CategoryOption {
  name: string;
  slug: string;
}

const PRODUCT_IMAGE_LIMIT = 20;

const emptyDraft = (): ProductDraft => ({
  name: "",
  price: "",
  description: "",
  isFeatured: false,
  files: [],
  previews: [],
});

const dedupeCategories = (categories: string[]) => {
  const seen = new Set<string>();
  return categories.filter((category) => {
    const normalized = category.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

export default function ShopEditorPage() {
  const { getAccessTokenSilently, user } = useAuth();

  const [shopData, setShopData] = useState({
    name: "",
    description: "",
    location: "",
    hasDelivery: false,
    categories: [] as string[],
    contact: {
      phone: "",
      email: "",
      address: "",
      instagram: "",
      facebook: "",
      whatsapp: "",
      tiktok: "",
    },
  });
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hero, setHero] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [products, setProducts] = useState<EditorProduct[]>([]);
  const [newDraft, setNewDraft] = useState<ProductDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft>(emptyDraft());
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [productImageIndex, setProductImageIndex] = useState<Record<string, number>>({});

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showPreviewPage, setShowPreviewPage] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [visibilityModal, setVisibilityModal] = useState<"publish" | "unpublish" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<{ _id: string; email: string; subscribedAt: string }[]>([]);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [confirmDeleteSubscriber, setConfirmDeleteSubscriber] = useState<string | null>(null);

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!shopId) return;
    try {
      await apiFetch(`/api/subscriptions/${shopId}/${subscriberId}`, { method: "DELETE" }, getAccessTokenSilently);
      setSubscribers((prev) => prev.filter((s) => s._id !== subscriberId));
    } catch {
      setToast("Failed to remove subscriber.");
    }
  };
  const [isEditing, setIsEditing] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [imageLimitWarning, setImageLimitWarning] = useState(false);

  const [originalShop, setOriginalShop] = useState<{
    data: typeof shopData;
    logo: string | null;
    hero: string | null;
    isPublished: boolean;
  } | null>(null);

  // --- Upload handlers ---

  const handleLogoUpload = (files: File[]) => {
    setLogoFile(files[0]);
    setLogo(URL.createObjectURL(files[0]));
  };

  const handleHeroUpload = (files: File[]) => {
    setHeroFile(files[0]);
    setHero(URL.createObjectURL(files[0]));
  };

  // --- Category handling ---

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

  const updateContactField = (field: string, value: string) => {
    setShopData({
      ...shopData,
      contact: { ...shopData.contact, [field]: value },
    });
  };

  // --- Product handlers ---

  const loadProducts = async (sid: string) => {
    try {
      const res = await apiFetch(`/api/products/shop/${sid}`, { method: "GET" });
      if (res.ok) setProducts(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProduct = async () => {
    const name = newDraft.name.trim();
    if (!name || !shopId) return;

    const currentTotal = products.reduce((sum, p) => sum + p.images.length, 0);
    if (newDraft.files.length > 0 && currentTotal + newDraft.files.length > PRODUCT_IMAGE_LIMIT) {
      setImageLimitWarning(true);
      setToast(`You've reached the ${PRODUCT_IMAGE_LIMIT}-image limit. Contact us to upgrade your storage.`);
      return;
    }

    try {
      setIsProductSaving(true);
      const price = newDraft.price.trim() !== "" ? Number(newDraft.price) : undefined;

      const res = await apiFetch(
        "/api/products",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shopId,
            name,
            description: newDraft.description || undefined,
            price: Number.isFinite(price) ? price : undefined,
            isFeatured: newDraft.isFeatured,
          }),
        },
        getAccessTokenSilently
      );

      if (!res.ok) throw new Error("Failed to create product");

      const created: EditorProduct = await res.json();

      if (newDraft.files.length > 0) {
        await saveImages(
          {
            files: newDraft.files,
            entityType: "product",
            entityId: created._id,
            imageType: "product",
          },
          getAccessTokenSilently
        );
      }

      await loadProducts(shopId);
      setNewDraft(emptyDraft());
      setToast("Product added.");
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : null;
      setToast(msg ? `${msg} — no changes were saved.` : "Something went wrong. No changes were saved.");
    } finally {
      setIsProductSaving(false);
    }
  };

  const startEdit = (product: EditorProduct) => {
    setEditingId(product._id);
    setEditDraft({
      name: product.name,
      price: product.price !== undefined ? String(product.price) : "",
      description: product.description ?? "",
      isFeatured: product.isFeatured,
      files: [],
      previews: [],
    });
  };

  const handleSaveProduct = async () => {
    if (!editingId || !shopId) return;

    const currentTotal = products.reduce((sum, p) => sum + p.images.length, 0);
    if (editDraft.files.length > 0 && currentTotal + editDraft.files.length > PRODUCT_IMAGE_LIMIT) {
      setImageLimitWarning(true);
      setToast(`You've reached the ${PRODUCT_IMAGE_LIMIT}-image limit. Contact us to upgrade your storage.`);
      return;
    }

    try {
      setIsProductSaving(true);

      // Upload images first — if this fails, product info is NOT saved
      if (editDraft.files.length > 0) {
        await saveImages(
          {
            files: editDraft.files,
            entityType: "product",
            entityId: editingId,
            imageType: "product",
          },
          getAccessTokenSilently
        );
      }

      const price = editDraft.price.trim() !== "" ? Number(editDraft.price) : null;
      await apiFetch(
        `/api/products/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editDraft.name.trim(),
            description: editDraft.description || undefined,
            price: Number.isFinite(price) ? price : null,
            isFeatured: editDraft.isFeatured,
          }),
        },
        getAccessTokenSilently
      );

      await loadProducts(shopId);
      setEditingId(null);
      setEditDraft(emptyDraft());
      setToast("Product updated.");
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : null;
      setToast(msg ? `${msg} — no changes were saved.` : "Something went wrong. No changes were saved.");
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!shopId) return;
    try {
      await apiFetch(
        `/api/products/${productId}`,
        { method: "DELETE" },
        getAccessTokenSilently
      );
      await loadProducts(shopId);
      setToast("Product deleted.");
    } catch (error) {
      console.error(error);
      setToast("Failed to delete product.");
    }
  };

  const handleDeleteProductImage = async (productId: string, publicId: string) => {
    if (!shopId) return;
    try {
      await apiFetch(
        `/api/products/${productId}/images/${encodeURIComponent(publicId)}`,
        { method: "DELETE" },
        getAccessTokenSilently
      );
      await loadProducts(shopId);
    } catch (error) {
      console.error(error);
      setToast("Failed to delete image.");
    }
  };

  // --- Data loading ---

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const res = await apiFetch("/api/categories", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch categories");

        const categories = await res.json();
        if (!isMounted) return;

        setCategoryOptions(
          Array.isArray(categories)
            ? categories
                .filter(
                  (c: any) => typeof c?.name === "string" && typeof c?.slug === "string"
                )
                .map((c: any) => ({ name: c.name, slug: c.slug }))
            : []
        );
      } catch (error) {
        console.error(error);
        if (isMounted) setToast("Failed to load categories.");
      } finally {
        if (isMounted) setIsCategoriesLoading(false);
      }
    };

    const loadShop = async () => {
      try {
        const res = await apiFetch("/api/shops/me", { method: "GET" }, getAccessTokenSilently);

        if (!res.ok) {
          if (res.status === 404) {
            if (isMounted) { setIsEditing(true); setOriginalShop(null); }
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
                shop.categories.filter((v: unknown): v is string => typeof v === "string")
              )
            : [],
          contact: {
            phone: shop.contact?.phone || "",
            email: shop.contact?.email || "",
            address: shop.contact?.address || "",
            instagram: shop.contact?.instagram || "",
            facebook: shop.contact?.facebook || "",
            whatsapp: shop.contact?.whatsapp || "",
            tiktok: shop.contact?.tiktok || "",
          },
        };

        setShopData(nextShopData);

        const logoUrl = typeof shop.logo === "string" ? shop.logo : shop.logo?.url;
        const heroUrl = typeof shop.heroImage === "string" ? shop.heroImage : shop.heroImage?.url;

        if (logoUrl) setLogo(logoUrl);
        if (heroUrl) setHero(heroUrl);

        setOriginalShop({
          data: nextShopData,
          logo: logoUrl || null,
          hero: heroUrl || null,
          isPublished: Boolean(shop.isPublished),
        });

        await loadProducts(shop._id);

        const subRes = await apiFetch(`/api/subscriptions/${shop._id}`, { method: "GET" }, getAccessTokenSilently);
        if (subRes.ok && isMounted) setSubscribers(await subRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadShop();
    void loadCategories();

    return () => { isMounted = false; };
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
    ],
    [logo, shopData.categories.length, shopData.description, shopData.name]
  );

  const canPublish = publishChecks.every((check) => check.ok);

  // --- Shop save ---

  const handleSave = async (nextPublished = isPublished) => {
    try {
      setIsSaving(true);
      let nextLogo = logo;
      let nextHero = hero;

      const payload = {
        name: shopData.name,
        description: shopData.description,
        location: shopData.location,
        hasDelivery: shopData.hasDelivery,
        categories: shopData.categories,
        contact: shopData.contact,
        isPublished: nextPublished,
        ownerEmail: user?.email ?? undefined,
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

      if (!res.ok) throw new Error("Failed to save shop");

      const savedShop = await res.json();
      const currentShopId = savedShop._id || shopId;
      if (!shopId) setShopId(currentShopId);

      if (logoFile) {
        const uploaded = await saveImages(
          { files: [logoFile], entityType: "shop", entityId: currentShopId, imageType: "shop-logo" },
          getAccessTokenSilently
        );
        const uploadedUrl = uploaded?.[0]?.url;
        if (uploadedUrl) { nextLogo = uploadedUrl; setLogo(uploadedUrl); }
        setLogoFile(null);
      }

      if (heroFile) {
        const uploaded = await saveImages(
          { files: [heroFile], entityType: "shop", entityId: currentShopId, imageType: "shop-hero" },
          getAccessTokenSilently
        );
        const uploadedUrl = uploaded?.[0]?.url;
        if (uploadedUrl) { nextHero = uploadedUrl; setHero(uploadedUrl); }
        setHeroFile(null);
      }

      const refreshedShopRes = await apiFetch("/api/shops/me", { method: "GET" }, getAccessTokenSilently);
      if (!refreshedShopRes.ok) throw new Error("Failed to refresh shop");

      const refreshedShop = await refreshedShopRes.json();
      const refreshedLogo = typeof refreshedShop.logo === "string" ? refreshedShop.logo : refreshedShop.logo?.url;
      const refreshedHero = typeof refreshedShop.heroImage === "string" ? refreshedShop.heroImage : refreshedShop.heroImage?.url;

      nextLogo = refreshedLogo || nextLogo;
      nextHero = refreshedHero || nextHero;
      setLogo(nextLogo);
      setHero(nextHero);
      setIsPublished(Boolean(refreshedShop.isPublished));
      setOriginalShop({
        data: shopData,
        logo: nextLogo,
        hero: nextHero,
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

  // --- Render ---

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
        products={products}
        statusLabel={isPublished ? "Published" : "Draft"}
        onClose={() => setShowPreviewPage(false)}
      />
    );
  }

  if (!isEditing && shopId) {
    return (
      <>
        <ShopPreviewPage
          data={shopData}
          logo={logo}
          hero={hero}
          products={products}
          statusLabel={isPublished ? "Published" : "Draft"}
          statusActionLabel={isPublished ? "Unpublish" : "Publish"}
          onStatusAction={() => setVisibilityModal(isPublished ? "unpublish" : "publish")}
          statusModalOpen={Boolean(visibilityModal)}
          statusModalTitle={visibilityModal === "publish" ? "Publish shop?" : "Unpublish shop?"}
          statusModalDescription={
            visibilityModal === "publish"
              ? "Publishing makes your shop visible on the public site and allows it to qualify for featured placement."
              : "Unpublishing removes your shop from public pages and featured-shop eligibility."
          }
          statusChecklist={visibilityModal === "publish" ? publishChecks : undefined}
          statusModalDisabled={isSaving || (visibilityModal === "publish" && !canPublish)}
          statusModalConfirmLabel={visibilityModal === "publish" ? "Confirm Publish" : "Confirm Unpublish"}
          onCloseStatusModal={() => setVisibilityModal(null)}
          onConfirmStatusAction={() => {
            void handleSave(visibilityModal === "publish");
            setVisibilityModal(null);
          }}
          onClose={() => setIsEditing(true)}
          modeTitle="My Space"
          actionLabel="Edit"
          onViewSubscribers={() => setShowSubscribers(true)}
        />

        {showSubscribers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Subscribers ({subscribers.length})</h2>
                <button onClick={() => { setShowSubscribers(false); setConfirmDeleteSubscriber(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl leading-none">✕</button>
              </div>
              {subscribers.length === 0 ? (
                <p className="text-sm text-gray-400">No subscribers yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {subscribers.map((sub) => (
                    <li key={sub.email} className="flex items-center justify-between py-2 text-sm gap-2">
                      <span className="text-gray-800 truncate">{sub.email}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {confirmDeleteSubscriber === sub._id ? (
                          <>
                            <span className="text-gray-500 text-xs">Remove?</span>
                            <button
                              onClick={() => { void handleDeleteSubscriber(sub._id); setConfirmDeleteSubscriber(null); }}
                              className="text-red-500 hover:text-red-700 cursor-pointer text-xs font-medium"
                            >Yes</button>
                            <button
                              onClick={() => setConfirmDeleteSubscriber(null)}
                              className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
                            >Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-400 text-xs">{new Date(sub.subscribedAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => setConfirmDeleteSubscriber(sub._id)}
                              className="text-red-400 hover:text-red-600 cursor-pointer text-xs"
                            >Remove</button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Manage Your Shop</h1>
        <p className="text-sm text-gray-400"><span className="text-red-500">*</span> Required to publish</p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Shop Info + Contact — single grid so all labels share the same column */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-x-6 gap-y-4">
              <label className="font-medium sm:pt-2">Shop Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={shopData.name}
                onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
              />
              <label className="font-medium sm:pt-2">Description <span className="text-red-500">*</span></label>
              <textarea
                rows={3}
                className="w-full border rounded-lg p-2"
                value={shopData.description}
                onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
              />
              <label className="font-medium sm:pt-2">Location</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={shopData.location}
                onChange={(e) => setShopData({ ...shopData, location: e.target.value })}
              />
              <span className="hidden sm:block" />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shopData.hasDelivery}
                  onChange={(e) => setShopData({ ...shopData, hasDelivery: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-medium">Delivery available</span>
              </label>

              <div className="sm:col-span-2 border-t border-gray-100 pt-2">
                <h2 className="font-semibold">Contact Information</h2>
              </div>

              {(["phone", "email", "address", "instagram", "facebook", "whatsapp", "tiktok"] as const).map((field) => (
                <div key={field} className="contents">
                  <label className="font-medium sm:pt-2">
                    {field === "phone" ? "Phone Number" : field === "whatsapp" ? "WhatsApp" : field === "tiktok" ? "TikTok" : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2"
                    value={shopData.contact[field]}
                    onChange={(e) => updateContactField(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Categories <span className="text-red-500">*</span></h2>
            <div className="flex flex-wrap gap-3">
              {dedupeCategories([
                ...categoryOptions.map((c) => c.name),
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
              {isCategoriesLoading && <p className="text-sm text-gray-500">Loading categories...</p>}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h2 className="font-semibold">Products</h2>
              {!shopId && (
                <p className="text-sm text-gray-500">Save your shop info first to start adding products.</p>
              )}
              {shopId && (<>

              {/* Add product form */}
              <div className="rounded-xl border border-dashed border-gray-300 p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Add a product</p>
                <input
                  type="text"
                  placeholder="Product name *"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={newDraft.name}
                  onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-32 border rounded-lg p-2 text-sm"
                    value={newDraft.price}
                    onChange={(e) => setNewDraft({ ...newDraft, price: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDraft.isFeatured}
                      onChange={(e) => setNewDraft({ ...newDraft, isFeatured: e.target.checked })}
                    />
                    Featured
                  </label>
                </div>
                <textarea
                  rows={2}
                  placeholder="Description"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={newDraft.description}
                  onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    {products.reduce((sum, p) => sum + p.images.length, 0) >= PRODUCT_IMAGE_LIMIT ? (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        You've reached the 20-image limit. <a href="/contact" className="underline font-medium">Contact us</a> to upgrade your storage.
                      </p>
                    ) : (
                      <>
                        <ImageUploader
                          label="Add Images"
                          multiple={true}
                          onUpload={(newFiles) =>
                            setNewDraft((prev) => ({
                              ...prev,
                              files: [...prev.files, ...newFiles],
                              previews: [...prev.previews, ...newFiles.map((f) => URL.createObjectURL(f))],
                            }))
                          }
                        />
                        <p className="text-xs text-gray-400 mt-3">Square or landscape, max 2 MB each</p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => void handleAddProduct()}
                    disabled={isProductSaving || !newDraft.name.trim()}
                    className="rounded-lg bg-brand-primary px-4 py-2 text-sm text-white hover:bg-brand-secondary disabled:opacity-50 cursor-pointer"
                  >
                    {isProductSaving ? "Saving..." : "Add Product"}
                  </button>
                </div>
                {(imageLimitWarning || products.reduce((sum, p) => sum + p.images.length, 0) >= PRODUCT_IMAGE_LIMIT) && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    You've reached the {PRODUCT_IMAGE_LIMIT}-image limit. <a href="/contact" className="underline font-medium">Contact us</a> to upgrade your storage.
                  </p>
                )}
                {newDraft.previews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newDraft.previews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        onClick={() => setPreviewSrc(src)}
                        className="w-16 h-16 object-cover rounded-md cursor-pointer border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product list */}
              {products.length === 0 ? (
                <p className="text-sm text-gray-500">No products yet. Add your first product above.</p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product._id} className="rounded-xl border border-gray-200 p-4">
                      {editingId === product._id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="w-full border rounded-lg p-2 text-sm"
                            value={editDraft.name}
                            onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                          />
                          <div className="flex gap-3">
                            <input
                              type="number"
                              placeholder="Price"
                              className="w-32 border rounded-lg p-2 text-sm"
                              value={editDraft.price}
                              onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })}
                            />
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editDraft.isFeatured}
                                onChange={(e) => setEditDraft({ ...editDraft, isFeatured: e.target.checked })}
                              />
                              Featured
                            </label>
                          </div>
                          <textarea
                            rows={2}
                            className="w-full border rounded-lg p-2 text-sm"
                            value={editDraft.description}
                            onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                          />

                          {/* Existing images */}
                          {product.images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {product.images.map((img) => (
                                <div key={img.publicId} className="relative">
                                  <img src={img.url} className="w-20 h-20 object-cover rounded-md" />
                                  <button
                                    onClick={() => void handleDeleteProductImage(product._id, img.publicId)}
                                    className="absolute -top-1 -right-1 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {products.reduce((sum, p) => sum + p.images.length, 0) >= PRODUCT_IMAGE_LIMIT ? (
                            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                              You've reached the 20-image limit. <a href="/contact" className="underline font-medium">Contact us</a> to upgrade your storage.
                            </p>
                          ) : (
                            <>
                              <ImageUploader
                                label="Add more images"
                                multiple={true}
                                onUpload={(newFiles) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    files: [...prev.files, ...newFiles],
                                    previews: [...prev.previews, ...newFiles.map((f) => URL.createObjectURL(f))],
                                  }))
                                }
                              />
                              <p className="text-xs text-gray-400 mt-3">Square or landscape, max 2 MB each</p>
                            </>
                          )}
                          {editDraft.previews.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {editDraft.previews.map((src, i) => (
                                <img
                                  key={i}
                                  src={src}
                                  onClick={() => setPreviewSrc(src)}
                                  className="w-16 h-16 object-cover rounded-md cursor-pointer border border-gray-200"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => void handleSaveProduct()}
                              disabled={isProductSaving || !editDraft.name.trim()}
                              className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm text-white hover:bg-brand-secondary disabled:opacity-50 cursor-pointer"
                            >
                              {isProductSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditDraft(emptyDraft()); }}
                              className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          {product.images.length > 0 && (
                            <div className="relative flex-shrink-0 w-20 h-20">
                              <img
                                src={product.images[productImageIndex[product._id] ?? 0]?.url}
                                className="w-20 h-20 object-cover rounded-md cursor-pointer"
                                onClick={() => setPreviewSrc(product.images[productImageIndex[product._id] ?? 0]?.url)}
                              />
                              {product.images.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setProductImageIndex((prev) => {
                                        const cur = prev[product._id] ?? 0;
                                        return { ...prev, [product._id]: (cur - 1 + product.images.length) % product.images.length };
                                      });
                                    }}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white text-xs px-1 rounded cursor-pointer leading-none py-1"
                                  >‹</button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setProductImageIndex((prev) => {
                                        const cur = prev[product._id] ?? 0;
                                        return { ...prev, [product._id]: (cur + 1) % product.images.length };
                                      });
                                    }}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white text-xs px-1 rounded cursor-pointer leading-none py-1"
                                  >›</button>
                                  <span className="absolute bottom-0 left-0 right-0 text-center text-white text-[10px] bg-black/40 rounded-b-md leading-4">
                                    {(productImageIndex[product._id] ?? 0) + 1}/{product.images.length}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                {typeof product.price === "number" && (
                                  <p className="text-brand-primary text-sm">${product.price}</p>
                                )}
                                {product.isFeatured && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>
                                )}
                                {product.description && (
                                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => startEdit(product)}
                                  className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer border rounded px-2 py-1"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => void handleDeleteProduct(product._id)}
                                  className="text-sm text-red-600 hover:text-red-800 cursor-pointer border border-red-200 rounded px-2 py-1"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          </div>

        </div> {/* end left column */}

        {/* Right column */}
        <div className="space-y-6">

          {/* Visibility */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
            <h2 className="font-semibold">Visibility</h2>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {isPublished ? "Published" : "Draft"}
              </span>
              <button
                onClick={() => setVisibilityModal(isPublished ? "unpublish" : "publish")}
                className={`text-sm px-3 py-1.5 rounded-lg cursor-pointer ${isPublished ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-brand-primary text-white hover:bg-brand-secondary"}`}
              >
                {isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Logo <span className="text-red-500">*</span></h2>
            <p className="text-xs text-gray-400">Square, min 200×200 px, max 1 MB</p>
            <ImageUploader label="Upload Logo" onUpload={handleLogoUpload} />
            {logo && (
              <img
                src={logo}
                alt="Logo preview"
                className="mt-3 h-24 w-24 object-contain rounded-xl border cursor-pointer"
                onClick={() => setPreviewSrc(logo)}
              />
            )}
          </div>

          {/* Hero Image */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Hero Image</h2>
            <p className="text-xs text-gray-400">Landscape 16:9, min 1200×675 px, max 3 MB</p>
            <ImageUploader label="Upload Hero" onUpload={handleHeroUpload} />
            {hero && (
              <img
                src={hero}
                alt="Hero preview"
                className="mt-3 w-full h-32 object-cover rounded-xl border cursor-pointer"
                onClick={() => setPreviewSrc(hero)}
              />
            )}
          </div>

        </div> {/* end right column */}

      </div> {/* end grid */}

      {/* Action Buttons */}
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
                  <p className="mt-3 text-sm text-amber-700">Finish the missing setup items before publishing.</p>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black px-5 py-3 text-sm text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
