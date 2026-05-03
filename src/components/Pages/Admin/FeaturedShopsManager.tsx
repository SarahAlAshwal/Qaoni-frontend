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

type FeaturedShopsMode = "manual" | "random_daily";

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
  const [featuredMode, setFeaturedMode] = useState<FeaturedShopsMode>("manual");
  const [originalFeaturedMode, setOriginalFeaturedMode] =
    useState<FeaturedShopsMode>("manual");
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
        item.order !== original.order ||
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

      if (!itemsRes.ok) {
        throw new Error("Failed to load featured shops");
      }

      if (!shopsRes.ok) {
        throw new Error("Failed to load shops");
      }

      if (!settingsRes.ok) {
        throw new Error("Failed to load homepage settings");
      }

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
          : "manual";

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

    if (!file || !selectedShop) {
      return;
    }

    addDraftItem(selectedShop, file);
  };

  const handleAddWithLogo = () => {
    if (!selectedShopId) {
      setMessage("Select a shop before adding a featured draft.");
      return;
    }

    const selectedShop = shops.find((shop) => shop.id === selectedShopId);
    if (!selectedShop) {
      return;
    }

    addDraftItem(selectedShop, null);
  };

  const updateOrder = (id: string, newOrder: number) => {
    const normalizedOrder = Number.isFinite(newOrder) && newOrder > 0 ? newOrder : 1;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, order: normalizedOrder } : item
      )
    );
  };

  const toggleItem = (id: string, isActive: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive } : item
      )
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

      const settingsRes = await apiFetch(
        "/api/homepage-settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featuredShopsMode: featuredMode }),
        },
        getAccessTokenSilently
      );

      if (!settingsRes.ok) {
        throw new Error("Failed to update featured shop mode");
      }

      for (const id of deletedItemIds) {
        const res = await apiFetch(
          `/api/featured-shops/${id}`,
          { method: "DELETE" },
          getAccessTokenSilently
        );

        if (!res.ok) {
          throw new Error("Failed to delete featured shop");
        }
      }

      for (const item of items) {
        if (item.isNew) {
          const createRes = await apiFetch(
            "/api/featured-shops",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shopId: item.shopId,
                order: item.order,
                isActive: item.isActive,
              }),
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

        const res = await apiFetch(
          `/api/featured-shops/${item.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order: item.order,
              isActive: item.isActive,
            }),
          },
          getAccessTokenSilently
        );

        if (!res.ok) {
          throw new Error("Failed to update featured shop");
        }
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
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={!hasUnsavedChanges || isSaving}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm text-white hover:bg-brand-secondary disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <p className="font-medium text-gray-900">Display mode</p>
        <p className="mt-1 text-sm text-gray-600">
          Manual uses the order values below. Daily Random keeps the same shuffled order for a full day, then rotates again the next day.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="featured-mode"
              checked={featuredMode === "manual"}
              onChange={() => setFeaturedMode("manual")}
            />
            Manual order
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="featured-mode"
              checked={featuredMode === "random_daily"}
              onChange={() => setFeaturedMode("random_daily")}
            />
            Daily random
          </label>
        </div>
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
        {items.map((item) => (
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
              className="absolute right-2 top-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm text-white hover:bg-opacity-70"
            >
              X
            </button>

            <div className="space-y-3 p-3">
              {item.isNew ? (
                <p className="text-xs font-medium text-amber-700">Draft featured shop</p>
              ) : null}

              <div>
                <p className="font-medium text-gray-900">{item.shopName}</p>
              </div>

              <label className="flex items-center justify-between text-sm text-gray-700">
                <span>Active</span>
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(e) => toggleItem(item.id, e.target.checked)}
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
                  disabled={featuredMode !== "manual"}
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
