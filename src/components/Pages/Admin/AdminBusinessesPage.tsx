import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";

interface Shop {
  _id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  ownerId: string | null;
  ownerEmail?: string;
  categories: string[];
  createdAt: string;
}

export default function AdminBusinessesPage() {
  const { getAccessTokenSilently } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await apiFetch("/api/shops/admin", { method: "GET" }, getAccessTokenSilently);
      if (res.ok) setShops(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAssign = async (shopId: string) => {
    if (!assignEmail.trim()) { setToast("Please enter an email."); return; }
    setIsSaving(true);
    try {
      const res = await apiFetch(
        `/api/shops/${shopId}/assign-owner`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerEmail: assignEmail.trim() }),
        },
        getAccessTokenSilently
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to assign owner");
      }
      setToast("Owner email assigned.");
      setAssigningId(null);
      setAssignEmail("");
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to assign owner.");
    } finally {
      setIsSaving(false);
    }
  };

  const unclaimedCount = shops.filter((s) => !s.ownerId).length;

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Businesses</h1>
          {unclaimedCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">{unclaimedCount} unclaimed business{unclaimedCount > 1 ? "es" : ""}</p>
          )}
        </div>
        <Link
          to="/admin/create-business"
          className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm hover:bg-brand-secondary cursor-pointer"
        >
          + Create Business
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : shops.length === 0 ? (
        <p className="text-gray-500">No businesses yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops.map((shop) => (
                <tr key={shop._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{shop.name}</p>
                    <p className="text-xs text-gray-400">{shop.categories.slice(0, 3).join(", ")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${shop.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {shop.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {shop.ownerId ? (
                      <span className="text-green-600 text-xs font-medium">Claimed</span>
                    ) : shop.ownerEmail ? (
                      <span className="text-amber-600 text-xs">{shop.ownerEmail} (pending)</span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No owner</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!shop.ownerId && (
                      assigningId === shop._id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <input
                            type="email"
                            placeholder="owner@email.com"
                            className="border rounded-lg px-2 py-1 text-xs w-44"
                            value={assignEmail}
                            onChange={(e) => setAssignEmail(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") void handleAssign(shop._id); }}
                            autoFocus
                          />
                          <button
                            onClick={() => void handleAssign(shop._id)}
                            disabled={isSaving}
                            className="text-xs px-3 py-1 bg-brand-primary text-white rounded-lg cursor-pointer disabled:opacity-50"
                          >
                            {isSaving ? "..." : "Assign"}
                          </button>
                          <button
                            onClick={() => { setAssigningId(null); setAssignEmail(""); }}
                            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAssigningId(shop._id); setAssignEmail(shop.ownerEmail ?? ""); }}
                          className="text-xs text-brand-secondary hover:underline cursor-pointer"
                        >
                          Assign Owner
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
