import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/api";
import { saveImages } from "../../../services/imageService";
import ImageUploader from "../../Shared/ImageUploader";
import ImagePreviewModal from "../../Shared/ImagePreviewModal";

interface ShopOption {
  id: string;
  name: string;
  slug: string;
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
}

type FeaturedShopsMode = "manual" | "random_daily";

export default function FeaturedShopsManager() {
  const { getAccessTokenSilently } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [featuredMode, setFeaturedMode] = useState<FeaturedShopsMode>("manual");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

      setItems(
        Array.isArray(itemsData)
          ? itemsData.map((item: any) => ({
              id: item._id,
              shopId: item.shopId?._id || "",
              shopName: item.shopId?.name || "Unknown shop",
              url: item.image?.url || "",
              order: item.order,
              isActive: item.isActive ?? true,
            }))
          : []
      );

      setShops(
        Array.isArray(shopsData)
          ? shopsData
              .filter(
                (shop: any) =>
                  shop?.id && shop?.name && shop?.slug
              )
              .map((shop: any) => ({
                id: shop.id,
                name: shop.name,
                slug: shop.slug,
                eligible: Boolean(shop.eligible),
                reasons: Array.isArray(shop.reasons) ? shop.reasons : [],
                isPublished: shop.isPublished,
              }))
          : []
      );

      setFeaturedMode(
        settingsData?.featuredShopsMode === "random_daily"
          ? "random_daily"
          : "manual"
      );
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

  const updateFeaturedMode = async (mode: FeaturedShopsMode) => {
    setFeaturedMode(mode);

    try {
      const res = await apiFetch(
        "/api/homepage-settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featuredShopsMode: mode }),
        },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to update featured shop mode");
      }

      setMessage(
        mode === "manual"
          ? "Featured shops now use manual order."
          : "Featured shops now use daily random rotation."
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to update featured shop mode.");
      await loadData();
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!selectedShopId) {
      setMessage("Select a shop before uploading.");
      return;
    }

    const file = files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const createRes = await apiFetch(
        "/api/featured-shops",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shopId: selectedShopId }),
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

      await saveImages(
        {
          files: [file],
          entityType: "featured-shop",
          entityId: createdItem._id,
          imageType: "featured-shop",
        },
        getAccessTokenSilently
      );

      setSelectedShopId("");
      await loadData();
      setMessage("Featured shop added.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to add featured shop.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    const normalizedOrder = Number.isFinite(newOrder) && newOrder > 0 ? newOrder : 1;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, order: normalizedOrder } : item
      )
    );

    try {
      const res = await apiFetch(
        `/api/featured-shops/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: normalizedOrder }),
        },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to update featured shop order");
      }

      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to update featured shop order.");
      await loadData();
    }
  };

  const toggleItem = async (id: string, isActive: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive } : item
      )
    );

    try {
      const res = await apiFetch(
        `/api/featured-shops/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to update featured shop");
      }

      setMessage("Featured shop updated.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update featured shop.");
      await loadData();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(
        `/api/featured-shops/${id}`,
        { method: "DELETE" },
        getAccessTokenSilently
      );

      if (!res.ok) {
        throw new Error("Failed to delete featured shop");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      await loadData();
      setMessage("Featured shop deleted.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete featured shop.");
    }
  };

  return (
    <section className="mb-16">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Featured Shops</h2>
          <p className="text-sm text-gray-600">
            Choose how featured shops are ordered, then upload images for the shops you want to feature.
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

          <ImageUploader
            label={isUploading ? "Uploading..." : "Upload Featured Image"}
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

      {!isLoading && items.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md text-gray-600">
          No featured shops yet. Select a published shop and upload an image to add one.
        </div>
      ) : null}

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
              onChange={() => void updateFeaturedMode("manual")}
            />
            Manual order
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="featured-mode"
              checked={featuredMode === "random_daily"}
              onChange={() => void updateFeaturedMode("random_daily")}
            />
            Daily random
          </label>
        </div>
      </div>

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
