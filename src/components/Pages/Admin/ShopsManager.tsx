import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/api";

interface AdminShop {
  _id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  ownerId: string;
  createdAt: string;
}

export default function ShopsManager() {
  const { getAccessTokenSilently } = useAuth();
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [message]);

  const loadShops = async () => {
    try {
      const res = await apiFetch("/api/shops/admin", { method: "GET" }, getAccessTokenSilently);
      if (!res.ok) throw new Error("Failed to load shops");
      const data = await res.json();
      setShops(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load shops.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadShops();
  }, []);

  const handleTogglePublish = async (shop: AdminShop) => {
    try {
      setIsBusy(true);
      const res = await apiFetch(
        `/api/shops/${shop._id}/publish`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !shop.isPublished }),
        },
        getAccessTokenSilently
      );
      if (!res.ok) throw new Error("Failed to update shop");
      setShops((prev) =>
        prev.map((s) => (s._id === shop._id ? { ...s, isPublished: !s.isPublished } : s))
      );
      setMessage(`"${shop.name}" ${shop.isPublished ? "unpublished" : "published"}.`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to update shop.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (shop: AdminShop) => {
    try {
      setIsBusy(true);
      const res = await apiFetch(
        `/api/shops/${shop._id}`,
        { method: "DELETE" },
        getAccessTokenSilently
      );
      if (!res.ok) throw new Error("Failed to delete shop");
      setShops((prev) => prev.filter((s) => s._id !== shop._id));
      setMessage(`"${shop.name}" deleted.`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete shop.");
    } finally {
      setIsBusy(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">All Shops</h2>
        <p className="text-sm text-gray-600">Publish, unpublish, or delete any shop on the platform.</p>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 shadow-md text-gray-600">Loading shops...</div>
      ) : shops.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md text-gray-500">No shops found.</div>
      ) : (
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Shop</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops.map((shop) => (
                <tr key={shop._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{shop.name}</p>
                    <p className="text-xs text-gray-400">{shop.slug}</p>
                    <span className={`mt-1 inline-block sm:hidden text-xs font-medium px-2 py-0.5 rounded-full ${
                      shop.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {shop.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      shop.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {shop.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => void handleTogglePublish(shop)}
                        disabled={isBusy}
                        className={`rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-50 cursor-pointer ${
                          shop.isPublished
                            ? "border border-gray-300 text-gray-700 hover:border-gray-400"
                            : "bg-brand-primary text-white hover:bg-brand-secondary"
                        }`}
                      >
                        {shop.isPublished ? "Unpublish" : "Publish"}
                      </button>

                      {confirmDeleteId === shop._id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-600 font-medium">Delete?</span>
                          <button
                            onClick={() => void handleDelete(shop)}
                            disabled={isBusy}
                            className="rounded px-2 py-1 text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded px-2 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(shop._id)}
                          disabled={isBusy}
                          className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white">
          {message}
        </div>
      )}
    </section>
  );
}
