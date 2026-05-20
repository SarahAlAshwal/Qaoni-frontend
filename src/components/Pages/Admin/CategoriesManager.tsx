import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/api";

interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  shopCount?: number;
}

export default function CategoriesManager() {
  const { getAccessTokenSilently } = useAuth();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [message]);

  const loadCategories = async () => {
    try {
      const res = await apiFetch("/api/categories", { method: "GET" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadCategories(); }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      setIsAdding(true);
      const res = await apiFetch(
        "/api/categories",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        },
        getAccessTokenSilently
      );
      if (!res.ok) throw new Error();
      const created = await res.json();
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
      setMessage("Category added.");
    } catch {
      setMessage("Failed to add category.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsBusy(true);
      const res = await apiFetch(
        `/api/categories/${id}`,
        { method: "DELETE" },
        getAccessTokenSilently
      );
      if (!res.ok) throw new Error();
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setConfirmDeleteId(null);
      setMessage("Category deleted.");
    } catch {
      setMessage("Failed to delete category.");
    } finally {
      setIsBusy(false);
    }
  };

  const pendingDelete = confirmDeleteId
    ? categories.find((c) => c._id === confirmDeleteId) ?? null
    : null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Categories</h2>

      {/* Add form */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New category name"
          className="border rounded-lg px-3 py-2 text-sm flex-1"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void handleAdd(); }}
        />
        <button
          onClick={() => void handleAdd()}
          disabled={isAdding || !newName.trim()}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-secondary disabled:opacity-50 cursor-pointer"
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium text-right">Businesses</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-right">{cat.shopCount ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setConfirmDeleteId(cat._id)}
                      className="text-red-400 hover:text-red-600 text-xs cursor-pointer"
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.startsWith("Failed") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Delete category?</h3>
            <p className="text-sm text-gray-700">
              <span className="font-medium">{pendingDelete.name}</span> is currently used by{" "}
              <span className="font-medium">{pendingDelete.shopCount ?? 0}</span>{" "}
              {(pendingDelete.shopCount ?? 0) === 1 ? "business" : "businesses"}.
              {(pendingDelete.shopCount ?? 0) > 0 && (
                <> Those businesses will keep the category label but it will no longer appear in the categories list.</>
              )}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDelete(pendingDelete._id)}
                disabled={isBusy}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isBusy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
