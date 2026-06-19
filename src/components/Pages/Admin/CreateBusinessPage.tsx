import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { saveImages } from "../../../services/imageService";
import { useAuth } from "../../../hooks/useAuth";
import ImageUploader from "../../Shared/ImageUploader";

interface CategoryOption { name: string; slug: string; }

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

const PRODUCT_IMAGE_LIMIT = 20;

const contactFields = [
  { key: "phone",     label: "Phone Number" },
  { key: "email",     label: "Email" },
  { key: "address",   label: "Address" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook",  label: "Facebook" },
  { key: "whatsapp",  label: "WhatsApp" },
  { key: "tiktok",    label: "TikTok" },
] as const;

const emptyDraft = (): ProductDraft => ({ name: "", price: "", description: "", isFeatured: false, files: [], previews: [] });

const emptyForm = () => ({
  name: "", description: "", location: "", hasDelivery: false, ownerEmail: "",
  categories: [] as string[],
  contact: { phone: "", email: "", address: "", instagram: "", facebook: "", whatsapp: "", tiktok: "" },
});

export default function CreateBusinessPage() {
  const { getAccessTokenSilently } = useAuth();
  const navigate = useNavigate();

  // Phase 1 — shop info
  const [form, setForm] = useState(emptyForm());
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Phase 2 — products (unlocked after shop is saved)
  const [shopId, setShopId] = useState<string | null>(null);
  const [products, setProducts] = useState<EditorProduct[]>([]);
  const [newDraft, setNewDraft] = useState<ProductDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft>(emptyDraft());
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [imageLimitWarning, setImageLimitWarning] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/categories").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setCategoryOptions(data.map((c: any) => ({ name: c.name, slug: c.slug })));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const setContact = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));

  const toggleCategory = (name: string) =>
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(name)
        ? prev.categories.filter((c) => c !== name)
        : [...prev.categories, name],
    }));

  // --- Shop save ---
  const handleSave = async (publish: boolean) => {
    if (!form.name.trim()) { setToast("Shop name is required."); return; }
    if (!form.description.trim()) { setToast("Description is required."); return; }
    if (form.categories.length === 0) { setToast("At least one category is required."); return; }

    setIsSaving(true);
    try {
      const res = await apiFetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isPublished: publish }),
      }, getAccessTokenSilently);

      if (!res.ok) throw new Error("Failed to create business");
      const shop = await res.json();
      const id: string = shop._id;

      if (logoFile) await saveImages({ files: [logoFile], entityType: "shop", entityId: id, imageType: "shop-logo" }, getAccessTokenSilently);
      if (heroFile) await saveImages({ files: [heroFile], entityType: "shop", entityId: id, imageType: "shop-hero" }, getAccessTokenSilently);

      setShopId(id);
      setToast("Business saved. You can now add products.");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Products ---
  const loadProducts = async (sid: string) => {
    const res = await apiFetch(`/api/products/shop/${sid}`);
    if (res.ok) setProducts(await res.json());
  };

  const handleAddProduct = async () => {
    if (!newDraft.name.trim() || !shopId) return;

    const currentTotal = products.reduce((sum, p) => sum + p.images.length, 0);
    if (newDraft.files.length > 0 && currentTotal + newDraft.files.length > PRODUCT_IMAGE_LIMIT) {
      setImageLimitWarning(true);
      setToast(`You've reached the ${PRODUCT_IMAGE_LIMIT}-image limit.`);
      return;
    }

    setIsProductSaving(true);
    try {
      const price = newDraft.price.trim() !== "" ? Number(newDraft.price) : undefined;
      const res = await apiFetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, name: newDraft.name.trim(), description: newDraft.description || undefined, price: Number.isFinite(price) ? price : undefined, isFeatured: newDraft.isFeatured }),
      }, getAccessTokenSilently);

      if (!res.ok) throw new Error("Failed to create product");
      const created: EditorProduct = await res.json();

      if (newDraft.files.length > 0) {
        await saveImages({ files: newDraft.files, entityType: "product", entityId: created._id, imageType: "product" }, getAccessTokenSilently);
      }

      await loadProducts(shopId);
      setNewDraft(emptyDraft());
      setToast("Product added.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : null;
      setToast(msg ? `${msg} — no changes were saved.` : "Something went wrong. No changes were saved.");
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingId || !shopId) return;

    const currentTotal = products.reduce((sum, p) => sum + p.images.length, 0);
    if (editDraft.files.length > 0 && currentTotal + editDraft.files.length > PRODUCT_IMAGE_LIMIT) {
      setImageLimitWarning(true);
      setToast(`You've reached the ${PRODUCT_IMAGE_LIMIT}-image limit.`);
      return;
    }

    setIsProductSaving(true);
    try {
      if (editDraft.files.length > 0) {
        await saveImages({ files: editDraft.files, entityType: "product", entityId: editingId, imageType: "product" }, getAccessTokenSilently);
      }
      const price = editDraft.price.trim() !== "" ? Number(editDraft.price) : null;
      await apiFetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editDraft.name.trim(), description: editDraft.description || undefined, price: Number.isFinite(price) ? price : null, isFeatured: editDraft.isFeatured }),
      }, getAccessTokenSilently);

      await loadProducts(shopId);
      setEditingId(null);
      setEditDraft(emptyDraft());
      setToast("Product updated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : null;
      setToast(msg ? `${msg} — no changes were saved.` : "Something went wrong. No changes were saved.");
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!shopId) return;
    await apiFetch(`/api/products/${productId}`, { method: "DELETE" }, getAccessTokenSilently);
    await loadProducts(shopId);
    setToast("Product deleted.");
  };

  const handleDeleteProductImage = async (productId: string, publicId: string) => {
    if (!shopId) return;
    await apiFetch(`/api/products/${productId}/images/${encodeURIComponent(publicId)}`, { method: "DELETE" }, getAccessTokenSilently);
    await loadProducts(shopId);
  };

  const atImageLimit = imageLimitWarning || products.reduce((sum, p) => sum + p.images.length, 0) >= PRODUCT_IMAGE_LIMIT;

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Business</h1>
        <button onClick={() => navigate("/admin/businesses")} className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">
          ← Back to Businesses
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Shop Info */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-x-6 gap-y-4">
              <label className="font-medium sm:pt-2">Shop Name <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded-lg p-2" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} disabled={!!shopId} />

              <label className="font-medium sm:pt-2">Description <span className="text-red-500">*</span></label>
              <textarea rows={3} className="w-full border rounded-lg p-2" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} disabled={!!shopId} />

              <label className="font-medium sm:pt-2">Location</label>
              <input type="text" className="w-full border rounded-lg p-2" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} disabled={!!shopId} />

              <span className="hidden sm:block" />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.hasDelivery} onChange={(e) => setForm((p) => ({ ...p, hasDelivery: e.target.checked }))} className="w-4 h-4" disabled={!!shopId} />
                <span className="font-medium">Delivery available</span>
              </label>

              <div className="sm:col-span-2 border-t border-gray-100 pt-2">
                <h2 className="font-semibold">Contact Information</h2>
              </div>
              {contactFields.map(({ key, label }) => (
                <div key={key} className="contents">
                  <label className="font-medium sm:pt-2">{label}</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={form.contact[key]} onChange={(e) => setContact(key, e.target.value)} disabled={!!shopId} />
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Categories <span className="text-red-500">*</span></h2>
            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((cat) => (
                <label key={cat.slug} className={`flex items-center gap-2 ${shopId ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                  <input type="checkbox" checked={form.categories.includes(cat.name)} onChange={() => !shopId && toggleCategory(cat.name)} disabled={!!shopId} />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Owner Email */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
            <h2 className="font-semibold">Owner Email <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
            <p className="text-sm text-gray-500">The business owner will claim this page when they log in with this email.</p>
            <input type="email" placeholder="owner@example.com" className="w-full border rounded-lg p-2" value={form.ownerEmail} onChange={(e) => setForm((p) => ({ ...p, ownerEmail: e.target.value }))} disabled={!!shopId} />
          </div>

          {/* Products — unlocked after shop is saved */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <h2 className="font-semibold">Products</h2>
            {!shopId ? (
              <p className="text-sm text-gray-500">Save the business info first to start adding products.</p>
            ) : (
              <>
                {/* Add product form */}
                <div className="rounded-xl border border-dashed border-gray-300 p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Add a product</p>
                  <input type="text" placeholder="Product name *" className="w-full border rounded-lg p-2 text-sm" value={newDraft.name} onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })} />
                  <div className="flex gap-3">
                    <input type="number" placeholder="Price" className="w-32 border rounded-lg p-2 text-sm" value={newDraft.price} onChange={(e) => setNewDraft({ ...newDraft, price: e.target.value })} />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={newDraft.isFeatured} onChange={(e) => setNewDraft({ ...newDraft, isFeatured: e.target.checked })} />
                      Featured
                    </label>
                  </div>
                  <textarea rows={2} placeholder="Description" className="w-full border rounded-lg p-2 text-sm" value={newDraft.description} onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })} />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      {atImageLimit ? (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          You've reached the {PRODUCT_IMAGE_LIMIT}-image limit. <a href="/contact" className="underline font-medium">Contact us</a> to upgrade.
                        </p>
                      ) : (
                        <>
                          <ImageUploader label="Add Images" multiple={true} onUpload={(files) => setNewDraft((prev) => ({ ...prev, files: [...prev.files, ...files], previews: [...prev.previews, ...files.map((f) => URL.createObjectURL(f))] }))} />
                          <p className="text-xs text-gray-400 mt-2">Square or landscape, max 2 MB each</p>
                        </>
                      )}
                    </div>
                    <button onClick={() => void handleAddProduct()} disabled={isProductSaving || !newDraft.name.trim()} className="rounded-lg bg-brand-primary px-4 py-2 text-sm text-white hover:bg-brand-secondary disabled:opacity-50 cursor-pointer">
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
                      {newDraft.previews.map((src, i) => <img key={i} src={src} className="w-16 h-16 object-contain bg-gray-50 rounded-md border" />)}
                    </div>
                  )}
                </div>

                {/* Product list */}
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500">No products yet.</p>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product._id} className="rounded-xl border border-gray-200 p-4">
                        {editingId === product._id ? (
                          <div className="space-y-3">
                            <input type="text" className="w-full border rounded-lg p-2 text-sm" value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} />
                            <div className="flex gap-3">
                              <input type="number" placeholder="Price" className="w-32 border rounded-lg p-2 text-sm" value={editDraft.price} onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })} />
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={editDraft.isFeatured} onChange={(e) => setEditDraft({ ...editDraft, isFeatured: e.target.checked })} />
                                Featured
                              </label>
                            </div>
                            <textarea rows={2} className="w-full border rounded-lg p-2 text-sm" value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} />
                            {product.images.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {product.images.map((img) => (
                                  <div key={img.publicId} className="relative">
                                    <img src={img.url} className="w-20 h-20 object-contain bg-gray-50 rounded-md" />
                                    <button onClick={() => void handleDeleteProductImage(product._id, img.publicId)} className="absolute -top-1 -right-1 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer">✕</button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!atImageLimit && (
                              <ImageUploader label="Add more images" multiple={true} onUpload={(files) => setEditDraft((prev) => ({ ...prev, files: [...prev.files, ...files], previews: [...prev.previews, ...files.map((f) => URL.createObjectURL(f))] }))} />
                            )}
                            <div className="flex gap-2">
                              <button onClick={() => void handleSaveProduct()} disabled={isProductSaving || !editDraft.name.trim()} className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm text-white hover:bg-brand-secondary disabled:opacity-50 cursor-pointer">{isProductSaving ? "Saving..." : "Save"}</button>
                              <button onClick={() => { setEditingId(null); setEditDraft(emptyDraft()); }} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-700 cursor-pointer">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            {product.images.length > 0 && <img src={product.images[0].url} className="w-16 h-16 object-contain bg-gray-50 rounded-md flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  {typeof product.price === "number" && <p className="text-brand-primary text-sm">${product.price}</p>}
                                  {product.isFeatured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                                  {product.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>}
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <button onClick={() => { setEditingId(product._id); setEditDraft({ name: product.name, price: product.price !== undefined ? String(product.price) : "", description: product.description ?? "", isFeatured: product.isFeatured, files: [], previews: [] }); }} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer border rounded px-2 py-1">Edit</button>
                                  <button onClick={() => void handleDeleteProduct(product._id)} className="text-sm text-red-600 hover:text-red-800 cursor-pointer border border-red-200 rounded px-2 py-1">Delete</button>
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
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Logo</h2>
            <p className="text-xs text-gray-400">Square, min 200×200 px, max 1 MB</p>
            {!shopId && <ImageUploader label="Upload Logo" multiple={false} onUpload={(files) => { setLogoFile(files[0]); setLogoPreview(URL.createObjectURL(files[0])); }} />}
            {logoPreview && <img src={logoPreview} alt="Logo preview" className="h-24 w-24 object-contain rounded-xl border" />}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Hero Image</h2>
            <p className="text-xs text-gray-400">Landscape 16:9, min 1200×675 px, max 3 MB</p>
            {!shopId && <ImageUploader label="Upload Hero" multiple={false} onUpload={(files) => { setHeroFile(files[0]); setHeroPreview(URL.createObjectURL(files[0])); }} />}
            {heroPreview && <img src={heroPreview} alt="Hero preview" className="w-full h-32 object-cover rounded-xl border" />}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex justify-end gap-3">
        {!shopId ? (
          <>
            <button onClick={() => void handleSave(false)} disabled={isSaving} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-60 cursor-pointer">
              {isSaving ? "Saving..." : "Save as Draft"}
            </button>
            <button onClick={() => void handleSave(true)} disabled={isSaving} className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:opacity-60 cursor-pointer">
              {isSaving ? "Saving..." : "Save & Publish"}
            </button>
          </>
        ) : (
          <button onClick={() => navigate("/admin/businesses")} className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary cursor-pointer">
            Done
          </button>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black px-5 py-3 text-sm text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
