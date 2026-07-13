import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/api";
import { saveImages } from "../../../services/imageService";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";

interface ShopOption {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  eligible: boolean;
  reasons: string[];
  isPublished?: boolean;
}

interface MediaItem {
  id: string;
  shopId: string;
  shopName: string;
  url: string;
  order: number;
  isActive: boolean;
  file: File | null;
  isNew: boolean;
}

type FeaturedShopsMode = "default" | "manual" | "random_daily";

const cloneItems = (items: MediaItem[]) =>
  items.map((item) => ({ ...item, file: item.file ?? null }));

export default function FeaturedShopsManager() {
  const { getAccessTokenSilently } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [originalItems, setOriginalItems] = useState<MediaItem[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [featuredMode, setFeaturedMode] = useState<FeaturedShopsMode>("default");
  const [originalFeaturedMode, setOriginalFeaturedMode] =
    useState<FeaturedShopsMode>("default");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    if (deletedItemIds.length > 0) return true;
    if (featuredMode !== originalFeaturedMode) return true;
    if (items.length !== originalItems.length) return true;

    return items.some((item, index) => {
      const original = originalItems[index];
      if (!original) return true;

      return (
        item.id !== original.id ||
        item.shopId !== original.shopId ||
        item.shopName !== original.shopName ||
        item.url !== original.url ||
        item.isActive !== original.isActive ||
        Boolean(item.file) ||
        item.isNew
      );
    });
  }, [deletedItemIds, featuredMode, items, originalFeaturedMode, originalItems]);

  const loadData = async () => {
    try {
      const [itemsRes, shopsRes, settingsRes] = await Promise.all([
        apiFetch(
          "/api/featured-shops/admin",
          { method: "GET" },
          getAccessTokenSilently
        ),
        apiFetch(
          "/api/featured-shops/eligibility",
          { method: "GET" },
          getAccessTokenSilently
        ),
        apiFetch("/api/homepage-settings", { method: "GET" }),
      ]);

      if (!itemsRes.ok) throw new Error("Failed to load featured shops");
      if (!shopsRes.ok) throw new Error("Failed to load shops");
      if (!settingsRes.ok) throw new Error("Failed to load homepage settings");

      const itemsData = await itemsRes.json();
      const shopsData = await shopsRes.json();
      const settingsData = await settingsRes.json();

      const nextItems: MediaItem[] = Array.isArray(itemsData)
        ? itemsData.map((item: any) => ({
            id: item._id,
            shopId: item.shopId?._id || "",
            shopName: item.shopId?.name || "Unknown shop",
            url: item.image?.url || item.shopId?.logo?.url || "",
            order: item.order,
            isActive: item.isActive ?? true,
            file: null,
            isNew: false,
          }))
        : [];

      setItems(cloneItems(nextItems));
      setOriginalItems(cloneItems(nextItems));
      setDeletedItemIds([]);

      setShops(
        Array.isArray(shopsData)
          ? shopsData
              .filter((shop: any) => shop?.id && shop?.name && shop?.slug)
              .map((shop: any) => ({
                id: shop.id,
                name: shop.name,
                slug: shop.slug,
                logoUrl: typeof shop.logoUrl === "string" ? shop.logoUrl : "",
                eligible: Boolean(shop.eligible),
                reasons: Array.isArray(shop.reasons) ? shop.reasons : [],
                isPublished: shop.isPublished,
              }))
          : []
      );

      const nextMode: FeaturedShopsMode =
        settingsData?.featuredShopsMode === "random_daily"
          ? "random_daily"
          : settingsData?.featuredShopsMode === "manual"
          ? "manual"
          : "default";

      setFeaturedMode(nextMode);
      setOriginalFeaturedMode(nextMode);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load featured shops.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const addDraftItem = (selectedShop: ShopOption, file?: File | null) => {
    const previewUrl = file
      ? URL.createObjectURL(file)
      : selectedShop.logoUrl || "";

    const draftItem: MediaItem = {
      id: `draft-featured-${Date.now()}`,
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      url: previewUrl,
      order: items.length + 1,
      isActive: true,
      file: file ?? null,
      isNew: true,
    };

    setItems((prev) => [...prev, draftItem]);
    setSelectedShopId("");
    setMessage(
      file
        ? "Draft featured shop added with a custom image. Save to publish changes."
        : "Draft featured shop added using the shop logo. Save to publish changes."
    );
  };

  const handleUpload = (files: File[]) => {
    if (!selectedShopId) {
      setMessage("Select a shop before adding a featured draft.");
      return;
    }

    const selectedShop = shops.find((shop) => shop.id === selectedShopId);
    const file = files[0];
    if (!file || !selectedShop) return;

    addDraftItem(selectedShop, file);
  };

  const handleAddWithLogo = () => {
    if (!selectedShopId) {
      setMessage("Select a shop before adding a featured draft.");
      return;
    }

    const selectedShop = shops.find((shop) => shop.id === selectedShopId);
    if (!selectedShop) return;

    addDraftItem(selectedShop, null);
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const next = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  const toggleItem = (id: string, isActive: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive } : item))
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.isNew && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });

    if (!id.startsWith("draft-featured-")) {
      setDeletedItemIds((prev) => [...prev, id]);
    }
  };

  const handleDiscard = () => {
    items.forEach((item) => {
      if (item.isNew && item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });

    setItems(cloneItems(originalItems));
    setDeletedItemIds([]);
    setFeaturedMode(originalFeaturedMode);
    setSelectedShopId("");
    setMessage("Featured shop changes discarded.");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await apiFetch(
        "/api/homepage-settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featuredShopsMode: featuredMode }),
        },
        getAccessTokenSilently
      );

      for (const id of deletedItemIds) {
        const res = await apiFetch(
          `/api/featured-shops/${id}`,
          { method: "DELETE" },
          getAccessTokenSilently
        );
        if (!res.ok) throw new Error("Failed to delete featured shop");
      }

      // In manual mode assign sequential positions based on current list order
      const itemsToSave =
        featuredMode === "manual"
          ? items.map((item, index) => ({ ...item, order: index + 1 }))
          : items;

      const originalById = new Map(originalItems.map((o) => [o.id, o]));

      for (const item of itemsToSave) {
        if (item.isNew) {
          const body: Record<string, unknown> = {
            shopId: item.shopId,
            isActive: item.isActive,
          };
          if (featuredMode === "manual") body.order = item.order;

          const createRes = await apiFetch(
            "/api/featured-shops",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            },
            getAccessTokenSilently
          );

          if (!createRes.ok) {
            const errorData = await createRes.json().catch(() => null);
            throw new Error(
              errorData?.reasons?.[0] ||
                errorData?.message ||
                "Failed to create featured shop"
            );
          }

          const createdItem = await createRes.json();

          if (item.file) {
            await saveImages(
              {
                files: [item.file],
                entityType: "featured-shop",
                entityId: createdItem._id,
                imageType: "featured-shop",
              },
              getAccessTokenSilently
            );
          }

          continue;
        }

        const orig = originalById.get(item.id);
        const activeChanged = !orig || item.isActive !== orig.isActive;
        const orderChanged = featuredMode === "manual" && (!orig || item.order !== orig.order);
        if (!activeChanged && !orderChanged) continue;

        const body: Record<string, unknown> = { isActive: item.isActive };
        if (featuredMode === "manual") body.order = item.order;

        const res = await apiFetch(
          `/api/featured-shops/${item.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
          getAccessTokenSilently
        );

        if (!res.ok) throw new Error("Failed to update featured shop");
      }

      await loadData();
      setMessage("Featured shop changes saved.");
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save featured shop changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-16">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Featured Shops</h2>
          <p className="text-sm text-gray-600">
            Add draft featured entries locally, then save when you are ready to publish homepage changes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id} disabled={!shop.eligible}>
                {shop.name}{shop.eligible ? "" : " - Setup incomplete"}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddWithLogo}
            disabled={isSaving || !selectedShopId}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white cursor-pointer disabled:opacity-50"
          >
            Add Using Shop Logo
          </button>
          <ImageUploader
            label={isSaving ? "Saving..." : "Add Custom Image"}
            multiple={false}
            onUpload={handleUpload}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 shadow-md text-gray-600">
          Loading featured shops...
        </div>
      ) : null}

      {!isLoading && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            {hasUnsavedChanges
              ? "You have unsaved featured-shop changes."
              : "All featured-shop changes are saved."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              disabled={!hasUnsavedChanges || isSaving}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 disabled:opacity-50 cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={!hasUnsavedChanges || isSaving}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm text-white hover:bg-brand-secondary disabled:opacity-50 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <p className="font-medium text-gray-900">Display mode</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="featured-mode"
              checked={featuredMode === "default"}
              onChange={() => setFeaturedMode("default")}
            />
            Default (creation date)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="featured-mode"
              checked={featuredMode === "manual"}
              onChange={() => setFeaturedMode("manual")}
            />
            Manual order
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="featured-mode"
              checked={featuredMode === "random_daily"}
              onChange={() => setFeaturedMode("random_daily")}
            />
            Daily random
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {featuredMode === "default" && "Shops appear in the order they were featured, oldest first."}
          {featuredMode === "manual" && "Use the arrows on each card to set the display order."}
          {featuredMode === "random_daily" && "Order is shuffled once per day and stays the same until the next day."}
        </p>
      </div>

      {!isLoading && items.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md text-gray-600">
          No featured shops yet. Add draft entries, then save to publish them.
        </div>
      ) : null}

      {!isLoading && shops.some((shop) => !shop.eligible) ? (
        <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          <p className="font-medium">Some shops cannot be featured yet:</p>
          <div className="mt-2 space-y-2">
            {shops
              .filter((shop) => !shop.eligible)
              .map((shop) => (
                <div key={shop.id}>
                  <span className="font-medium">{shop.name}:</span>{" "}
                  {shop.reasons.join(" ")}
                </div>
              ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl bg-white shadow-md"
          >
            <img
              src={item.url}
              alt={item.shopName}
              onClick={() => setPreviewImage(item.url)}
              className="h-48 w-full cursor-pointer object-contain bg-gray-100 hover:opacity-90"
            />

            <button
              onClick={() => handleDelete(item.id)}
              className="absolute right-2 top-2 rounded bg-black/50 px-2 py-1 text-sm text-white hover:bg-black/70 cursor-pointer"
            >
              X
            </button>

            <div className="space-y-3 p-3">
              {item.isNew ? (
                <p className="text-xs font-medium text-amber-700">Draft featured shop</p>
              ) : null}

              <p className="font-medium text-gray-900">{item.shopName}</p>

              <label className="flex items-center justify-between text-sm text-gray-700">
                <span>Active</span>
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(e) => toggleItem(item.id, e.target.checked)}
                />
              </label>

              {featuredMode === "manual" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Position {index + 1}</span>
                  <div className="ml-auto flex gap-1">
                    <button
                      onClick={() => moveItem(item.id, "up")}
                      disabled={index === 0}
                      className="rounded border px-2 py-1 text-sm disabled:opacity-30 cursor-pointer hover:bg-gray-100"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveItem(item.id, "down")}
                      disabled={index === items.length - 1}
                      className="rounded border px-2 py-1 text-sm disabled:opacity-30 cursor-pointer hover:bg-gray-100"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              )}
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
